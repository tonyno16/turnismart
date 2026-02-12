import { eq, and, gte, lte } from "drizzle-orm";
import { format, addDays, startOfWeek, parseISO } from "date-fns";
import { db } from "@/lib/db";
import {
  schedules,
  shifts,
  staffingRequirements,
  employees,
  locations,
  roles,
} from "@/drizzle/schema";

export const PERIOD_TIMES: Record<string, { start: string; end: string }> = {
  morning: { start: "08:00", end: "14:00" },
  evening: { start: "14:00", end: "23:00" },
};

/** Get week start (Monday) for a date string YYYY-MM-DD */
export function getWeekStart(dateStr: string): string {
  const d = parseISO(dateStr);
  const monday = startOfWeek(d, { weekStartsOn: 1 });
  return format(monday, "yyyy-MM-dd");
}

/** Ensure schedule exists for org + week, return it with shifts */
export async function getWeekSchedule(organizationId: string, weekStart: string) {
  let [sched] = await db
    .select()
    .from(schedules)
    .where(
      and(
        eq(schedules.organization_id, organizationId),
        eq(schedules.week_start_date, weekStart)
      )
    )
    .limit(1);

  if (!sched) {
    [sched] = await db
      .insert(schedules)
      .values({
        organization_id: organizationId,
        week_start_date: weekStart,
        status: "draft",
      })
      .returning();
  }

  const shiftsRows = await db
    .select({
      id: shifts.id,
      schedule_id: shifts.schedule_id,
      location_id: shifts.location_id,
      location_name: locations.name,
      employee_id: shifts.employee_id,
      employee_first: employees.first_name,
      employee_last: employees.last_name,
      role_id: shifts.role_id,
      role_name: roles.name,
      date: shifts.date,
      start_time: shifts.start_time,
      end_time: shifts.end_time,
      break_minutes: shifts.break_minutes,
      status: shifts.status,
    })
    .from(shifts)
    .innerJoin(locations, eq(shifts.location_id, locations.id))
    .innerJoin(employees, eq(shifts.employee_id, employees.id))
    .innerJoin(roles, eq(shifts.role_id, roles.id))
    .where(eq(shifts.schedule_id, sched!.id))
    .orderBy(shifts.date, shifts.start_time);

  const shiftsList = shiftsRows.map(({ employee_first, employee_last, ...r }) => ({
    ...r,
    employee_name: `${employee_first} ${employee_last}`,
  }));

  return { schedule: sched!, shifts: shiftsList };
}

/** Get all shifts for an employee in a week (optionally scoped by schedule) */
export async function getEmployeeWeekShifts(
  employeeId: string,
  weekStart: string,
  scheduleId?: string
) {
  const weekEnd = format(addDays(parseISO(weekStart), 6), "yyyy-MM-dd");
  const conditions = [
    eq(shifts.employee_id, employeeId),
    gte(shifts.date, weekStart),
    lte(shifts.date, weekEnd),
    eq(shifts.status, "active"),
  ];
  if (scheduleId) {
    conditions.push(eq(shifts.schedule_id, scheduleId));
  }
  return db
    .select()
    .from(shifts)
    .where(and(...conditions))
    .orderBy(shifts.date, shifts.start_time);
}

/** Get employee shifts with location/role names for My Schedule view */
export async function getEmployeeWeekShiftsWithDetails(
  employeeId: string,
  weekStart: string
) {
  const weekEnd = format(addDays(parseISO(weekStart), 6), "yyyy-MM-dd");
  return db
    .select({
      id: shifts.id,
      date: shifts.date,
      start_time: shifts.start_time,
      end_time: shifts.end_time,
      break_minutes: shifts.break_minutes,
      location_name: locations.name,
      role_name: roles.name,
    })
    .from(shifts)
    .innerJoin(locations, eq(shifts.location_id, locations.id))
    .innerJoin(roles, eq(shifts.role_id, roles.id))
    .where(
      and(
        eq(shifts.employee_id, employeeId),
        gte(shifts.date, weekStart),
        lte(shifts.date, weekEnd),
        eq(shifts.status, "active")
      )
    )
    .orderBy(shifts.date, shifts.start_time);
}

