"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  locations,
  staffingRequirements,
  roles,
} from "@/drizzle/schema";
import { requireOrganization } from "@/lib/auth";

const SHIFT_PERIODS = ["morning", "afternoon", "evening"] as const;

export async function createLocation(formData: FormData) {
  const { organization } = await requireOrganization();
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Nome obbligatorio");
  const address = (formData.get("address") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;

  const [loc] = await db
    .insert(locations)
    .values({
      organization_id: organization.id,
      name,
      address,
      phone,
      opening_hours: {},
    })
    .returning();
  revalidatePath("/locations");
  return loc;
}

export async function updateLocation(
  locationId: string,
  formData: FormData
) {
  await requireOrganization();
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Nome obbligatorio");
  const address = (formData.get("address") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;

  await db
    .update(locations)
    .set({
      name,
      address,
      phone,
      updated_at: new Date(),
    })
    .where(eq(locations.id, locationId));
  revalidatePath("/locations");
  revalidatePath(`/locations/${locationId}`);
}

export async function deleteLocation(locationId: string) {
  const { organization } = await requireOrganization();
  const [loc] = await db
    .select()
    .from(locations)
    .where(
      and(
        eq(locations.id, locationId),
        eq(locations.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!loc) throw new Error("Sede non trovata");
  await db.delete(locations).where(eq(locations.id, locationId));
  revalidatePath("/locations");
}

export async function updateStaffingRequirements(
  locationId: string,
  updates: Array<{
    roleId: string;
    dayOfWeek: number;
    shiftPeriod: string;
    requiredCount: number;
  }>
) {
  const { organization } = await requireOrganization();
  const [loc] = await db
    .select()
    .from(locations)
    .where(eq(locations.id, locationId))
    .limit(1);
  if (!loc || loc.organization_id !== organization.id)
    throw new Error("Sede non trovata");

  await db
    .delete(staffingRequirements)
    .where(eq(staffingRequirements.location_id, locationId));

  for (const u of updates) {
    if (u.requiredCount > 0) {
      await db.insert(staffingRequirements).values({
        location_id: locationId,
        role_id: u.roleId,
        day_of_week: u.dayOfWeek,
        shift_period: u.shiftPeriod as (typeof SHIFT_PERIODS)[number],
        required_count: u.requiredCount,
      });
    }
  }
  revalidatePath(`/locations/${locationId}`);
}
