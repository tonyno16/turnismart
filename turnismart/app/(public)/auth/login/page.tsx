import Link from "next/link";
import { login, signInWithGoogleForm } from "@/app/actions/auth";
import { AuthForm } from "../auth-form";

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

      <AuthForm
        action={login}
        submitLabel="Accedi"
        fields={[
          { name: "email", type: "email", label: "Email", required: true },
          {
            name: "password",
            type: "password",
            label: "Password",
            required: true,
          },
        ]}
        hiddenFields={params.redirectTo ? [{ name: "redirectTo", value: params.redirectTo }] : undefined}
      />

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
