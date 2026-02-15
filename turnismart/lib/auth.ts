import { cache } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { createOrganization } from "@/lib/organizations";
import { users, employees } from "@/drizzle/schema";
import type { UserRole } from "@/drizzle/schema";
import type { User } from "@supabase/supabase-js";

const TRIAL_DAYS = 30;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function isUniqueViolation(e: unknown): boolean {
  const err = (e && typeof e === "object" && "cause" in e ? (e as { cause?: unknown }).cause : e) as { code?: string } | null;
  return err != null && typeof err === "object" && err.code === "23505";
}

/** Create org; on slug collision retry with unique suffix (race condition). */
async function provisionOrganization(
  name: string,
  email?: string
): Promise<{ id: string }> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const orgName = attempt === 0 ? name : `${name} ${Date.now().toString(36)}`;
      return await createOrganization({
        name: orgName,
        email,
        trialDays: TRIAL_DAYS,
      });
    } catch (e: unknown) {
      if (!isUniqueViolation(e) || attempt === 2) throw e;
    }
  }
  throw new Error("Provision organization failed");
}

/** Insert user or link existing (same email, different auth id). */
async function provisionUser(authUser: User, organizationId: string): Promise<void> {
  try {
    await db.insert(users).values({
      id: authUser.id,
      email: authUser.email!,
      full_name: authUser.user_metadata?.full_name ?? null,
      organization_id: organizationId,
      role: "owner",
    });
  } catch (e: unknown) {
    if (isUniqueViolation(e)) {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, authUser.email!))
        .limit(1);
      if (existing && existing.id !== authUser.id) {
        // Update auth ID without deleting, preserving FK references
        await db
          .update(users)
          .set({
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name ?? existing.full_name,
          })
          .where(eq(users.id, existing.id));
        return;
      }
    }
    throw e;
  }
}

export type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>> extends Promise<infer T> ? T : never;
export type CurrentOrganization = Awaited<ReturnType<typeof getCurrentOrganization>> extends Promise<infer T> ? T : never;

/** Returns Supabase auth user or null. Cached per-request via React.cache(). */
export const getSupabaseUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getCurrentUser = cache(async () => {
  const authUser = await getSupabaseUser();

  if (!authUser) return null;

  let appUser: typeof users.$inferSelect | undefined;
  try {
    [appUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);
  } catch (e) {
    throw e;
  }

  if (!appUser) {
    // Provision on first access: auth user exists but no app record (OAuth, legacy, etc.)
    try {
      const name =
        (authUser.user_metadata?.full_name as string) ||
        authUser.email?.split("@")[0] ||
        "La mia attività";
      let org = await provisionOrganization(name, authUser.email ?? undefined);
      await provisionUser(authUser, org.id);
      [appUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.id))
        .limit(1);
    } catch (e) {
      // Race or duplicate: refetch by auth id (another request may have created it)
      [appUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.id))
        .limit(1);
      if (!appUser) return null;
    }
  }

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
});

export async function getCurrentOrganization() {
  const user = await getCurrentUser();
  if (!user?.organization_id) return null;

  const { getOrganization } = await import("@/lib/organizations");
  return getOrganization(user.organization_id);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const h = await headers();
    const pathname = h.get("x-pathname") ?? "/dashboard";
    const loginUrl = "/auth/login?redirectTo=" + encodeURIComponent(pathname);
    const authUser = await getSupabaseUser();
    if (authUser) {
      redirect("/auth/signout?redirectTo=" + encodeURIComponent(loginUrl));
    }
    redirect(loginUrl);
  }
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

/** Get employee record for current user (by user_id link) */
export async function getEmployeeForUser(userId: string) {
  const [emp] = await db
    .select()
    .from(employees)
    .where(eq(employees.user_id, userId))
    .limit(1);
  return emp ?? null;
}

/** Require current user to be an employee with linked employee record */
export async function requireEmployee() {
  const user = await requireUser();
  const emp = await getEmployeeForUser(user.id);
  if (!emp) throw new Error("Dipendente non collegato all'account");
  return { user, employee: emp };
}