export type CoverageSlot = {
  locationId: string;
  locationName: string;
  roleId: string;
  roleName: string;
  dayOfWeek: number;
  shiftPeriod: string;
  required: number;
  assigned: number;
};

/** Get staffing coverage: required vs assigned per (location, role, day, period) */
export async function getStaffingCoverage(
  organizationId: string,
  weekStart: string,
  scheduleId?: string
): Promise<CoverageSlot[]> {
  const reqs = await db
    .select({
      location_id: staffingRequirements.location_id,
      location_name: locations.name,
      role_id: staffingRequirements.role_id,
      role_name: roles.name,
      day_of_week: staffingRequirements.day_of_week,
      shift_period: staffingRequirements.shift_period,
      required_count: staffingRequirements.required_count,
    })
    .from(staffingRequirements)
    .innerJoin(locations, eq(staffingRequirements.location_id, locations.id))
    .innerJoin(roles, eq(staffingRequirements.role_id, roles.id))
    .where(eq(locations.organization_id, organizationId));

  let schedId = scheduleId;
  if (!schedId) {
    const [s] = await db
      .select({ id: schedules.id })
      .from(schedules)
      .where(
        and(
          eq(schedules.organization_id, organizationId),
          eq(schedules.week_start_date, weekStart)
        )
      )
      .limit(1);
    schedId = s?.id;
  }
  if (!schedId) {
    return reqs.map((r) => ({
      locationId: r.location_id,
      locationName: r.location_name,
      roleId: r.role_id,
      roleName: r.role_name,
      dayOfWeek: r.day_of_week,
      shiftPeriod: r.shift_period,
      required: r.required_count,
      assigned: 0,
    }));
  }

  const assignedShifts = await db
    .select({
      location_id: shifts.location_id,
      role_id: shifts.role_id,
      date: shifts.date,
      start_time: shifts.start_time,
    })
    .from(shifts)
    .where(
      and(eq(shifts.schedule_id, schedId), eq(shifts.status, "active"))
  );

  const weekStartDate = parseISO(weekStart);
  const toDayAndPeriod = (dateStr: string, startTime: string) => {
    const d = parseISO(dateStr);
    const dayNum = Math.floor(
      (d.getTime() - weekStartDate.getTime()) / (24 * 60 * 60 * 1000)
    );
    let period = "morning";
    if (startTime >= "14:00") period = "evening";
    return { day: dayNum, period };
  };

  const countMap = new Map<string, number>();
  for (const s of assignedShifts) {
    const { day, period } = toDayAndPeriod(s.date, s.start_time);
    const key = `${s.location_id}_${s.role_id}_${day}_${period}`;
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }

  return reqs.map((r) => {
    const key = `${r.location_id}_${r.role_id}_${r.day_of_week}_${r.shift_period}`;
    const assigned = countMap.get(key) ?? 0;
    return {
      locationId: r.location_id,
      locationName: r.location_name,
      roleId: r.role_id,
      roleName: r.role_name,
      dayOfWeek: r.day_of_week,
      shiftPeriod: r.shift_period,
      required: r.required_count,
      assigned,
    };
  });
}

export type WeekStats = {
  totalShifts: number;
  totalHours: number;
  employeesScheduled: number;
};

export async function getWeekStats(
  organizationId: string,
  weekStart: string
): Promise<WeekStats> {
  const [sched] = await db
    .select({ id: schedules.id })
    .from(schedules)
    .where(
      and(
        eq(schedules.organization_id, organizationId),
        eq(schedules.week_start_date, weekStart)
      )
    )
    .limit(1);
  if (!sched) {
    return { totalShifts: 0, totalHours: 0, employeesScheduled: 0 };
  }

  const shiftList = await db
    .select({
      start_time: shifts.start_time,
      end_time: shifts.end_time,
      employee_id: shifts.employee_id,
    })
    .from(shifts)
    .where(
      and(eq(shifts.schedule_id, sched.id), eq(shifts.status, "active"))
  );

  const parseTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  let totalMinutes = 0;
  const empIds = new Set<string>();
  for (const s of shiftList) {
    totalMinutes += parseTime(s.end_time) - parseTime(s.start_time);
    empIds.add(s.employee_id);
  }

  return {
    totalShifts: shiftList.length,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    employeesScheduled: empIds.size,
  };
}
