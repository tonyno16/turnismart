import Link from "next/link";
import { signInWithGoogleForm } from "@/app/actions/auth";

export const metadata = {
  title: "Accedi",
  description: "Accedi al tuo account TurniSmart.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string; invite?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto w-full max-w-sm space-y-8 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Accedi
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Accedi al tuo account per gestire gli orari.
        </p>
        {params.invite === "accepted" && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            Invito accettato. Ora puoi accedere con la tua password.
          </p>
        )}
        {params.error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {params.error}
          </p>
        )}
      </div>

      <form action="/api/auth/login" method="POST" className="space-y-4">
        {params.redirectTo && (
          <input type="hidden" name="redirectTo" value={params.redirectTo} />
        )}
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Password *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
        >
          Accedi
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            oppure
          </span>
        </div>
      </div>

      <form action={signInWithGoogleForm}>
        <input
          type="hidden"
          name="redirectTo"
          value={params.redirectTo || "/dashboard"}
        />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Continua con Google
        </button>
      </form>

      <div className="space-y-2 text-center text-sm">
        <p className="text-zinc-600 dark:text-zinc-400">
          <Link
            href="/auth/forgot-password"
            className="font-medium text-[hsl(var(--primary))] hover:underline"
          >
            Password dimenticata?
          </Link>
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          Non hai un account?{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-[hsl(var(--primary))] hover:underline"
          >
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}
