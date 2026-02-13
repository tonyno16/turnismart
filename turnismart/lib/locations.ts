import { eq, and, isNull } from "drizzle-orm";
import { format, startOfMonth, endOfMonth, startOfWeek } from "date-fns";
import { db } from "@/lib/db";
import {
  locations,
  staffingRequirements,
  roles,
  employees,
  locationRoleShiftTimes,
  LOCATION_DAY_ALL,
} from "@/drizzle/schema";

export async function getLocations(organizationId: string) {
  return db
    .select()
    .from(locations)
    .where(eq(locations.organization_id, organizationId))
    .orderBy(locations.sort_order, locations.name);
}

/** Fetch template (week_start_date IS NULL) per backward compat */
export async function getLocationWithStaffing(locationId: string) {
  const [loc] = await db
    .select()
    .from(locations)
    .where(eq(locations.id, locationId))
    .limit(1);
  if (!loc) return null;

  const staffing = await db
    .select({
      id: staffingRequirements.id,
      role_id: staffingRequirements.role_id,
      role_name: roles.name,
      day_of_week: staffingRequirements.day_of_week,
      shift_period: staffingRequirements.shift_period,
      required_count: staffingRequirements.required_count,
    })
    .from(staffingRequirements)
    .innerJoin(roles, eq(staffingRequirements.role_id, roles.id))
    .where(
      and(
        eq(staffingRequirements.location_id, locationId),
        isNull(staffingRequirements.week_start_date)
      )
    );

  return { ...loc, staffing };
}

export type StaffingItem = {
  id: string;
  role_id: string;
  role_name: string;
  day_of_week: number;
  shift_period: string;
  required_count: number;
};

/** Get merged staffing for a week: override if exists, else template */
export async function getLocationStaffingForWeek(
  locationId: string,
  weekStart: string
): Promise<StaffingItem[]> {
  const [template, overrides] = await Promise.all([
    db
      .select({
        id: staffingRequirements.id,
        role_id: staffingRequirements.role_id,
        role_name: roles.name,
        day_of_week: staffingRequirements.day_of_week,
        shift_period: staffingRequirements.shift_period,
        required_count: staffingRequirements.required_count,
      })
      .from(staffingRequirements)
      .innerJoin(roles, eq(staffingRequirements.role_id, roles.id))
      .where(
        and(
          eq(staffingRequirements.location_id, locationId),
          isNull(staffingRequirements.week_start_date)
        )
      ),
    db
      .select({
        id: staffingRequirements.id,
        role_id: staffingRequirements.role_id,
        role_name: roles.name,
        day_of_week: staffingRequirements.day_of_week,
        shift_period: staffingRequirements.shift_period,
        required_count: staffingRequirements.required_count,
      })
      .from(staffingRequirements)
      .innerJoin(roles, eq(staffingRequirements.role_id, roles.id))
      .where(
        and(
          eq(staffingRequirements.location_id, locationId),
          eq(staffingRequirements.week_start_date, weekStart)
        )
      ),
  ]);

  const overrideKey = (r: StaffingItem) =>
    `${r.role_id}_${r.day_of_week}_${r.shift_period}`;
  const overrideMap = new Map(overrides.map((r) => [overrideKey(r), r]));
  // Se non c'è modello, mostra gli override (per sedi nuove o senza template)
  if (template.length === 0) return overrides;
  return template.map((t) => overrideMap.get(overrideKey(t)) ?? t);
}

