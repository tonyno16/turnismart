import Stripe from "stripe";
import { db } from "@/lib/db";
import { organizations } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

let stripe: Stripe | null = null;

export export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

export type PlanSlug = "trial" | "starter" | "pro" | "business";

const PLAN_LIMITS: Record<PlanSlug, { locations: number; employees: number; aiGenerations: number; reports: number }> = {
  trial: { locations: 3, employees: 15, aiGenerations: 10, reports: 5 },
  starter: { locations: 2, employees: 10, aiGenerations: 5, reports: 3 },
  pro: { locations: 5, employees: 25, aiGenerations: 20, reports: 10 },
  business: { locations: 20, employees: 100, aiGenerations: 50, reports: 999 },
};

/** Map Stripe price ID to plan (from env or common naming) */
function priceIdToPlan(priceId: string | undefined): PlanSlug | null {
  if (!priceId) return null;
  const p = priceId.toLowerCase();
  if (p.includes("starter")) return "starter";
  if (p.includes("pro")) return "pro";
  if (p.includes("business")) return "business";
  return null;
}

export async function getOrganizationPlan(organizationId: string): Promise<{
  plan: PlanSlug;
  isTrial: boolean;
  trialEndsAt: Date | null;
}> {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);
  if (!org) return { plan: "starter", isTrial: false, trialEndsAt: null };

  const now = new Date();
  const trialEndsAt = org.trial_ends_at ? new Date(org.trial_ends_at) : null;
  const isTrialActive = trialEndsAt && trialEndsAt > now;

  if (isTrialActive) {
    return { plan: "trial", isTrial: true, trialEndsAt };
  }

  const s = getStripe();
  if (!s || !org.stripe_customer_id) {
    return { plan: "starter", isTrial: false, trialEndsAt: null };
  }

  try {
    const subs = await s.subscriptions.list({
      customer: org.stripe_customer_id,
      status: "active",
      limit: 1,
    });
    const sub = subs.data[0];
    const priceId = sub?.items.data[0]?.price?.id;
    const plan = priceIdToPlan(priceId);
    return { plan: plan ?? "starter", isTrial: false, trialEndsAt: null };
  } catch {
    return { plan: "starter", isTrial: false, trialEndsAt: null };
  }
}

export function getPlanLimits(plan: PlanSlug) {
  return PLAN_LIMITS[plan];
}

/**
 * Create a Stripe Billing Portal session URL for the customer to manage their subscription.
 */
export async function createPortalSession(customerId: string, returnUrl: string): Promise<string | null> {
  const s = getStripe();
  if (!s) return null;
  try {
    const session = await s.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  } catch {
    return null;
  }
}
