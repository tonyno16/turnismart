"use client";

import { useTransition, useEffect, useState } from "react";
import { completeStep3, getOnboardingData } from "@/app/actions/onboarding";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const PERIODS = [
  { id: "morning", label: "Mattina" },
  { id: "afternoon", label: "Pomeriggio" },
  { id: "evening", label: "Sera" },
] as const;

export function Step3Staffing({
  onComplete,
  onBack,
  onError,
}: {
  onComplete: () => void;
  onBack: () => void;
  onError: (e: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState<Awaited<ReturnType<typeof getOnboardingData>> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, number>>({});

  const loadData = () => {
    setLoadError(null);
    getOnboardingData()
      .then((d) => {
        setData(d);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : "Errore di caricamento");
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(values).forEach(([key, v]) => {
      if (v > 0) formData.set(key, String(v));
    });
    startTransition(async () => {
      try {
        await completeStep3(formData);
        onComplete();
      } catch (err) {
        onError(err instanceof Error ? err.message : "Errore");
      }
    });
  };

  if (loadError) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-red-600 dark:text-red-400">{loadError}</p>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
          >
            Torna indietro
          </button>
          <button
            type="button"
            onClick={loadData}
            className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm text-white"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-8 text-center text-zinc-500">
        Caricamento...
      </div>
    );
  }

  if (!data.location || !data.roles.length) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">
          Servono almeno una sede (Step 2) e ruoli (Step 1). Torna indietro e completa i passaggi precedenti.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm text-white"
        >
          Torna allo Step 2
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Fabbisogno personale
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Quante persone servono per ruolo e fascia oraria? Sede: {data.location.name}
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="p-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                Ruolo / Giorno
              </th>
              {DAY_LABELS.map((_, d) =>
                PERIODS.map((p) => (
                  <th
                    key={`${d}-${p.id}`}
                    className="p-1 text-center text-xs text-zinc-500 dark:text-zinc-400"
                  >
                    {p.label}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {data.roles.map((role) => (
              <tr key={role.id} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="p-2 font-medium text-zinc-900 dark:text-white">
                  {role.name}
                </td>
                {DAY_LABELS.map((_, day) =>
                  PERIODS.map((p) => {
                    const key = `sr_${role.id}_${day}_${p.id}`;
                    return (
                      <td key={key} className="p-1">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={values[key] ?? 0}
                          onChange={(e) =>
                            setValues((v) => ({
                              ...v,
                              [key]: parseInt(e.target.value, 10) || 0,
                            }))
                          }
                          className="w-12 rounded border border-zinc-300 px-1 py-0.5 text-center text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                        />
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
        >
          Indietro
        </button>
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
