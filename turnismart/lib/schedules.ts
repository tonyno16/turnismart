import { eq, and, gte, lte, isNull } from "drizzle-orm";
import { format, addDays, startOfWeek, parseISO, getISODay } from "date-fns";
import { db } from "@/lib/db";
import {
  schedules,
  shifts,
  staffingRequirements,
  employees,
  locations,
  roles,
  organizationSettings,
  roleShiftTimes,
  locationRoleShiftTimes,
  DAY_ALL,
  LOCATION_DAY_ALL,
} from "@/drizzle/schema";

export const PERIOD_TIMES: Record<string, { start: string; end: string }> = {
  morning: { start: "08:00", end: "14:00" },
  evening: { start: "14:00", end: "23:00" },
};

/** Default or org-configured period times. Used when creating new shifts. */
export async function getPeriodTimesForOrganization(
  organizationId: string
): Promise<Record<string, { start: string; end: string }>> {
  const [settings] = await db
    .select()
    .from(organizationSettings)
    .where(eq(organizationSettings.organization_id, organizationId))
    .limit(1);

  const wr = (settings?.work_rules as Record<string, unknown>) ?? {};
  const st = wr.shift_times as
    | { morning?: { start?: string; end?: string }; evening?: { start?: string; end?: string } }
    | undefined;

  if (!st?.morning?.start || !st?.morning?.end || !st?.evening?.start || !st?.evening?.end) {
    return PERIOD_TIMES;
  }

  return {
    morning: { start: st.morning.start, end: st.morning.end },
    evening: { start: st.evening.start, end: st.evening.end },
  };
}

/** Day of week from date: 0=Mon..6=Sun (ISO) */
export function getDayOfWeekFromDate(dateStr: string): number {
  return getISODay(parseISO(dateStr)) - 1;
}

import { shiftMinutesInWeek } from "./schedule-utils";

export { shiftMinutesInWeek } from "./schedule-utils";

/** Get period times for a role (or location+role override) with fallback. Supports day-specific overrides.
 * Lookup: (loc+role+day) > (loc+role) > (role+day) > (role) > org default. */
export async function getPeriodTimesForRole(
  organizationId: string,
  roleId: string,
  period: string,
  locationId?: string,
  date?: string
): Promise<{ start: string; end: string }> {
  const dayOfWeek = date != null ? getDayOfWeekFromDate(date) : DAY_ALL;

  if (locationId) {
    const [lrstDay] = await db
      .select({
        start_time: locationRoleShiftTimes.start_time,
        end_time: locationRoleShiftTimes.end_time,
      })
      .from(locationRoleShiftTimes)
      .innerJoin(locations, eq(locationRoleShiftTimes.location_id, locations.id))
      .innerJoin(roles, eq(locationRoleShiftTimes.role_id, roles.id))
      .where(
        and(
          eq(locationRoleShiftTimes.location_id, locationId),
          eq(locationRoleShiftTimes.role_id, roleId),
          eq(locationRoleShiftTimes.shift_period, period as "morning" | "evening"),
          eq(locationRoleShiftTimes.day_of_week, dayOfWeek),
          eq(locations.organization_id, organizationId),
          eq(roles.organization_id, organizationId)
        )
      )
      .limit(1);

    if (lrstDay) {
      return { start: lrstDay.start_time, end: lrstDay.end_time };
    }

    const [lrstAll] = await db
      .select({
        start_time: locationRoleShiftTimes.start_time,
        end_time: locationRoleShiftTimes.end_time,
      })
      .from(locationRoleShiftTimes)
      .innerJoin(locations, eq(locationRoleShiftTimes.location_id, locations.id))
      .innerJoin(roles, eq(locationRoleShiftTimes.role_id, roles.id))
      .where(
        and(
          eq(locationRoleShiftTimes.location_id, locationId),
          eq(locationRoleShiftTimes.role_id, roleId),
          eq(locationRoleShiftTimes.shift_period, period as "morning" | "evening"),
          eq(locationRoleShiftTimes.day_of_week, LOCATION_DAY_ALL),
          eq(locations.organization_id, organizationId),
          eq(roles.organization_id, organizationId)
        )
      )
      .limit(1);

    if (lrstAll) {
      return { start: lrstAll.start_time, end: lrstAll.end_time };
    }
  }

  const [rstDay] = await db
    .select({
      start_time: roleShiftTimes.start_time,
      end_time: roleShiftTimes.end_time,
    })
    .from(roleShiftTimes)
    .innerJoin(roles, eq(roleShiftTimes.role_id, roles.id))
    .where(
      and(
        eq(roleShiftTimes.role_id, roleId),
        eq(roleShiftTimes.shift_period, period as "morning" | "evening"),
        eq(roleShiftTimes.day_of_week, dayOfWeek),
        eq(roles.organization_id, organizationId)
      )
    )
    .limit(1);

  if (rstDay) {
    return { start: rstDay.start_time, end: rstDay.end_time };
  }

  const [rstAll] = await db
    .select({
      start_time: roleShiftTimes.start_time,
      end_time: roleShiftTimes.end_time,
    })
    .from(roleShiftTimes)
    .innerJoin(roles, eq(roleShiftTimes.role_id, roles.id))
    .where(
      and(
        eq(roleShiftTimes.role_id, roleId),
        eq(roleShiftTimes.shift_period, period as "morning" | "evening"),
        eq(roleShiftTimes.day_of_week, DAY_ALL),
        eq(roles.organization_id, organizationId)
      )
    )
    .limit(1);

  if (rstAll) {
    return { start: rstAll.start_time, end: rstAll.end_time };
  }

  const orgTimes = await getPeriodTimesForOrganization(organizationId);
  return orgTimes[period] ?? orgTimes.morning;
}

