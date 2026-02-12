"use server";

import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { db } from "@/lib/db";
import { users, invitations, accountantClients, employees } from "@/drizzle/schema";
import { createOrganization } from "@/lib/organizations";

const TRIAL_DAYS = 30;

export type SignUpState = { error?: string };

export async function signUp(
  _prev: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string)?.trim();
  const organizationName = (formData.get("organizationName") as string)?.trim();
  const sector = (formData.get("sector") as string)?.trim() || undefined;

  if (!email || !password) {
    return { error: "Email e password sono obbligatori." };
  }
  if (password.length < 8) {
    return { error: "La password deve avere almeno 8 caratteri." };
  }
  if (!organizationName) {
    return { error: "Il nome dell'attività è obbligatorio." };
  }

  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: signUpError,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email`,
    },
  });

  if (signUpError) {
    if (signUpError.message.includes("already registered")) {
      return { error: "Questa email è già registrata. Prova ad accedere." };
    }
    if (signUpError.message.toLowerCase().includes("rate limit") || signUpError.message.toLowerCase().includes("rate_limit")) {
      return { error: "Troppi tentativi di registrazione. Attendi circa 1 ora e riprova, oppure prova ad accedere se hai già un account." };
    }
    return { error: signUpError.message };
  }

  if (!authUser) {
    return { error: "Errore durante la registrazione." };
  }

  try {
    const org = await createOrganization({
      name: organizationName,
      sector,
      email,
      trialDays: TRIAL_DAYS,
    });

    await db.insert(users).values({
      id: authUser.id,
      email,
      full_name: fullName || null,
      organization_id: org.id,
      role: "owner",
    });
  } catch (e) {
    console.error("Signup: failed to create org/user", e);
    return { error: "Errore nella creazione dell'organizzazione. Riprova." };
  }

  redirect("/auth/verify-email?email=" + encodeURIComponent(email));
}

export async function login(_prev: { error?: string }, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email e password sono obbligatori." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { error: "Email o password non corretti." };
    }
    return { error: error.message };
  }

  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";
  redirect(redirectTo);
}

export async function signInWithGoogle(redirectTo = "/dashboard") {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
  if (error) throw new Error(error.message);
  if (data?.url) redirect(data.url);
  throw new Error("OAuth URL non ricevuta");
}

export async function signInWithGoogleForm(formData: FormData) {
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";
  try {
    await signInWithGoogle(redirectTo);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "digest" in e && String((e as { digest?: string }).digest)?.startsWith("NEXT_REDIRECT")) {
      throw e;
    }
    const msg = e instanceof Error ? e.message : "Errore login Google";
    redirect(`/auth/login?error=${encodeURIComponent(msg)}&redirectTo=${encodeURIComponent(redirectTo)}`);
  }
}

export async function forgotPassword(
  _prev: { error?: string; ok?: boolean },
  formData: FormData
) {
  const email = (formData.get("email") as string)?.trim();
  if (!email) return { error: "Inserisci l'email." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) return { error: error.message };
  return { ok: true };
}

export async function acceptInvite(
  token: string,
  formData: FormData
): Promise<{ error?: string }> {
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string)?.trim();

  if (!password || password.length < 8) {
    return { error: "La password deve avere almeno 8 caratteri." };
  }

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(
      and(eq(invitations.token, token), eq(invitations.status, "pending"))
    )
    .limit(1);

  if (!invitation) {
    return { error: "Invito non valido o scaduto." };
  }

  if (new Date() > invitation.expires_at) {
    await db
      .update(invitations)
      .set({ status: "expired" })
      .where(eq(invitations.id, invitation.id));
    return { error: "Invito scaduto." };
  }

  const supabase = createServiceClient();

  const {
    data: { user: authUser },
    error: signUpError,
  } = await supabase.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (signUpError) {
    if (signUpError.message.includes("already been registered")) {
      const { data: existing } = await supabase.auth.admin.listUsers();
      const existingUser = existing?.users?.find(
        (u) => u.email === invitation.email
      );
      if (existingUser) {
        const [existingDbUser] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.id, existingUser.id))
          .limit(1);
        if (!existingDbUser) {
          await db.insert(users).values({
            id: existingUser.id,
            email: invitation.email,
            full_name: fullName || null,
            organization_id: invitation.organization_id,
            role: invitation.role as "manager" | "employee" | "accountant",
          });
        }
        if (invitation.role === "accountant") {
          await db.insert(accountantClients).values({
            accountant_user_id: existingUser.id,
            organization_id: invitation.organization_id,
            status: "active",
            accepted_at: new Date(),
          });
        }
        if (invitation.role === "employee") {
          await db
            .update(employees)
            .set({ user_id: existingUser.id, updated_at: new Date() })
            .where(
              and(
                eq(employees.organization_id, invitation.organization_id),
                eq(employees.email, invitation.email)
              )
            );
        }
        await db
          .update(invitations)
          .set({
            status: "accepted",
            accepted_at: new Date(),
          })
          .where(eq(invitations.id, invitation.id));
        redirect("/auth/login?invite=accepted");
      }
    }
    return { error: signUpError.message };
  }

  if (!authUser) return { error: "Errore nella creazione dell'account." };

  await db.insert(users).values({
    id: authUser.id,
    email: invitation.email,
    full_name: fullName || null,
    organization_id: invitation.organization_id,
    role: invitation.role as "manager" | "employee" | "accountant",
  });

  if (invitation.role === "accountant") {
    await db.insert(accountantClients).values({
      accountant_user_id: authUser.id,
      organization_id: invitation.organization_id,
      status: "active",
      accepted_at: new Date(),
    });
  }

  if (invitation.role === "employee") {
    await db
      .update(employees)
      .set({ user_id: authUser.id, updated_at: new Date() })
      .where(
        and(
          eq(employees.organization_id, invitation.organization_id),
          eq(employees.email, invitation.email)
        )
      );
  }

  await db
    .update(invitations)
    .set({
      status: "accepted",
      accepted_at: new Date(),
    })
    .where(eq(invitations.id, invitation.id));

  redirect("/auth/login?invite=accepted");
}
