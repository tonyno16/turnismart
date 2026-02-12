"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { organizations } from "@/drizzle/schema";
import { requireRole } from "@/lib/auth";

export async function extendTrial(organizationId: string, days: number) {
  await requireRole(["admin"]);
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);
  if (!org) throw new Error("Organizzazione non trovata");

  const current = org.trial_ends_at ? new Date(org.trial_ends_at) : new Date();
  const extended = current < new Date() ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : new Date(current.getTime() + days * 24 * 60 * 60 * 1000);

  await db
    .update(organizations)
    .set({ trial_ends_at: extended, updated_at: new Date() })
    .where(eq(organizations.id, organizationId));
}
