import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { organizations } from "@/drizzle/schema";

export async function getOrganization(id: string) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);
  return org ?? null;
}

export async function getOrganizationBySlug(slug: string) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);
  return org ?? null;
}

export async function updateOrganization(
  id: string,
  data: {
    name?: string;
    slug?: string;
    sector?: string;
    logo_url?: string;
    phone?: string;
    email?: string;
    onboarding_completed?: boolean;
  }
) {
  const [updated] = await db
    .update(organizations)
    .set({
      ...data,
      updated_at: new Date(),
    })
    .where(eq(organizations.id, id))
    .returning();
  return updated ?? null;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function createOrganization(params: {
  name: string;
  sector?: string;
  email?: string;
  phone?: string;
  trialDays?: number;
}) {
  const baseSlug = generateSlug(params.name);
  let slug = baseSlug;
  let attempt = 0;
  while (await getOrganizationBySlug(slug)) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const trialEndsAt = params.trialDays
    ? new Date(Date.now() + params.trialDays * 24 * 60 * 60 * 1000)
    : null;

  const [org] = await db
    .insert(organizations)
    .values({
      name: params.name,
      slug,
      sector: params.sector ?? null,
      email: params.email ?? null,
      phone: params.phone ?? null,
      trial_ends_at: trialEndsAt,
    })
    .returning();

  return org!;
}