/** Batch: get role override times for an org. Key = `${roleId}:${period}` (day 7) or `${roleId}:${period}:${day}`. */
export async function getRoleShiftTimesOverrides(
  organizationId: string
): Promise<Map<string, { start: string; end: string }>> {
  const map = new Map<string, { start: string; end: string }>();

  const rows = await db
    .select({
      role_id: roleShiftTimes.role_id,
      shift_period: roleShiftTimes.shift_period,
      day_of_week: roleShiftTimes.day_of_week,
      start_time: roleShiftTimes.start_time,
      end_time: roleShiftTimes.end_time,
    })
    .from(roleShiftTimes)
    .innerJoin(roles, eq(roleShiftTimes.role_id, roles.id))
    .where(eq(roles.organization_id, organizationId));

  for (const r of rows) {
    const key =
      r.day_of_week === DAY_ALL
        ? `${r.role_id}:${r.shift_period}`
        : `${r.role_id}:${r.shift_period}:${r.day_of_week}`;
    map.set(key, { start: r.start_time, end: r.end_time });
  }

  return map;
}

/** Batch: get location+role override times. Key = `${locId}:${roleId}:${period}` (day 7) or `...:${day}`. */
export async function getLocationRoleShiftTimesOverrides(
  organizationId: string
): Promise<Map<string, { start: string; end: string }>> {
  const map = new Map<string, { start: string; end: string }>();

  const rows = await db
    .select({
      location_id: locationRoleShiftTimes.location_id,
      role_id: locationRoleShiftTimes.role_id,
      shift_period: locationRoleShiftTimes.shift_period,
      day_of_week: locationRoleShiftTimes.day_of_week,
      start_time: locationRoleShiftTimes.start_time,
      end_time: locationRoleShiftTimes.end_time,
    })
    .from(locationRoleShiftTimes)
    .innerJoin(locations, eq(locationRoleShiftTimes.location_id, locations.id))
    .innerJoin(roles, eq(locationRoleShiftTimes.role_id, roles.id))
    .where(
      and(
        eq(locations.organization_id, organizationId),
        eq(roles.organization_id, organizationId)
      )
    );

  for (const r of rows) {
    const key =
      r.day_of_week === LOCATION_DAY_ALL
        ? `${r.location_id}:${r.role_id}:${r.shift_period}`
        : `${r.location_id}:${r.role_id}:${r.shift_period}:${r.day_of_week}`;
    map.set(key, { start: r.start_time, end: r.end_time });
  }

  return map;
}

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
      notes: shifts.notes,
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

/** Get all shifts for an employee in a week (optionally scoped by schedule).
 * Includes shifts starting the day before the week (e.g. Sun 22:00 → Mon 06:00). */
export async function getEmployeeWeekShifts(
  employeeId: string,
  weekStart: string,
  scheduleId?: string
) {
  const weekStartDate = parseISO(weekStart);
  const dayBeforeWeek = format(addDays(weekStartDate, -1), "yyyy-MM-dd");
  const weekEnd = format(addDays(weekStartDate, 6), "yyyy-MM-dd");
  const conditions = [
    eq(shifts.employee_id, employeeId),
    gte(shifts.date, dayBeforeWeek),
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

/** Get staffing coverage: required vs assigned per (location, role, day, period).
 * Usa override per weekStart se esiste, altrimenti modello ricorrente. */
export async function getStaffingCoverage(
  organizationId: string,
  weekStart: string,
  scheduleId?: string
): Promise<CoverageSlot[]> {
  const [templateRows, overrideRows] = await Promise.all([
    db
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
      .where(
        and(
          eq(locations.organization_id, organizationId),
          isNull(staffingRequirements.week_start_date)
        )
      ),
    db
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
      .where(
        and(
          eq(locations.organization_id, organizationId),
          eq(staffingRequirements.week_start_date, weekStart)
        )
      ),
  ]);

  const overrideKey = (r: { location_id: string; role_id: string; day_of_week: number; shift_period: string }) =>
    `${r.location_id}_${r.role_id}_${r.day_of_week}_${r.shift_period}`;
  const overrideMap = new Map(overrideRows.map((r) => [overrideKey(r), r]));
  const templateKeys = new Set(templateRows.map((t) => overrideKey(t)));
  const mergedFromTemplate =
    templateRows.length > 0
      ? templateRows.map((t) => overrideMap.get(overrideKey(t)) ?? t)
      : [];
  const overrideOnly = overrideRows.filter((o) => !templateKeys.has(overrideKey(o)));
  const reqs = [...mergedFromTemplate, ...overrideOnly];

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
      date: shifts.date,
      start_time: shifts.start_time,
      end_time: shifts.end_time,
      employee_id: shifts.employee_id,
    })
    .from(shifts)
    .where(
      and(eq(shifts.schedule_id, sched.id), eq(shifts.status, "active"))
  );

  let totalMinutes = 0;
  const empIds = new Set<string>();
  for (const s of shiftList) {
    totalMinutes += shiftMinutesInWeek(s.date, s.start_time, s.end_time, weekStart);
    empIds.add(s.employee_id);
  }

  return {
    totalShifts: shiftList.length,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    employeesScheduled: empIds.size,
  };
}
