"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import {
  addAvailabilityException,
  removeAvailabilityException,
  updateEmployeePeriodPreference,
} from "@/app/actions/employees";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

type Exception = {
  id: string;
  start_date: string;
  end_date: string;
  day_of_week: number;
};

export function AvailabilityExceptionsSection({
  employeeId,
  periodPreference,
  exceptions,
}: {
  employeeId: string;
  periodPreference: string | null;
  exceptions: Exception[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState<number[]>([]);

  const toggleDay = (d: number) => {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleAdd = () => {
    if (!startDate || !endDate || days.length === 0) {
      toast.error("Compila date e seleziona almeno un giorno");
      return;
    }
    if (startDate > endDate) {
      toast.error("Data inizio deve essere ≤ data fine");
      return;
    }
    startTransition(async () => {
      try {
        for (const dayOfWeek of days) {
          await addAvailabilityException(employeeId, startDate, endDate, dayOfWeek);
        }
        toast.success("Eccezione aggiunta");
        setStartDate("");
        setEndDate("");
        setDays([]);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore");
      }
    });
  };

  const handleRemove = (id: string) => {
    startTransition(async () => {
      try {
        await removeAvailabilityException(id);
        toast.success("Eccezione rimossa");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore");
      }
    });
  };

  const handlePeriodChange = (v: "morning" | "evening" | null) => {
    startTransition(async () => {
      try {
        await updateEmployeePeriodPreference(employeeId, v);
        toast.success("Preferenza aggiornata");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Preferenza turno
        </label>
        <div className="mt-1 flex flex-wrap gap-4">
          {[
            { value: null, label: "Nessuna preferenza" },
            { value: "morning" as const, label: "Preferisco mattina" },
            { value: "evening" as const, label: "Preferisco sera" },
          ].map(({ value, label }) => (
            <label
              key={label}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="periodPreference"
                checked={(value === null && !periodPreference) || periodPreference === value}
                onChange={() => handlePeriodChange(value)}
                disabled={pending}
                className="rounded-full border-zinc-300"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Eccezioni puntuali
        </label>
        <p className="mt-0.5 text-xs text-zinc-500">
          Es: &quot;dal 10 al 17 feb non posso il mercoledì&quot;
        </p>
        <div className="mt-2 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-zinc-500">Da</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-0.5 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500">A</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-0.5 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500">Non disponibile</label>
            <div className="mt-1 flex gap-1">
              {DAY_LABELS.map((label, d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`rounded px-2 py-1 text-xs ${
                    days.includes(d)
                      ? "bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-200"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
                  }`}
                  title={label}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={pending}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            Aggiungi
          </button>
        </div>
        {exceptions.length > 0 && (
          <ul className="mt-3 space-y-2">
            {exceptions.map((ex) => (
              <li
                key={ex.id}
                className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
              >
                <span>
                  {format(parseISO(ex.start_date), "d MMM", { locale: it })} –{" "}
                  {format(parseISO(ex.end_date), "d MMM", { locale: it })}, no{" "}
                  {DAY_LABELS[ex.day_of_week]}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(ex.id)}
                  disabled={pending}
                  className="text-red-600 hover:underline dark:text-red-400"
                >
                  Rimuovi
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
