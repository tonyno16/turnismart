"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateScheduleWithAIAction } from "@/app/actions/ai-schedule";

export function AIGenerationModal({
  weekStart,
  onClose,
}: {
  weekStart: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    ok: boolean;
    saved?: number;
    skipped?: number;
    errors?: string[];
    error?: string;
  } | null>(null);

  const handleGenerate = () => {
    setResult(null);
    startTransition(async () => {
      const res = await generateScheduleWithAIAction(weekStart, "full");
      setResult(res);
      if (res.ok) {
        router.refresh();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Genera con AI
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          L&apos;AI analizzerà fabbisogni, disponibilità e vincoli per generare
          un orario ottimale.
        </p>

        {result && (
          <div
            className={`mt-4 rounded-lg p-3 text-sm ${
              result.ok
                ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {result.ok ? (
              <>
                <p className="font-medium">
                  Completato: {result.saved} turni assegnati
                  {result.skipped && result.skipped > 0
                    ? `, ${result.skipped} saltati`
                    : ""}
                </p>
                {result.errors && result.errors.length > 0 && (
                  <ul className="mt-1 max-h-24 overflow-y-auto text-xs">
                    {result.errors.slice(0, 5).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>... e altri {result.errors.length - 5}</li>
                    )}
                  </ul>
                )}
              </>
            ) : (
              <p>{result.error}</p>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
          >
            Chiudi
          </button>
          <button
            onClick={handleGenerate}
            disabled={pending}
            className="flex-1 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Generazione in corso..." : "Genera"}
          </button>
        </div>
      </div>
    </div>
  );
}
