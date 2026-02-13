"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { roles, roleShiftTimes, DAY_ALL } from "@/drizzle/schema";
import { requireOrganization } from "@/lib/auth";

export async function createRole(formData: FormData) {
  const { organization } = await requireOrganization();
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Nome mansione obbligatorio");

  const [role] = await db
    .insert(roles)
    .values({
      organization_id: organization.id,
      name,
      color: (formData.get("color") as string)?.trim() || "#3B82F6",
    })
    .returning();
  revalidatePath("/settings/roles");
  revalidatePath("/employees");
  revalidatePath("/employees/new");
  revalidatePath("/locations");
  revalidatePath("/onboarding");
  return role;
}

export async function updateRole(roleId: string, formData: FormData) {
  const { organization } = await requireOrganization();
  const [role] = await db
    .select()
    .from(roles)
    .where(
      and(
        eq(roles.id, roleId),
        eq(roles.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!role) throw new Error("Mansione non trovata");

  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Nome mansione obbligatorio");

  await db
    .update(roles)
    .set({
      name,
      color: (formData.get("color") as string)?.trim() || (role.color ?? "#3B82F6"),
    })
    .where(eq(roles.id, roleId));
  revalidatePath("/settings/roles");
  revalidatePath("/employees");
  revalidatePath("/locations");
}

export async function deleteRole(roleId: string) {
  const { organization } = await requireOrganization();
  const [role] = await db
    .select()
    .from(roles)
    .where(
      and(
        eq(roles.id, roleId),
        eq(roles.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!role) throw new Error("Mansione non trovata");

  await db.delete(roles).where(eq(roles.id, roleId));
  revalidatePath("/settings/roles");
  revalidatePath("/employees");
  revalidatePath("/locations");
}

export type RoleShiftTimesInput = {
  roleId: string;
  dayOfWeek: number; // 0-6=specific day, 7=all days (DAY_ALL)
  morning: { start: string; end: string };
  evening: { start: string; end: string };
};

function validateTime(s: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return "08:00";
  const h = Math.max(0, Math.min(23, parseInt(m[1], 10)));
  const min = Math.max(0, Math.min(59, parseInt(m[2], 10)));
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

export async function updateRoleShiftTimes(
  updates: RoleShiftTimesInput[]
): Promise<void> {
  const { organization } = await requireOrganization();

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

    const morningStart = validateTime(u.morning.start);
    const morningEnd = validateTime(u.morning.end);
    const eveningStart = validateTime(u.evening.start);
    const eveningEnd = validateTime(u.evening.end);

    const dayOfWeek = u.dayOfWeek ?? DAY_ALL;
    await db
      .insert(roleShiftTimes)
      .values({
        role_id: u.roleId,
        shift_period: "morning",
        day_of_week: dayOfWeek,
        start_time: morningStart,
        end_time: morningEnd,
      })
      .onConflictDoUpdate({
        target: [
          roleShiftTimes.role_id,
          roleShiftTimes.shift_period,
          roleShiftTimes.day_of_week,
        ],
        set: {
          start_time: morningStart,
          end_time: morningEnd,
          updated_at: new Date(),
        },
      });

    await db
      .insert(roleShiftTimes)
      .values({
        role_id: u.roleId,
        shift_period: "evening",
        day_of_week: dayOfWeek,
        start_time: eveningStart,
        end_time: eveningEnd,
      })
      .onConflictDoUpdate({
        target: [
          roleShiftTimes.role_id,
          roleShiftTimes.shift_period,
          roleShiftTimes.day_of_week,
        ],
        set: {
          start_time: eveningStart,
          end_time: eveningEnd,
          updated_at: new Date(),
        },
      });
  }

  revalidatePath("/settings/roles");
  revalidatePath("/schedule");
}
