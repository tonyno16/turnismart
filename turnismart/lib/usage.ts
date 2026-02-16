import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { usageTracking, locations, employees } from "@/drizzle/schema";
import { getOrganizationPlan, getPlanLimits, type PlanSlug } from "./stripe";

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);

export type UsageRecord = {
  month: string;
  locations_count: number;
  employees_count: number;
  ai_generations_count: number;
  reports_generated_count: number;
  whatsapp_messages_sent: number;
  email_messages_sent: number;
};

export async function getOrCreateMonthlyUsage(
  organizationId: string
): Promise<UsageRecord> {
  const [existing] = await db
    .select()
    .from(usageTracking)
    .where(
      and(
        eq(usageTracking.organization_id, organizationId),
        eq(usageTracking.month, CURRENT_MONTH)
      )
    )
    .limit(1);

  if (existing) {
    const [locCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(locations)
      .where(eq(locations.organization_id, organizationId));
    const [empCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(employees)
      .where(eq(employees.organization_id, organizationId));

    await db
      .update(usageTracking)
      .set({
        locations_count: locCount?.count ?? 0,
        employees_count: empCount?.count ?? 0,
        updated_at: new Date(),
      })
      .where(eq(usageTracking.id, existing.id));

    return {
      month: existing.month,
      locations_count: locCount?.count ?? 0,
      employees_count: empCount?.count ?? 0,
      ai_generations_count: existing.ai_generations_count,
      reports_generated_count: existing.reports_generated_count,
      whatsapp_messages_sent: existing.whatsapp_messages_sent,
      email_messages_sent: existing.email_messages_sent,
    };
  }

  const [locCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(locations)
    .where(eq(locations.organization_id, organizationId));
  const [empCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(employees)
    .where(eq(employees.organization_id, organizationId));

  const [created] = await db
    .insert(usageTracking)
    .values({
      organization_id: organizationId,
      month: CURRENT_MONTH,
      locations_count: locCount?.count ?? 0,
      employees_count: empCount?.count ?? 0,
    })
    .returning();

  return {
    month: created!.month,
    locations_count: created!.locations_count,
    employees_count: created!.employees_count,
    ai_generations_count: created!.ai_generations_count,
    reports_generated_count: created!.reports_generated_count,
    whatsapp_messages_sent: created!.whatsapp_messages_sent,
    email_messages_sent: created!.email_messages_sent,
  };
}

export async function incrementUsage(
  organizationId: string,
  field: "ai_generations_count" | "reports_generated_count" | "whatsapp_messages_sent" | "email_messages_sent"
) {
  const usage = await getOrCreateMonthlyUsage(organizationId);
  const current = usage[field];
  const [row] = await db
    .select()
    .from(usageTracking)
    .where(
      and(
        eq(usageTracking.organization_id, organizationId),
        eq(usageTracking.month, CURRENT_MONTH)
      )
    )
    .limit(1);

  if (row) {
    await db
      .update(usageTracking)
      .set({
        [field]: current + 1,
        updated_at: new Date(),
      })
      .where(eq(usageTracking.id, row.id));
  }
}

export type QuotaResource = "locations" | "employees" | "ai_generations" | "reports";

/** Restituisce true se l'organizzazione ha generazioni AI illimitate (whitelist UNLIMITED_AI_ORG_IDS) */
export function hasUnlimitedAi(organizationId: string): boolean {
  const ids = (process.env.UNLIMITED_AI_ORG_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.includes(organizationId);
}

export type QuotaCheckResult = {
  allowed: boolean;
  used: number;
  limit: number;
  plan: PlanSlug;
  message?: string;
};

export async function checkQuota(
  organizationId: string,
  resource: QuotaResource
): Promise<QuotaCheckResult> {
  const usage = await getOrCreateMonthlyUsage(organizationId);
  const { plan } = await getOrganizationPlan(organizationId);
  const limits = getPlanLimits(plan);

  switch (resource) {
    case "locations":
      return {
        allowed: usage.locations_count < limits.locations,
        used: usage.locations_count,
        limit: limits.locations,
        plan,
        message:
          usage.locations_count >= limits.locations
            ? `Limite sedi raggiunto (${limits.locations}). Passa a un piano superiore.`
            : undefined,
      };
    case "employees":
      return {
        allowed: usage.employees_count < limits.employees,
        used: usage.employees_count,
        limit: limits.employees,
        plan,
        message:
          usage.employees_count >= limits.employees
            ? `Limite dipendenti raggiunto (${limits.employees}). Passa a un piano superiore.`
            : undefined,
      };
    case "ai_generations": {
      const unlimitedOrgIds = (process.env.UNLIMITED_AI_ORG_IDS ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      const hasUnlimited = unlimitedOrgIds.includes(organizationId);

      return {
        allowed: hasUnlimited || usage.ai_generations_count < limits.aiGenerations,
        used: usage.ai_generations_count,
        limit: hasUnlimited ? 999999 : limits.aiGenerations,
        plan,
        message:
          !hasUnlimited && usage.ai_generations_count >= limits.aiGenerations
            ? `Limite generazioni AI mensili raggiunto (${limits.aiGenerations}). Passa a un piano superiore.`
            : undefined,
      };
    }
    case "reports":
      return {
        allowed: usage.reports_generated_count < limits.reports,
        used: usage.reports_generated_count,
        limit: limits.reports,
        plan,
        message:
          usage.reports_generated_count >= limits.reports
            ? `Limite report mensili raggiunto (${limits.reports}). Passa a un piano superiore.`
            : undefined,
      };
    default:
      return { allowed: true, used: 0, limit: 999, plan };
  }
}
