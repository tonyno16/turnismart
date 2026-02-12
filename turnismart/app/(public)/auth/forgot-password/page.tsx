import Link from "next/link";
import { forgotPassword } from "@/app/actions/auth";
import { AuthForm } from "../auth-form";

export const metadata = {
  title: "Password dimenticata",
  description: "Richiedi il reset della password TurniSmart.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-sm space-y-8 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Password dimenticata
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Inserisci la tua email e ti invieremo un link per reimpostare la
          password.
        </p>
      </div>

      <AuthForm
        action={forgotPassword}
        submitLabel="Invia link"
        successMessage="Controlla la tua email per il link per reimpostare la password."
        fields={[
          { name: "email", type: "email", label: "Email", required: true },
        ]}
      />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        <Link
          href="/auth/login"
          className="font-medium text-[hsl(var(--primary))] hover:underline"
        >
          Torna al login
        </Link>
      </p>
    </div>
  );
}
