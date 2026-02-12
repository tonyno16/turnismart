import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { invitations } from "@/drizzle/schema";
import { AcceptInviteForm } from "./accept-invite-form";

export const metadata = {
  title: "Accetta invito",
  description: "Accetta l'invito a unirti all'organizzazione su TurniSmart.",
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.token, token), eq(invitations.status, "pending")))
    .limit(1);

  if (!invitation) {
    notFound();
  }

  if (new Date() > invitation.expires_at) {
    await db
      .update(invitations)
      .set({ status: "expired" })
      .where(eq(invitations.id, invitation.id));
    return (
      <div className="mx-auto w-full max-w-sm space-y-6 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          Invito scaduto
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Questo invito non è più valido. Chiedi un nuovo link al tuo
          responsabile.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-8 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Accetta l&apos;invito
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sei stato invitato a unirti come <strong>{invitation.role}</strong> con
          l&apos;email <strong>{invitation.email}</strong>. Imposta una password
          per completare la registrazione.
        </p>
      </div>

      <AcceptInviteForm token={token} />
    </div>
  );
}
