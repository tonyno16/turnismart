import { eq, and, or, inArray } from "drizzle-orm";
import { format, parseISO } from "date-fns";
import { db } from "@/lib/db";
import {
  employees,
  employeeRoles,
  employeeAvailability,
  employeeIncompatibilities,
  employeeTimeOff,
  shifts,
} from "@/drizzle/schema";
import { getEmployeeWeekShifts } from "./schedules";
import { validateShiftAssignment } from "./schedule-validation";

export type SubstituteSuggestion = {
  id: string;
  name: string;
  score: number;
  weeklyHoursRemaining: number;
  shiftsThisWeek: number;
  preferredLocation: boolean;
};

function parseTimeMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export async function findBestSubstitutes(params: {
  organizationId: string;
  scheduleId: string;
  locationId: string;
  roleId: string;
  date: string;
  startTime: string;
  endTime: string;
  weekStart: string;
  excludeEmployeeId: string;
  limit?: number;
}): Promise<SubstituteSuggestion[]> {
  const limit = params.limit ?? 5;
  const dayOfWeek = Math.floor(
    (parseISO(params.date).getTime() - parseISO(params.weekStart).getTime()) /
      (24 * 60 * 60 * 1000)
  );
  const period =
    params.startTime >= "14:00"
      ? "evening"
      : "morning";

  const empRolesRows = await db
    .select({ employee_id: employeeRoles.employee_id })
    .from(employeeRoles)
    .where(eq(employeeRoles.role_id, params.roleId));

  const empIdsWithRole = new Set(empRolesRows.map((r) => r.employee_id));

  const emps = await db
    .select({
      id: employees.id,
      first_name: employees.first_name,
      last_name: employees.last_name,
      weekly_hours: employees.weekly_hours,
      max_weekly_hours: employees.max_weekly_hours,
      preferred_location_id: employees.preferred_location_id,
    })
    .from(employees)
    .where(
      and(
        eq(employees.organization_id, params.organizationId),
        eq(employees.is_active, true)
      )
    );

  const candidates = emps.filter(
    (e) =>
      empIdsWithRole.has(e.id) && e.id !== params.excludeEmployeeId
  );
  if (candidates.length === 0) return [];

  const candidateIds = candidates.map((c) => c.id);

  const avail = await db
    .select()
    .from(employeeAvailability)
    .where(inArray(employeeAvailability.employee_id, candidateIds));

  const inc = await db
    .select()
    .from(employeeIncompatibilities)
    .where(
      or(
        inArray(employeeIncompatibilities.employee_a_id, candidateIds),
        inArray(employeeIncompatibilities.employee_b_id, candidateIds)
      )
    );

  const to = await db
    .select()
    .from(employeeTimeOff)
    .where(
      and(
        eq(employeeTimeOff.status, "approved"),
        inArray(employeeTimeOff.employee_id, candidateIds)
      )
    );

  const incompatibleIds = new Set(
    inc
      .filter(
        (i) =>
          i.employee_a_id === params.excludeEmployeeId ||
          i.employee_b_id === params.excludeEmployeeId
      )
      .map((p) =>
        p.employee_a_id === params.excludeEmployeeId
          ? p.employee_b_id
          : p.employee_a_id
      )
  );

  const currentShiftEmps = await db
    .select({ employee_id: shifts.employee_id })
    .from(shifts)
    .where(
      and(
        eq(shifts.schedule_id, params.scheduleId),
        eq(shifts.location_id, params.locationId),
        eq(shifts.date, params.date),
        eq(shifts.status, "active")
      )
    );
  for (const s of currentShiftEmps) {
    for (const i of inc) {
      if (i.employee_a_id === s.employee_id) incompatibleIds.add(i.employee_b_id);
      if (i.employee_b_id === s.employee_id) incompatibleIds.add(i.employee_a_id);
    }
  }

  const scored: Array<SubstituteSuggestion & { _rawScore: number }> = [];

  for (const emp of candidates) {
    if (incompatibleIds.has(emp.id)) continue;

    const conflict = await validateShiftAssignment({
      employeeId: emp.id,
      organizationId: params.organizationId,
      scheduleId: params.scheduleId,
      locationId: params.locationId,
      roleId: params.roleId,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      weekStart: params.weekStart,
    });
    if (conflict) continue;

    const av = avail.find(
      (a) =>
        a.employee_id === emp.id &&
        a.day_of_week === dayOfWeek &&
        a.shift_period === period
    );
    if (av?.status === "unavailable") continue;

    const toDates = to
      .filter((t) => t.employee_id === emp.id)
      .flatMap((t) => {
        const start = parseISO(t.start_date);
        const end = parseISO(t.end_date);
        const dates: string[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(format(d, "yyyy-MM-dd"));
        }
        return dates;
      });
    if (toDates.includes(params.date)) continue;

    const weekShifts = await getEmployeeWeekShifts(
      emp.id,
      params.weekStart,
      params.scheduleId
    );
    const shiftDuration =
      (parseTimeMinutes(params.endTime) - parseTimeMinutes(params.startTime)) /
      60;
    const currentHours = weekShifts.reduce(
      (sum, s) =>
        sum +
        (parseTimeMinutes(s.end_time) - parseTimeMinutes(s.start_time)) / 60,
      0
    );
    const hoursRemaining = Math.max(
      0,
      (emp.max_weekly_hours ?? 48) - currentHours - shiftDuration
    );

    let score = 50;
    if (av?.status === "preferred") score += 15;
    if (av?.status === "avoid") score -= 10;
    score += Math.min(20, hoursRemaining / 2);
    if (emp.preferred_location_id === params.locationId) score += 15;
    const fairness = Math.max(0, 20 - weekShifts.length * 2);
    score += fairness;

    scored.push({
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      score: Math.min(100, Math.round(score)),
      weeklyHoursRemaining: Math.round(hoursRemaining * 10) / 10,
      shiftsThisWeek: weekShifts.length,
      preferredLocation: emp.preferred_location_id === params.locationId,
      _rawScore: score,
    });
  }

  scored.sort((a, b) => b._rawScore - a._rawScore);
  return scored.slice(0, limit).map(({ _rawScore, ...s }) => s);
}