/** Map: dateStr (yyyy-MM-dd) -> roleId_dayOfWeek_period -> count. Per vista mensile. */
export async function getLocationStaffingForMonth(
  locationId: string,
  year: number,
  month: number
): Promise<Map<string, Record<string, number>>> {
  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(start);
  const weeks = new Set<string>();
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const ws = format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
    weeks.add(ws);
  }
  const weekArray = Array.from(weeks);
  const [template, ...overrideList] = await Promise.all([
    db
      .select({
        role_id: staffingRequirements.role_id,
        day_of_week: staffingRequirements.day_of_week,
        shift_period: staffingRequirements.shift_period,
        required_count: staffingRequirements.required_count,
      })
      .from(staffingRequirements)
      .where(
        and(
          eq(staffingRequirements.location_id, locationId),
          isNull(staffingRequirements.week_start_date)
        )
      ),
    ...weekArray.map((ws) =>
      db
        .select({
          role_id: staffingRequirements.role_id,
          day_of_week: staffingRequirements.day_of_week,
          shift_period: staffingRequirements.shift_period,
          required_count: staffingRequirements.required_count,
        })
        .from(staffingRequirements)
        .where(
          and(
            eq(staffingRequirements.location_id, locationId),
            eq(staffingRequirements.week_start_date, ws)
          )
        )
    ),
  ]);

  const overrideByWeek = new Map<string, Map<string, number>>();
  overrideList.forEach((rows, i) => {
    const ws = weekArray[i];
    const m = new Map<string, number>();
    for (const r of rows) {
      m.set(`${r.role_id}_${r.day_of_week}_${r.shift_period}`, r.required_count);
    }
    if (ws) overrideByWeek.set(ws, m);
  });
  const templateMap = new Map(
    template.map((r) => [
      `${r.role_id}_${r.day_of_week}_${r.shift_period}`,
      r.required_count,
    ])
  );

  const result = new Map<string, Record<string, number>>();
  // Includi ruoli da template e override (se template vuoto, usa solo override)
  const rolesWithTemplate = new Set([
    ...template.map((r) => r.role_id),
    ...overrideList.flatMap((rows) => rows.map((r) => r.role_id)),
  ]);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = format(d, "yyyy-MM-dd");
    const ws = format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
    const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1; // 0=Mon
    const overrideMap = overrideByWeek.get(ws);
    const dayValues: Record<string, number> = {};
    for (const roleId of rolesWithTemplate) {
      for (const period of ["morning", "evening"] as const) {
        const lookupKey = `${roleId}_${dayOfWeek}_${period}`;
        const val =
          overrideMap?.get(lookupKey) ??
          templateMap.get(lookupKey) ??
          0;
        dayValues[`${roleId}_${period}`] = val;
      }
    }
    result.set(dateStr, dayValues);
  }
  return result;
}

export async function getLocationEmployeeCount(locationId: string): Promise<number> {
  const list = await db
    .select({ id: employees.id })
    .from(employees)
    .where(eq(employees.preferred_location_id, locationId));
  return list.length;
}

export type LocationRoleShiftTimesMap = Record<
  string,
  { morning: { start: string; end: string }; evening: { start: string; end: string } }
>;

export type LocationRoleShiftTimesWithDays = {
  default: LocationRoleShiftTimesMap;
  byDay: Partial<Record<number, LocationRoleShiftTimesMap>>; // 0=Mon..6=Sun
};

/** Get location+role shift times for a location. Returns default (day 7) and day-specific overrides. */
export async function getLocationRoleShiftTimes(
  locationId: string
): Promise<LocationRoleShiftTimesWithDays> {
  const rows = await db
    .select({
      role_id: locationRoleShiftTimes.role_id,
      shift_period: locationRoleShiftTimes.shift_period,
      day_of_week: locationRoleShiftTimes.day_of_week,
      start_time: locationRoleShiftTimes.start_time,
      end_time: locationRoleShiftTimes.end_time,
    })
    .from(locationRoleShiftTimes)
    .where(eq(locationRoleShiftTimes.location_id, locationId));

  const defaultMap: LocationRoleShiftTimesMap = {};
  const byDay: Partial<Record<number, LocationRoleShiftTimesMap>> = {};

  for (const r of rows) {
    const target =
      r.day_of_week === LOCATION_DAY_ALL
        ? defaultMap
        : (byDay[r.day_of_week] ??= {} as LocationRoleShiftTimesMap);

    if (!target[r.role_id]) {
      target[r.role_id] = {
        morning: { start: "08:00", end: "14:00" },
        evening: { start: "14:00", end: "23:00" },
      };
    }
    if (r.shift_period === "morning") {
      target[r.role_id].morning = { start: r.start_time, end: r.end_time };
    } else {
      target[r.role_id].evening = { start: r.start_time, end: r.end_time };
    }
  }

  return { default: defaultMap, byDay };
}
