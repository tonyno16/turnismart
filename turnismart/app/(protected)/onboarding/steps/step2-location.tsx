"use client";

import { useTransition } from "react";
import { completeStep2 } from "@/app/actions/onboarding";

const DAYS = [
  { id: "monday", label: "Lunedì" },
  { id: "tuesday", label: "Martedì" },
  { id: "wednesday", label: "Mercoledì" },
  { id: "thursday", label: "Giovedì" },
  { id: "friday", label: "Venerdì" },
  { id: "saturday", label: "Sabato" },
  { id: "sunday", label: "Domenica" },
] as const;

export function Step2Location({
  onComplete,
  onError,
}: {
  onComplete: () => void;
  onError: (e: string) => void;
}) {
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        await completeStep2(formData);
        onComplete();
      } catch (err) {
        onError(err instanceof Error ? err.message : "Errore");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Prima sede
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Aggiungi nome, indirizzo e orari di apertura
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nome sede *
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="es. Ristorante Centro"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Indirizzo
          </label>
          <input
            name="address"
            type="text"
            placeholder="Via Roma 1, Milano"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Telefono
          </label>
          <input
            name="phone"
            type="tel"
            placeholder="+39 02 1234567"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Orari di apertura (opzionale)
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Puoi inserire fino a 2 turni per giorno. Es: 12:00-15:00 e 19:00-24:00 per pranzo e cena.
        </p>
        <div className="mt-3 space-y-3">
          {DAYS.map((d) => (
            <div key={d.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-24 text-sm text-zinc-600 dark:text-zinc-400">
                  {d.label}
                </span>
                <input
                  name={`${d.id}_open1`}
                  type="time"
                  className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
                <span className="text-zinc-500">-</span>
                <input
                  name={`${d.id}_close1`}
                  type="time"
                  className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2 pl-24">
                <input
                  name={`${d.id}_open2`}
                  type="time"
                  className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
                <span className="text-zinc-500">-</span>
                <input
                  name={`${d.id}_close2`}
                  type="time"
                  className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
                <span className="text-xs text-zinc-400">(secondo turno)</span>
              </div>
            </div>
          ))}
        </div>
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
