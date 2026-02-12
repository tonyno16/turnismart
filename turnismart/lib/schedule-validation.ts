import { eq, and, or, lte, gte } from "drizzle-orm";
import { addDays, parseISO, format } from "date-fns";
import { db } from "@/lib/db";
import {
  shifts,
  employees,
  employeeAvailability,
  employeeIncompatibilities,
  employeeTimeOff,
} from "@/drizzle/schema";
import type { AvailabilityShiftPeriod } from "@/drizzle/schema/employee-availability";
import { getEmployeeWeekShifts } from "./schedules";

export type ValidationConflict = {
  type:
    | "overlap"
    | "max_hours"
    | "rest_period"
    | "incompatibility"
    | "availability"
    | "time_off";
  message: string;
};

function parseTimeMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Check if proposed shift overlaps with existing shifts for same employee */
export async function checkOverlap(
  employeeId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeShiftId?: string,
  scheduleId?: string
): Promise<ValidationConflict | null> {
  const conditions = [
    eq(shifts.employee_id, employeeId),
    eq(shifts.date, date),
    eq(shifts.status, "active"),
  ];
  if (scheduleId) conditions.push(eq(shifts.schedule_id, scheduleId));
  const dayShifts = await db.select().from(shifts).where(and(...conditions));
  const startM = parseTimeMinutes(startTime);
  const endM = parseTimeMinutes(endTime);
  for (const s of dayShifts) {
    if (s.id === excludeShiftId) continue;
    const sStart = parseTimeMinutes(s.start_time);
    const sEnd = parseTimeMinutes(s.end_time);
    if (startM < sEnd && endM > sStart) {
      return {
        type: "overlap",
        message: `Si sovrappone con turno ${s.start_time}-${s.end_time}`,
      };
    }
  }
  return null;
}

/** Check if employee would exceed max weekly hours with this shift */
export async function checkMaxWeeklyHours(
  employeeId: string,
  weekStart: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeShiftId?: string,
  scheduleId?: string
): Promise<ValidationConflict | null> {
  const [emp] = await db
    .select({ max_weekly_hours: employees.max_weekly_hours })
    .from(employees)
    .where(eq(employees.id, employeeId))
    .limit(1);
  if (!emp) return null;

  const existingShifts = await getEmployeeWeekShifts(employeeId, weekStart, scheduleId);
  let totalMins = 0;
  for (const s of existingShifts) {
    if (s.id === excludeShiftId) continue;
    totalMins +=
      parseTimeMinutes(s.end_time) - parseTimeMinutes(s.start_time);
  }
  const newMins =
    parseTimeMinutes(endTime) - parseTimeMinutes(startTime);
  totalMins += newMins;
  const totalHours = totalMins / 60;
  if (totalHours > emp.max_weekly_hours) {
    return {
      type: "max_hours",
      message: `Supererebbe il limite di ${emp.max_weekly_hours}h/settimana (attuali ~${Math.round(totalHours * 10) / 10}h)`,
    };
  }
  return null;
}

/** Min rest period in hours (default 11h between shifts) */
const MIN_REST_HOURS = 11;

/** Check minimum rest period between shifts */
export async function checkMinRestPeriod(
  employeeId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeShiftId?: string,
  scheduleId?: string
): Promise<ValidationConflict | null> {
  const prevDate = format(addDays(parseISO(date), -1), "yyyy-MM-dd");
  const nextDate = format(addDays(parseISO(date), 1), "yyyy-MM-dd");

  const conditions = [
    eq(shifts.employee_id, employeeId),
    eq(shifts.status, "active"),
    or(eq(shifts.date, date), eq(shifts.date, prevDate), eq(shifts.date, nextDate)),
  ];
  if (scheduleId) conditions.push(eq(shifts.schedule_id, scheduleId));
  const nearbyShifts = await db
    .select()
    .from(shifts)
    .where(and(...conditions));

  const newEndM = parseTimeMinutes(endTime);
  const newStartM = parseTimeMinutes(startTime);

  for (const s of nearbyShifts) {
    if (s.id === excludeShiftId) continue;
    const sDate = s.date;
    const sStartM = parseTimeMinutes(s.start_time);
    const sEndM = parseTimeMinutes(s.end_time);

    let restMins = 0;
    if (sDate === prevDate) {
      restMins = (24 * 60 - sEndM) + newStartM;
    } else if (sDate === nextDate) {
      restMins = (24 * 60 - newEndM) + sStartM;
    } else if (sDate === date) {
      if (sEndM <= newStartM) {
        restMins = newStartM - sEndM;
      } else {
        restMins = sStartM - newEndM;
      }
    }
    const restHours = restMins / 60;
    if (restMins > 0 && restHours < MIN_REST_HOURS) {
      return {
        type: "rest_period",
        message: `Riposo insufficiente (${Math.round(restHours * 10) / 10}h, minimo ${MIN_REST_HOURS}h)`,
      };
    }
  }
  return null;
}

