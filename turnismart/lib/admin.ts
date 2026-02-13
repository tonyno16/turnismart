import { desc, eq, and, gte, sql, isNotNull, isNull, inArray } from "drizzle-orm";
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
  const now = new Date();

  const [orgCount, userCount, recentSignups, paidOrgsRow, trialOrgsRow] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(organizations),
      db.select({ count: sql<number>`count(*)::int` }).from(users),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(gte(users.created_at, weekAgo)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(organizations)
        .where(isNotNull(organizations.stripe_customer_id)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(organizations)
        .where(
          and(
            isNull(organizations.stripe_customer_id),
            isNotNull(organizations.trial_ends_at),
            gte(organizations.trial_ends_at, now)
          )
        ),
    ]);

  return {
    totalOrganizations: orgCount[0]?.count ?? 0,
    totalUsers: userCount[0]?.count ?? 0,
    activeOrganizations: orgCount[0]?.count ?? 0,
    trialOrgs: trialOrgsRow[0]?.count ?? 0,
    paidOrgs: paidOrgsRow[0]?.count ?? 0,
    recentSignups: recentSignups[0]?.count ?? 0,
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

  if (orgs.length === 0) return [];

  const orgIds = orgs.map((o) => o.id);

  const [userCounts, locationCounts] = await Promise.all([
    db
      .select({
        organization_id: users.organization_id,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(inArray(users.organization_id, orgIds))
      .groupBy(users.organization_id),
    db
      .select({
        organization_id: locations.organization_id,
        count: sql<number>`count(*)::int`,
      })
      .from(locations)
      .where(inArray(locations.organization_id, orgIds))
      .groupBy(locations.organization_id),
  ]);

  const ucMap = new Map(
    userCounts.map((r) => [r.organization_id!, r.count])
  );
  const lcMap = new Map(
    locationCounts.map((r) => [r.organization_id!, r.count])
  );

  return orgs.map((o) => ({
    id: o.id,
    name: o.name,
    sector: o.sector,
    onboarding_completed: o.onboarding_completed,
    trial_ends_at: o.trial_ends_at,
    stripe_customer_id: o.stripe_customer_id,
    created_at: o.created_at,
    userCount: ucMap.get(o.id) ?? 0,
    locationCount: lcMap.get(o.id) ?? 0,
  }));
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
  const whereConditions: Parameters<typeof and>[0][] = [];
  if (filters?.hasStripe !== undefined) {
    whereConditions.push(
      filters.hasStripe
        ? isNotNull(organizations.stripe_customer_id)
        : isNull(organizations.stripe_customer_id)
    );
  }
  if (filters?.onboardingComplete !== undefined) {
    whereConditions.push(
      eq(organizations.onboarding_completed, filters.onboardingComplete)
    );
  }

  const baseQuery = db
    .select()
    .from(organizations)
    .orderBy(desc(organizations.created_at));

  const orgs = await (whereConditions.length > 0
    ? baseQuery.where(and(...whereConditions)).limit(100)
    : baseQuery.limit(100));
  if (orgs.length === 0) return [];

  const orgIds = orgs.map((o) => o.id);

  const [userCounts, locationCounts, employeeCounts] = await Promise.all([
    db
      .select({
        organization_id: users.organization_id,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(inArray(users.organization_id, orgIds))
      .groupBy(users.organization_id),
    db
      .select({
        organization_id: locations.organization_id,
        count: sql<number>`count(*)::int`,
      })
      .from(locations)
      .where(inArray(locations.organization_id, orgIds))
      .groupBy(locations.organization_id),
    db
      .select({
        organization_id: employees.organization_id,
        count: sql<number>`count(*)::int`,
      })
      .from(employees)
      .where(inArray(employees.organization_id, orgIds))
      .groupBy(employees.organization_id),
  ]);

  const ucMap = new Map(userCounts.map((r) => [r.organization_id!, r.count]));
  const lcMap = new Map(
    locationCounts.map((r) => [r.organization_id!, r.count])
  );
  const ecMap = new Map(
    employeeCounts.map((r) => [r.organization_id!, r.count])
  );

  const search = filters?.search?.toLowerCase();
  return orgs
    .filter((o) => {
      if (search) {
        const match =
          o.name.toLowerCase().includes(search) ||
          (o.sector ?? "").toLowerCase().includes(search);
        if (!match) return false;
      }
      return true;
    })
    .map((o) => ({
      id: o.id,
      name: o.name,
      sector: o.sector,
      onboarding_completed: o.onboarding_completed,
      trial_ends_at: o.trial_ends_at,
      stripe_customer_id: o.stripe_customer_id,
      created_at: o.created_at,
      userCount: ucMap.get(o.id) ?? 0,
      locationCount: lcMap.get(o.id) ?? 0,
      employeeCount: ecMap.get(o.id) ?? 0,
    }));
}
