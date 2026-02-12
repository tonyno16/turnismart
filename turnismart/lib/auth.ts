import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import type { UserRole } from "@/drizzle/schema";

export type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>> extends Promise<infer T> ? T : never;
export type CurrentOrganization = Awaited<ReturnType<typeof getCurrentOrganization>> extends Promise<infer T> ? T : never;

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const [appUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!appUser) return null;

  return {
    id: appUser.id,
    email: appUser.email,
    full_name: appUser.full_name,
    phone: appUser.phone,
    avatar_url: appUser.avatar_url,
    role: appUser.role as UserRole,
    is_active: appUser.is_active,
    organization_id: appUser.organization_id,
  };
}

export async function getCurrentOrganization() {
  const user = await getCurrentUser();
  if (!user?.organization_id) return null;

  const { getOrganization } = await import("@/lib/organizations");
  return getOrganization(user.organization_id);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireOrganization() {
  const user = await requireUser();
  if (!user.organization_id) throw new Error("No organization");
  const org = await getCurrentOrganization();
  if (!org) throw new Error("Organization not found");
  return { user, organization: org };
}
