import Link from "next/link";
import { signUp, signInWithGoogleForm } from "@/app/actions/auth";
import { AuthForm } from "../auth-form";

export const metadata = {
  title: "Registrati",
  description: "Crea il tuo account TurniSmart e inizia la prova gratuita.",
};

export default function SignUpPage() {
  return (
    <div className="mx-auto w-full max-w-sm space-y-8 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Registrati
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Prova gratis per 30 giorni. Nessuna carta richiesta.
        </p>
      </div>

      <AuthForm
        action={signUp}
        submitLabel="Crea account"
        fields={[
          { name: "email", type: "email", label: "Email", required: true },
          {
            name: "password",
            type: "password",
            label: "Password (min. 8 caratteri)",
            required: true,
          },
          { name: "fullName", type: "text", label: "Nome e cognome" },
          {
            name: "organizationName",
            type: "text",
            label: "Nome attività",
            required: true,
          },
          {
            name: "sector",
            type: "text",
            label: "Settore (es. Ristorazione, Retail)",
          },
        ]}
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
        <input type="hidden" name="redirectTo" value="/dashboard" />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Continua con Google
        </button>
      </form>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Hai già un account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-[hsl(var(--primary))] hover:underline"
        >
          Accedi
        </Link>
      </p>
    </div>
  );
}
