"use server";

import { redirect } from "next/navigation";
import { requireOrganization } from "@/lib/auth";
import { createPortalSession } from "@/lib/stripe";

export async function getStripePortalUrl(): Promise<{ url: string | null; error?: string }> {
  const { organization } = await requireOrganization();
  if (!organization.stripe_customer_id) {
    return { url: null, error: "Nessun abbonamento configurato. Sei in periodo di prova." };
  }
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = await createPortalSession(organization.stripe_customer_id, `${base}/profile`);
  if (!url) return { url: null, error: "Impossibile aprire il portale di gestione." };
  return { url };
}

export async function redirectToStripePortal() {
  const { url, error } = await getStripePortalUrl();
  if (error) throw new Error(error);
  if (url) redirect(url);
}
