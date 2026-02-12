"use client";

import { useTransition } from "react";
import { completeStep5 } from "@/app/actions/onboarding";

export function Step5Summary({ onBack }: { onBack: () => void }) {
  const [pending, startTransition] = useTransition();

  const handleComplete = () => {
    startTransition(async () => {
      await completeStep5();
    });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Tutto pronto!
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Hai completato la configurazione iniziale. Ora puoi creare il tuo primo orario.
      </p>

      <div className="mt-6 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Prossimi passi:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <li>Vai alla pagina Orari per creare il primo turno settimanale</li>
          <li>L&apos;AI ti aiuterà a generare l&apos;orario ottimale</li>
          <li>Pubblica e i dipendenti riceveranno notifica</li>
        </ul>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
        >
          Indietro
        </button>
        <button
          onClick={handleComplete}
          disabled={pending}
          className="rounded-lg bg-[hsl(var(--primary))] px-6 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Completamento..." : "Inizia a creare orari"}
        </button>
      </div>
    </div>
  );
}