/** Check if employee is incompatible with someone already on that shift */
export async function checkIncompatibility(
  employeeId: string,
  locationId: string,
  date: string,
  _startTime: string,
  _endTime: string,
  scheduleId: string
): Promise<ValidationConflict | null> {
  const incRows = await db
    .select({ employee_a_id: employeeIncompatibilities.employee_a_id, employee_b_id: employeeIncompatibilities.employee_b_id })
    .from(employeeIncompatibilities)
    .where(
      or(
        eq(employeeIncompatibilities.employee_a_id, employeeId),
        eq(employeeIncompatibilities.employee_b_id, employeeId)
      )
    );
  const otherIds = new Set(
    incRows.map((r) =>
      r.employee_a_id === employeeId ? r.employee_b_id : r.employee_a_id
    )
  );
  if (otherIds.size === 0) return null;

  const collidingShifts = await db
    .select({ employee_id: shifts.employee_id })
    .from(shifts)
    .where(
      and(
        eq(shifts.schedule_id, scheduleId),
        eq(shifts.location_id, locationId),
        eq(shifts.date, date),
        eq(shifts.status, "active")
      )
    );
  for (const s of collidingShifts) {
    if (otherIds.has(s.employee_id)) {
      return {
        type: "incompatibility",
        message: "Incompatibilità con dipendente già assegnato in questo turno",
      };
    }
  }
  return null;
}

/** Check if employee has availability for this day/period */
export async function checkAvailability(
  employeeId: string,
  dayOfWeek: number,
  shiftPeriod: string
): Promise<ValidationConflict | null> {
  const validPeriod =
    ["morning", "afternoon", "evening"].includes(shiftPeriod) ? shiftPeriod : "morning";
  const av = await db
    .select()
    .from(employeeAvailability)
    .where(
      and(
        eq(employeeAvailability.employee_id, employeeId),
        eq(employeeAvailability.day_of_week, dayOfWeek),
        eq(employeeAvailability.shift_period, validPeriod as AvailabilityShiftPeriod)
      )
    )
    .limit(1);
  if (av.length === 0) return null;
  if (av[0].status === "unavailable") {
    return {
      type: "availability",
      message: "Non disponibile in questo slot",
    };
  }
  return null;
}

/** Check if employee has approved time-off on this date */
export async function checkTimeOff(
  employeeId: string,
  date: string
): Promise<ValidationConflict | null> {
  const to = await db
    .select()
    .from(employeeTimeOff)
    .where(
      and(
        eq(employeeTimeOff.employee_id, employeeId),
        eq(employeeTimeOff.status, "approved"),
        lte(employeeTimeOff.start_date, date),
        gte(employeeTimeOff.end_date, date)
      )
    )
    .limit(1);
  if (to.length > 0) {
    return {
      type: "time_off",
      message: "Assenza/permesso approvato in questa data",
    };
  }
  return null;
}

/** Run all validations, return first conflict or null */
export async function validateShiftAssignment(params: {
  employeeId: string;
  organizationId: string;
  scheduleId: string;
  locationId: string;
  roleId: string;
  date: string;
  startTime: string;
  endTime: string;
  weekStart: string;
  excludeShiftId?: string;
}): Promise<ValidationConflict | null> {
  const dayOfWeek = Math.floor(
    (parseISO(params.date).getTime() - parseISO(params.weekStart).getTime()) /
      (24 * 60 * 60 * 1000)
  );
  const period =
    params.startTime >= "18:00"
      ? "evening"
      : params.startTime >= "13:00"
      ? "afternoon"
      : "morning";

  const checks = [
    () =>
      checkOverlap(
        params.employeeId,
        params.date,
        params.startTime,
        params.endTime,
        params.excludeShiftId,
        params.scheduleId
      ),
    () =>
      checkMaxWeeklyHours(
        params.employeeId,
        params.weekStart,
        params.date,
        params.startTime,
        params.endTime,
        params.excludeShiftId,
        params.scheduleId
      ),
    () =>
      checkMinRestPeriod(
        params.employeeId,
        params.date,
        params.startTime,
        params.endTime,
        params.excludeShiftId,
        params.scheduleId
      ),
    () =>
      checkIncompatibility(
        params.employeeId,
        params.locationId,
        params.date,
        params.startTime,
        params.endTime,
        params.scheduleId
      ),
    () => checkAvailability(params.employeeId, dayOfWeek, period),
    () => checkTimeOff(params.employeeId, params.date),
  ];
  for (const fn of checks) {
    const conflict = await fn();
    if (conflict) return conflict;
  }
  return null;
}

