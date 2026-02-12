import { sql, gte, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { organizations, users, usageTracking } from "@/drizzle/schema";

export type PlanDistribution = {
  trial: number;
  paid: number;
  free: number;
};

export async function getPlanDistribution(): Promise<PlanDistribution> {
  const orgs = await db
    .select({
      stripe_customer_id: organizations.stripe_customer_id,
      trial_ends_at: organizations.trial_ends_at,
    })
    .from(organizations);

  const now = new Date();
  let trial = 0;
  let paid = 0;
  let free = 0;

  for (const o of orgs) {
    if (o.stripe_customer_id) paid++;
    else if (o.trial_ends_at && new Date(o.trial_ends_at) > now) trial++;
    else free++;
  }

  return { trial, paid, free };
}

export type UsageStats = {
  month: string;
  totalOrgs: number;
  totalLocations: number;
  totalEmployees: number;
  aiGenerations: number;
  reportsGenerated: number;
};

export async function getCurrentMonthUsage(): Promise<UsageStats> {
  const month = new Date().toISOString().slice(0, 7);

  const rows = await db
    .select()
    .from(usageTracking)
    .where(eq(usageTracking.month, month));

  const totals = rows.reduce(
    (acc, r) => ({
      totalLocations: acc.totalLocations + r.locations_count,
      totalEmployees: acc.totalEmployees + r.employees_count,
      aiGenerations: acc.aiGenerations + r.ai_generations_count,
      reportsGenerated: acc.reportsGenerated + r.reports_generated_count,
    }),
    { totalLocations: 0, totalEmployees: 0, aiGenerations: 0, reportsGenerated: 0 }
  );

  return {
    month,
    totalOrgs: rows.length,
    totalLocations: totals.totalLocations,
    totalEmployees: totals.totalEmployees,
    aiGenerations: totals.aiGenerations,
    reportsGenerated: totals.reportsGenerated,
  };
}

export type SignupTrend = {
  date: string;
  count: number;
};

export async function getSignupTrend(days = 14): Promise<SignupTrend[]> {
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const startStr = start.toISOString().slice(0, 10);

  const rows = await db
    .select({
      date: sql<string>`DATE(created_at)::text`,
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .where(gte(users.created_at, start))
    .groupBy(sql`DATE(created_at)`)
    .orderBy(sql`DATE(created_at)`);

  return rows.map((r) => ({ date: r.date, count: r.count }));
}
