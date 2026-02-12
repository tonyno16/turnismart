import { ResetPasswordForm } from "./reset-password-form";

export const metadata = {
  title: "Reimposta password",
  description: "Imposta una nuova password per il tuo account TurniSmart.",
};

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-sm space-y-8 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Nuova password
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Inserisci la nuova password per il tuo account.
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}
