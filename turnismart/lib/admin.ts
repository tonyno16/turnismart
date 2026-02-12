import { desc, eq, and, gte, sql, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  organizations,
  users,
  locations,
  employees,
} from "@/drizzle/schema";

export type AdminKpis = {
  totalOrganizations: number;
  totalUsers: number;
  activeOrganizations: number;
  trialOrgs: number;
  paidOrgs: number;
  recentSignups: number; // last 7 days
};

export async function getAdminKpis(): Promise<AdminKpis> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [orgCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(organizations);

  const [userCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);

  const [recentSignups] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(gte(users.created_at, weekAgo));

  const orgsList = await db
    .select({
      id: organizations.id,
      trial_ends_at: organizations.trial_ends_at,
      stripe_customer_id: organizations.stripe_customer_id,
    })
    .from(organizations);

  const now = new Date();
  let trialOrgs = 0;
  let paidOrgs = 0;
  for (const o of orgsList) {
    if (o.stripe_customer_id) paidOrgs++;
    else if (o.trial_ends_at && new Date(o.trial_ends_at) > now) trialOrgs++;
  }

  return {
    totalOrganizations: orgCount?.count ?? 0,
    totalUsers: userCount?.count ?? 0,
    activeOrganizations: orgCount?.count ?? 0,
    trialOrgs,
    paidOrgs,
    recentSignups: recentSignups?.count ?? 0,
  };
}

export type RecentOrg = {
  id: string;
  name: string;
  sector: string | null;
  onboarding_completed: boolean;
  trial_ends_at: Date | null;
  stripe_customer_id: string | null;
  created_at: Date;
  userCount: number;
  locationCount: number;
};

export async function getRecentOrganizations(limit = 10): Promise<RecentOrg[]> {
  const orgs = await db
    .select()
    .from(organizations)
    .orderBy(desc(organizations.created_at))
    .limit(limit);

  const result: RecentOrg[] = [];
  for (const o of orgs) {
    const [uc] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.organization_id, o.id));
    const [lc] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(locations)
      .where(eq(locations.organization_id, o.id));

    result.push({
      id: o.id,
      name: o.name,
      sector: o.sector,
      onboarding_completed: o.onboarding_completed,
      trial_ends_at: o.trial_ends_at,
      stripe_customer_id: o.stripe_customer_id,
      created_at: o.created_at,
      userCount: uc?.count ?? 0,
      locationCount: lc?.count ?? 0,
    });
  }
  return result;
}

export type AdminAlert = {
  type: "trial_expiring" | "onboarding_incomplete";
  organizationId: string;
  organizationName: string;
  message: string;
};

export async function getAdminAlerts(): Promise<AdminAlert[]> {
  const alerts: AdminAlert[] = [];
  const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const orgsWithTrial = await db
    .select()
    .from(organizations)
    .where(and(isNotNull(organizations.trial_ends_at), isNull(organizations.stripe_customer_id)));

  for (const o of orgsWithTrial) {
    if (!o.stripe_customer_id && o.trial_ends_at) {
      const endsAt = new Date(o.trial_ends_at);
      if (endsAt <= inThreeDays && endsAt > new Date()) {
        alerts.push({
          type: "trial_expiring",
          organizationId: o.id,
          organizationName: o.name,
          message: `Trial scade il ${endsAt.toLocaleDateString("it-IT")}`,
        });
      }
    }
  }

  const incompleteOnboarding = await db
    .select()
    .from(organizations)
    .where(eq(organizations.onboarding_completed, false))
    .limit(10);

  for (const o of incompleteOnboarding) {
    alerts.push({
      type: "onboarding_incomplete",
      organizationId: o.id,
      organizationName: o.name,
      message: "Onboarding non completato",
    });
  }

  return alerts;
}

export type OrgWithStats = RecentOrg & { employeeCount: number };

export async function getOrganizationsForAdmin(filters?: {
  search?: string;
  hasStripe?: boolean;
  onboardingComplete?: boolean;
}): Promise<OrgWithStats[]> {
  let query = db.select().from(organizations).orderBy(desc(organizations.created_at));

  const orgs = await query.limit(100);

  const result: OrgWithStats[] = [];
  for (const o of orgs) {
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      if (!o.name.toLowerCase().includes(search) && !(o.sector ?? "").toLowerCase().includes(search)) continue;
    }
    if (filters?.hasStripe !== undefined && (!!o.stripe_customer_id) !== filters.hasStripe) continue;
    if (filters?.onboardingComplete !== undefined && o.onboarding_completed !== filters.onboardingComplete) continue;

    const [uc] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.organization_id, o.id));
    const [lc] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(locations)
      .where(eq(locations.organization_id, o.id));
    const [ec] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(employees)
      .where(eq(employees.organization_id, o.id));

    result.push({
      id: o.id,
      name: o.name,
      sector: o.sector,
      onboarding_completed: o.onboarding_completed,
      trial_ends_at: o.trial_ends_at,
      stripe_customer_id: o.stripe_customer_id,
      created_at: o.created_at,
      userCount: uc?.count ?? 0,
      locationCount: lc?.count ?? 0,
      employeeCount: ec?.count ?? 0,
    });
  }
  return result;
}
