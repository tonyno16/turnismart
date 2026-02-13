"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateWorkRules, type WorkRulesInput } from "@/app/actions/settings";

export function WorkRulesForm({
  initialValues,
}: {
  initialValues: WorkRulesInput;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateWorkRules(values);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Pausa minima tra turni (ore)
        </label>
        <input
          type="number"
          min={0}
          max={24}
          value={values.min_rest_between_shifts_hours}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              min_rest_between_shifts_hours: parseInt(e.target.value, 10) || 0,
            }))
          }
          className="w-full max-w-xs rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Minimo 11 ore tra fine turno e inizio successivo (CCNL).
        </p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Giorni consecutivi massimi
        </label>
        <input
          type="number"
          min={1}
          max={14}
          value={values.max_consecutive_days}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              max_consecutive_days: parseInt(e.target.value, 10) || 1,
            }))
          }
          className="w-full max-w-xs rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Numero massimo di giorni lavorativi consecutivi senza riposo.
        </p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Soglia straordinari (ore settimanali)
        </label>
        <input
          type="number"
          min={1}
          max={80}
          value={values.overtime_threshold_hours}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              overtime_threshold_hours: parseInt(e.target.value, 10) || 40,
            }))
          }
          className="w-full max-w-xs rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Ore oltre le quali si considerano straordinari (default 40).
        </p>
      </div>
      <div className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Orari predefiniti turni
        </h3>
        <p className="text-xs text-zinc-500">
          Usati quando crei un nuovo turno (es. trascinamento, AI). Puoi comunque modificare i singoli turni nella griglia.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Mattina
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={values.shift_times.morning.start}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    shift_times: {
                      ...v.shift_times,
                      morning: { ...v.shift_times.morning, start: e.target.value },
                    },
                  }))
                }
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
              <span className="text-zinc-400">–</span>
              <input
                type="time"
                value={values.shift_times.morning.end}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    shift_times: {
                      ...v.shift_times,
                      morning: { ...v.shift_times.morning, end: e.target.value },
                    },
                  }))
                }
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Sera
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={values.shift_times.evening.start}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    shift_times: {
                      ...v.shift_times,
                      evening: { ...v.shift_times.evening, start: e.target.value },
                    },
                  }))
                }
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
              <span className="text-zinc-400">–</span>
              <input
                type="time"
                value={values.shift_times.evening.end}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    shift_times: {
                      ...v.shift_times,
                      evening: { ...v.shift_times.evening, end: e.target.value },
                    },
                  }))
                }
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
            </div>
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Salvataggio..." : "Salva regole"}
      </button>
    </form>
  );
}
