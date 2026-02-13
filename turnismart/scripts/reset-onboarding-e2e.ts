/**
 * Reset completo onboarding per l'utente E2E (dati + flag).
 * CLI: npx tsx scripts/reset-onboarding-e2e.ts
 * Import: import { resetOnboardingE2e } from "../scripts/reset-onboarding-e2e"
 * Usa TEST_USER_EMAIL da e2e/.env.test e DATABASE_URL da .env.local.
 */
import "./load-env-e2e";
import { eq, inArray } from "drizzle-orm";
import { db } from "../lib/db";
import {
  users,
  organizations,
  schedules,
  scheduleTemplates,
  staffingRequirements,
  locations,
  roles,
  employees,
} from "../drizzle/schema";

export async function resetOnboardingE2e(): Promise<void> {
  const email = process.env.TEST_USER_EMAIL;
  if (!email) {
    throw new Error("TEST_USER_EMAIL non impostata. Usa e2e/.env.test");
  }

  const [user] = await db
    .select({ id: users.id, organization_id: users.organization_id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !user.organization_id) {
    throw new Error(`Utente non trovato per email: ${email}`);
  }
  const orgId = user.organization_id;

  await db.transaction(async (tx) => {
    await tx.delete(schedules).where(eq(schedules.organization_id, orgId));
    await tx
      .delete(scheduleTemplates)
      .where(eq(scheduleTemplates.organization_id, orgId));
    const locs = await tx
      .select({ id: locations.id })
      .from(locations)
      .where(eq(locations.organization_id, orgId));
    const locIds = locs.map((l) => l.id);
    if (locIds.length > 0) {
      await tx
        .delete(staffingRequirements)
        .where(inArray(staffingRequirements.location_id, locIds));
    }
    await tx.delete(employees).where(eq(employees.organization_id, orgId));
    await tx.delete(locations).where(eq(locations.organization_id, orgId));
    await tx.delete(roles).where(eq(roles.organization_id, orgId));
    await tx
      .update(organizations)
      .set({
        sector: null,
        onboarding_completed: false,
        updated_at: new Date(),
      })
      .where(eq(organizations.id, orgId));
  });
}

// Esegui quando invocato come script CLI (npx tsx scripts/reset-onboarding-e2e.ts)
if (process.argv[1]?.includes("reset-onboarding-e2e")) {
  resetOnboardingE2e()
    .then(() => {
      console.log("Onboarding resettato (dati + flag) per org E2E");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
