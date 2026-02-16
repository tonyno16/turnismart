"use client";

import { useState, useTransition } from "react";
import { completeStep1 } from "@/app/actions/onboarding";
const SECTORS = [
  { id: "ristorante", label: "Ristorante", desc: "Camerieri, cuochi, lavapiatti..." },
  { id: "bar", label: "Bar", desc: "Barista, cameriere" },
  { id: "hotel", label: "Hotel", desc: "Reception, housekeeping, portiere" },
  { id: "rsa", label: "RSA / Casa di riposo", desc: "OSS, infermieri, ausiliari" },
  { id: "retail", label: "Retail / Negozio", desc: "Cassiere, commesso, magazziniere" },
  { id: "other", label: "Altro", desc: "Configura i ruoli manualmente" },
] as const;

export function Step1Sector({
  currentSector,
  onComplete,
  onError,
}: {
  currentSector: string | null;
  onComplete: () => void;
  onError: (e: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState(currentSector || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      onError("Seleziona un tipo di attività");
      return;
    }
    startTransition(async () => {
      try {
        await completeStep1(selected);
        onComplete();
      } catch (err) {
        onError(err instanceof Error ? err.message : "Errore");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Tipo di attività
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Scegli per precompilare i ruoli suggeriti
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {SECTORS.map((s) => (
          <label
            key={s.id}
            className={`flex cursor-pointer flex-col rounded-lg border p-4 transition ${
              selected === s.id
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700"
            }`}
          >
            <input
              type="radio"
              name="sector"
              value={s.id}
              checked={selected === s.id}
              onChange={() => setSelected(s.id)}
              className="sr-only"
            />
            <span className="font-medium text-zinc-900 dark:text-white">
              {s.label}
            </span>
            <span className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {s.desc}
            </span>
          </label>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Salvataggio..." : "Continua"}
        </button>
      </div>
    </form>
  );
}
