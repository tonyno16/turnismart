import { eq, and, gte, lte } from "drizzle-orm";
import { format, addDays, addWeeks, parseISO, startOfWeek } from "date-fns";
import { db } from "@/lib/db";
import {
  schedules,
  shifts,
  staffingRequirements,
  employees,
  locations,
  shiftRequests,
  employeeTimeOff,
} from "@/drizzle/schema";
import { getStaffingCoverage } from "./schedules";

export type DashboardStats = {
  activeEmployees: number;
  uncoveredShifts: number;
  plannedHours: number;
  estimatedCost: number;
};

export async function getDashboardStats(
  organizationId: string,
  weekStart?: string,
  preloadedCoverage?: Awaited<ReturnType<typeof getStaffingCoverage>>
): Promise<DashboardStats> {
  const week =
    weekStart ?? format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const [sched] = await db
    .select({ id: schedules.id })
    .from(schedules)
    .where(
      and(
        eq(schedules.organization_id, organizationId),
        eq(schedules.week_start_date, week)
      )
    )
    .limit(1);

  const activeEmps = await db
    .select({ id: employees.id })
    .from(employees)
    .where(
      and(
        eq(employees.organization_id, organizationId),
        eq(employees.is_active, true)
      )
    );
  const activeEmployees = activeEmps.length;

  let uncoveredShifts = 0;
  let totalHours = 0;
  let estimatedCost = 0;

  if (sched) {
    const coverage = preloadedCoverage ?? await getStaffingCoverage(
      organizationId,
      week,
      sched.id
    );
    uncoveredShifts = coverage.reduce(
      (sum, c) => sum + Math.max(0, c.required - c.assigned),
      0
    );

    const shiftList = await db
      .select({
        start_time: shifts.start_time,
        end_time: shifts.end_time,
        hourly_rate: employees.hourly_rate,
      })
      .from(shifts)
      .innerJoin(employees, eq(shifts.employee_id, employees.id))
      .where(
        and(
          eq(shifts.schedule_id, sched.id),
          eq(shifts.status, "active")
        )
      );

    const parseMins = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return (h ?? 0) * 60 + (m ?? 0);
    };

    for (const s of shiftList) {
      const mins = parseMins(s.end_time) - parseMins(s.start_time);
      totalHours += mins / 60;
      const rate = parseFloat(String(s.hourly_rate ?? 0));
      estimatedCost += (mins / 60) * rate;
    }
  }

  return {
    activeEmployees,
    uncoveredShifts,
    plannedHours: Math.round(totalHours * 10) / 10,
    estimatedCost: Math.round(estimatedCost * 100) / 100,
  };
}

export type DayStatus = "green" | "yellow" | "red" | "empty";

export type WeekOverviewCell = {
  locationId: string;
  locationName: string;
  day: number;
  date: string;
  status: DayStatus;
  required: number;
  assigned: number;
};

export async function getWeekOverview(
  organizationId: string,
  weekStart: string,
  preloadedCoverage?: Awaited<ReturnType<typeof getStaffingCoverage>>
): Promise<WeekOverviewCell[]> {
  const coverage = preloadedCoverage ?? await getStaffingCoverage(organizationId, weekStart);
  const weekStartDate = parseISO(weekStart);

  const byLocationDay = new Map<
    string,
    { required: number; assigned: number }
  >();

  for (const c of coverage) {
    const key = `${c.locationId}_${c.dayOfWeek}`;
    const curr = byLocationDay.get(key) ?? {
      required: 0,
      assigned: 0,
    };
    curr.required += c.required;
    curr.assigned += c.assigned;
    byLocationDay.set(key, curr);
  }

  const locs = await db
    .select({ id: locations.id, name: locations.name })
    .from(locations)
    .where(eq(locations.organization_id, organizationId))
    .orderBy(locations.name);

  const result: WeekOverviewCell[] = [];
  for (const loc of locs) {
    for (let day = 0; day < 7; day++) {
      const key = `${loc.id}_${day}`;
      const data = byLocationDay.get(key) ?? { required: 0, assigned: 0 };
      const date = format(addDays(weekStartDate, day), "yyyy-MM-dd");

      let status: DayStatus = "empty";
      if (data.required > 0) {
        if (data.assigned >= data.required) status = "green";
        else if (data.assigned > 0) status = "yellow";
        else status = "red";
      }

      result.push({
        locationId: loc.id,
        locationName: loc.name,
        day,
        date,
        status,
        required: data.required,
        assigned: data.assigned,
      });
    }
  }
  return result;
}

export type PendingAlert = {
  type: "shift_request" | "sick_leave" | "no_shifts";
  title: string;
  detail?: string;
  count?: number;
};

export async function getPendingAlerts(
  organizationId: string,
  weekStart?: string
): Promise<PendingAlert[]> {
  const week =
    weekStart ?? format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(addDays(parseISO(week), 6), "yyyy-MM-dd");
  const alerts: PendingAlert[] = [];

  const pendingRequests = await db
    .select({ id: shiftRequests.id })
    .from(shiftRequests)
    .where(
      and(
        eq(shiftRequests.organization_id, organizationId),
        eq(shiftRequests.status, "pending")
      )
    );
  if (pendingRequests.length > 0) {
    alerts.push({
      type: "shift_request",
      title: "Richieste in attesa",
      detail: `${pendingRequests.length} richiesta/e da esaminare`,
      count: pendingRequests.length,
    });
  }

  const [sched] = await db
    .select({ id: schedules.id })
    .from(schedules)
    .where(
      and(
        eq(schedules.organization_id, organizationId),
        eq(schedules.week_start_date, week)
      )
    )
    .limit(1);

  if (sched) {
    const sickShifts = await db
      .select({ id: shifts.id })
      .from(shifts)
      .where(
        and(
          eq(shifts.schedule_id, sched.id),
          eq(shifts.status, "sick_leave"))
      );
    if (sickShifts.length > 0) {
      alerts.push({
        type: "sick_leave",
        title: "Turni in malattia",
        detail: `${sickShifts.length} turno/i segnati come malattia`,
        count: sickShifts.length,
      });
    }

    const activeEmps = await db
      .select({ id: employees.id })
      .from(employees)
      .where(
        and(
          eq(employees.organization_id, organizationId),
          eq(employees.is_active, true))
      );
    const empIds = new Set(activeEmps.map((e) => e.id));

    const scheduledEmpIds = await db
      .selectDistinct({ employee_id: shifts.employee_id })
      .from(shifts)
      .where(
        and(
          eq(shifts.schedule_id, sched.id),
          eq(shifts.status, "active"))
      );

    const scheduledSet = new Set(scheduledEmpIds.map((s) => s.employee_id));
    const noShifts = [...empIds].filter((id) => !scheduledSet.has(id));

    if (noShifts.length > 0) {
      alerts.push({
        type: "no_shifts",
        title: "Dipendenti senza turni",
        detail: `${noShifts.length} dipendente/i attivi senza turni questa settimana`,
        count: noShifts.length,
      });
    }
  }

  return alerts;
}
