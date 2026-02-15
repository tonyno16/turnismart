"use server";

import { redirect } from "next/navigation";
import { eq, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { dailyTableExists } from "@/lib/daily-table-check";
import {
  locations,
  staffingRequirements,
  dailyStaffingOverrides,
  roles,
  locationRoleShiftTimes,
  LOCATION_DAY_ALL,
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

export type LocationRoleShiftTimesInput = {
  roleId: string;
  dayOfWeek: number; // 0-6=specific day, 7=all days (LOCATION_DAY_ALL)
  morning: { start: string; end: string };
  evening: { start: string; end: string };
};

function validateTimeLoc(s: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return "08:00";
  const h = Math.max(0, Math.min(23, parseInt(m[1], 10)));
  const min = Math.max(0, Math.min(59, parseInt(m[2], 10)));
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

export async function updateLocationRoleShiftTimes(
  locationId: string,
  updates: LocationRoleShiftTimesInput[]
): Promise<void> {
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

  for (const u of updates) {
    const [role] = await db
      .select()
      .from(roles)
      .where(
        and(
          eq(roles.id, u.roleId),
          eq(roles.organization_id, organization.id)
        )
      )
      .limit(1);
    if (!role) continue;

    const dayOfWeek = u.dayOfWeek ?? LOCATION_DAY_ALL;
    const morningStart = validateTimeLoc(u.morning.start);
    const morningEnd = validateTimeLoc(u.morning.end);
    const eveningStart = validateTimeLoc(u.evening.start);
    const eveningEnd = validateTimeLoc(u.evening.end);

    await db
      .insert(locationRoleShiftTimes)
      .values({
        location_id: locationId,
        role_id: u.roleId,
        shift_period: "morning",
        day_of_week: dayOfWeek,
        start_time: morningStart,
        end_time: morningEnd,
      })
      .onConflictDoUpdate({
        target: [
          locationRoleShiftTimes.location_id,
          locationRoleShiftTimes.role_id,
          locationRoleShiftTimes.shift_period,
          locationRoleShiftTimes.day_of_week,
        ],
        set: {
          start_time: morningStart,
          end_time: morningEnd,
          updated_at: new Date(),
        },
      });

    await db
      .insert(locationRoleShiftTimes)
      .values({
        location_id: locationId,
        role_id: u.roleId,
        shift_period: "evening",
        day_of_week: dayOfWeek,
        start_time: eveningStart,
        end_time: eveningEnd,
      })
      .onConflictDoUpdate({
        target: [
          locationRoleShiftTimes.location_id,
          locationRoleShiftTimes.role_id,
          locationRoleShiftTimes.shift_period,
          locationRoleShiftTimes.day_of_week,
        ],
        set: {
          start_time: eveningStart,
          end_time: eveningEnd,
          updated_at: new Date(),
        },
      });
  }

  revalidatePath(`/locations/${locationId}`);
  revalidatePath("/schedule");
}

/* ---------- Daily staffing overrides (monthly calendar) ---------- */

export async function getDailyStaffingForMonth(
  locationId: string,
  month: string // "YYYY-MM"
) {
  // Return empty if migration 0023 hasn't been applied yet
  if (!(await dailyTableExists())) return [];

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

  const firstDay = `${month}-01`;
  // Compute last day of month
  const [y, m] = month.split("-").map(Number);
  const lastDay = `${month}-${new Date(y, m, 0).getDate().toString().padStart(2, "0")}`;

  const rows = await db
    .select({
      id: dailyStaffingOverrides.id,
      role_id: dailyStaffingOverrides.role_id,
      date: dailyStaffingOverrides.date,
      shift_period: dailyStaffingOverrides.shift_period,
      required_count: dailyStaffingOverrides.required_count,
    })
    .from(dailyStaffingOverrides)
    .where(
      and(
        eq(dailyStaffingOverrides.location_id, locationId),
        gte(dailyStaffingOverrides.date, firstDay),
        lte(dailyStaffingOverrides.date, lastDay)
      )
    );

  return rows;
}

export async function updateDailyStaffingOverrides(
  locationId: string,
  month: string, // "YYYY-MM"
  updates: Array<{
    roleId: string;
    date: string; // "YYYY-MM-DD"
    shiftPeriod: string;
    requiredCount: number;
  }>
) {
  if (!(await dailyTableExists())) {
    throw new Error(
      "Tabella fabbisogno giornaliero non trovata. Esegui: npm run db:migrate"
    );
  }

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

  // Validate all dates belong to the specified month
  for (const u of updates) {
    if (!u.date.startsWith(month)) {
      throw new Error(`Data ${u.date} non appartiene al mese ${month}`);
    }
  }

  const firstDay = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const lastDay = `${month}-${new Date(y, m, 0).getDate().toString().padStart(2, "0")}`;

  // Delete all existing overrides for this location + month
  await db
    .delete(dailyStaffingOverrides)
    .where(
      and(
        eq(dailyStaffingOverrides.location_id, locationId),
        gte(dailyStaffingOverrides.date, firstDay),
        lte(dailyStaffingOverrides.date, lastDay)
      )
    );

  // Insert only rows that actually differ from the weekly template
  // Load current weekly template for comparison
  const weeklyTemplate = await db
    .select()
    .from(staffingRequirements)
    .where(eq(staffingRequirements.location_id, locationId));

  const templateMap = new Map<string, number>();
  for (const t of weeklyTemplate) {
    templateMap.set(
      `${t.role_id}_${t.day_of_week}_${t.shift_period}`,
      t.required_count
    );
  }

  for (const u of updates) {
    // Compute day_of_week for this date (0=Mon..6=Sun)
    const d = new Date(u.date + "T00:00:00");
    const jsDay = d.getUTCDay(); // 0=Sun..6=Sat
    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // → 0=Mon..6=Sun

    const templateKey = `${u.roleId}_${dayOfWeek}_${u.shiftPeriod}`;
    const templateCount = templateMap.get(templateKey) ?? 0;

    // Only store if different from template
    if (u.requiredCount !== templateCount) {
      await db.insert(dailyStaffingOverrides).values({
        location_id: locationId,
        role_id: u.roleId,
        date: u.date,
        shift_period: u.shiftPeriod as "morning" | "evening",
        required_count: u.requiredCount,
      });
    }
  }

  revalidatePath(`/locations/${locationId}`);
  revalidatePath("/schedule");
}
