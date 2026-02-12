"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { roles } from "@/drizzle/schema";
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
