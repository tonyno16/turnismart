"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import {
  invitations,
  users,
  accountantClients,
  organizations,
} from "@/drizzle/schema";
import { requireOrganization } from "@/lib/auth";
import { sendEmail } from "@/lib/resend";

const INVITE_EXPIRY_DAYS = 7;

export type InviteAccountantResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function inviteAccountant(email: string): Promise<InviteAccountantResult> {
  const { user, organization } = await requireOrganization();
  const userRole = user.role;
  if (userRole !== "owner" && userRole !== "manager") {
    return { ok: false, error: "Solo titolare o manager può invitare un commercialista." };
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) return { ok: false, error: "Email obbligatoria" };

  const org = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, organization.id))
    .limit(1);
  const orgName = org[0]?.name ?? "questa attività";

  const [existingUser] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.email, trimmedEmail))
    .limit(1);

  if (existingUser?.role === "accountant") {
    const [existingLink] = await db
      .select()
      .from(accountantClients)
      .where(
        and(
          eq(accountantClients.accountant_user_id, existingUser.id),
          eq(accountantClients.organization_id, organization.id)
        )
      )
      .limit(1);

    if (existingLink) {
      return { ok: false, error: "Questo commercialista è già collegato alla tua attività." };
    }

    await db.insert(accountantClients).values({
      accountant_user_id: existingUser.id,
      organization_id: organization.id,
      status: "active",
    });

    revalidatePath("/settings/accountant");
    return {
      ok: true,
      message: `${trimmedEmail} collegato. Può accedere al portale commercialista.`,
    };
  }

  const [existingInvite] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.organization_id, organization.id),
        eq(invitations.email, trimmedEmail),
        eq(invitations.role, "accountant"),
        eq(invitations.status, "pending")
      )
    )
    .limit(1);

  if (existingInvite) {
    return { ok: false, error: "Invito già inviato a questa email. Controlla la posta." };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  await db.insert(invitations).values({
    organization_id: organization.id,
    invited_by_user_id: user.id,
    email: trimmedEmail,
    role: "accountant",
    token,
    status: "pending",
    expires_at: expiresAt,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/auth/invite/${token}`;

  const emailResult = await sendEmail({
    to: trimmedEmail,
    subject: `Invito commercialista - ${orgName}`,
    html: `
      <p>Ciao,</p>
      <p>Sei stato invitato come <strong>commercialista</strong> per <strong>${orgName}</strong> su TurniSmart.</p>
      <p>Per accettare, crea un account (o accedi se ne hai già uno) cliccando qui:</p>
      <p><a href="${inviteUrl}">${inviteUrl}</a></p>
      <p>L'invito scade tra ${INVITE_EXPIRY_DAYS} giorni.</p>
      <p>TurniSmart</p>
    `,
  });

  if (!emailResult.ok) {
    return { ok: false, error: `Invito creato ma email non inviata: ${emailResult.error}` };
  }

  revalidatePath("/settings/accountant");
  return {
    ok: true,
    message: `Invito inviato a ${trimmedEmail}. Il commercialista riceverà un'email con il link.`,
  };
}

export async function revokeAccountant(accountantUserId: string): Promise<{ ok: boolean; error?: string }> {
  const { user, organization } = await requireOrganization();
  if (user.role !== "owner" && user.role !== "manager") {
    return { ok: false, error: "Non autorizzato" };
  }

  await db
    .delete(accountantClients)
    .where(
      and(
        eq(accountantClients.accountant_user_id, accountantUserId),
        eq(accountantClients.organization_id, organization.id)
      )
    );

  revalidatePath("/settings/accountant");
  return { ok: true };
}

export async function getLinkedAccountants() {
  const { organization } = await requireOrganization();

  return db
    .select({
      id: accountantClients.id,
      accountantUserId: users.id,
      accountantEmail: users.email,
      accountantName: users.full_name,
      status: accountantClients.status,
    })
    .from(accountantClients)
    .innerJoin(users, eq(accountantClients.accountant_user_id, users.id))
    .where(eq(accountantClients.organization_id, organization.id));
}
