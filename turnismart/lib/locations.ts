import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  locations,
  staffingRequirements,
  roles,
  employees,
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
