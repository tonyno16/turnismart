import Link from "next/link";

export const metadata = {
  title: "Verifica email",
  description: "Conferma il tuo indirizzo email per TurniSmart.",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email ? decodeURIComponent(params.email) : null;

  return (
    <div className="mx-auto w-full max-w-sm space-y-8 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Verifica la tua email
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Ti abbiamo inviato un link di conferma
          {email ? (
            <> a <strong>{email}</strong></>
          ) : null}
          . Clicca sul link nell&apos;email per attivare il tuo account.
        </p>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Non hai ricevuto l&apos;email? Controlla la cartella spam o{" "}
          <Link
            href="/auth/login"
            className="font-medium text-[hsl(var(--primary))] hover:underline"
          >
            accedi
          </Link>{" "}
          per richiederne una nuova.
        </p>
      </div>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Vai al login
        </Link>
      </div>
    </div>
  );
}
