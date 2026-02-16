import { requireOrganization } from "@/lib/auth";
import { getLinkedAccountants } from "@/app/actions/accountant";
import { AccountantInviteForm } from "./accountant-invite-form";

export default async function AccountantSettingsPage() {
  await requireOrganization();
  const linked = await getLinkedAccountants();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Commercialista
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Collega un commercialista per permettergli di scaricare i report mensili
          dal portale dedicato.
        </p>
      </div>

      <AccountantInviteForm />

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="font-semibold">Commercialisti collegati</h2>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {linked.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">
              Nessun commercialista collegato. Inserisci un&apos;email e invia
              l&apos;invito.
            </div>
          ) : (
            linked.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {a.accountantName ?? a.accountantEmail}
                  </p>
                  <p className="text-sm text-zinc-500">{a.accountantEmail}</p>
                </div>
                <RevokeButton accountantUserId={a.accountantUserId} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

async function RevokeButton({ accountantUserId }: { accountantUserId: string }) {
  const { revokeAccountant } = await import("@/app/actions/accountant");
  async function handleRevoke() {
    await revokeAccountant(accountantUserId);
  }
  return (
    <form action={handleRevoke}>
      <button
        type="submit"
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        Rimuovi
      </button>
    </form>
  );
}
