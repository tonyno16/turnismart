import { eq, and } from "drizzle-orm";
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
    .where(eq(staffingRequirements.location_id, locationId));

  return { ...loc, staffing };
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
