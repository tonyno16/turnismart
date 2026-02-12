"use server";

import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  locations,
  staffingRequirements,
  roles,
} from "@/drizzle/schema";
import { requireOrganization } from "@/lib/auth";
import { checkQuota } from "@/lib/usage";

const SHIFT_PERIODS = ["morning", "evening"] as const;

export async function createLocation(formData: FormData) {
  const { organization } = await requireOrganization();
  const quota = await checkQuota(organization.id, "locations");
  if (!quota.allowed) throw new Error(quota.message ?? "Limite sedi raggiunto");
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
  redirect("/locations");
}

export async function copyStaffingFromLocation(
  targetLocationId: string,
  sourceLocationId: string
) {
  const { organization } = await requireOrganization();
  if (targetLocationId === sourceLocationId)
    throw new Error("Seleziona una sede diversa dalla corrente");

  const [target] = await db
    .select()
    .from(locations)
    .where(
      and(
        eq(locations.id, targetLocationId),
        eq(locations.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!target) throw new Error("Sede di destinazione non trovata");

  const [source] = await db
    .select()
    .from(locations)
    .where(
      and(
        eq(locations.id, sourceLocationId),
        eq(locations.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!source) throw new Error("Sede sorgente non trovata");

  const sourceStaffing = await db
    .select()
    .from(staffingRequirements)
    .where(eq(staffingRequirements.location_id, sourceLocationId));

  if (sourceStaffing.length === 0)
    throw new Error("La sede sorgente non ha fabbisogno da copiare");

  await db
    .delete(staffingRequirements)
    .where(eq(staffingRequirements.location_id, targetLocationId));

  for (const row of sourceStaffing) {
    await db.insert(staffingRequirements).values({
      location_id: targetLocationId,
      role_id: row.role_id,
      day_of_week: row.day_of_week,
      shift_period: row.shift_period,
      required_count: row.required_count,
    });
  }
  revalidatePath(`/locations/${targetLocationId}`);
  revalidatePath("/locations");
  return { copied: sourceStaffing.length };
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
