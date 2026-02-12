"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMyTimeOff } from "@/app/actions/employees";

type FormType = "vacation" | "personal_leave" | "sick_leave";

const TYPE_LABELS: Record<FormType, string> = {
  vacation: "Ferie",
  personal_leave: "Permesso",
  sick_leave: "Malattia",
};

export function NewRequestForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<FormType>("vacation");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!startDate || !endDate) {
      setError("Inserisci data inizio e fine");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("La data di fine deve essere successiva alla data di inizio");
      return;
    }

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("startDate", startDate);
        fd.set("endDate", endDate);
        fd.set("type", type);
        fd.set("notes", notes);
        await createMyTimeOff(fd);
        setStartDate("");
        setEndDate("");
        setNotes("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore");
      }
    });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Nuova richiesta
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Richiedi ferie, permesso o malattia. Per cambio turno contatta il responsabile.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tipo
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as FormType)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
          >
            {(Object.keys(TYPE_LABELS) as FormType[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Data inizio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Data fine
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Note (opzionale)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Invio..." : "Invia richiesta"}
        </button>
      </form>
    </div>
  );
}
