"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateReport } from "@/app/actions/reports";

export function ReportsGenerateForm({
  months,
}: {
  months: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [month, setMonth] = useState(months[0] ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateReport(month);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {new Date(m + "-01").toLocaleDateString("it-IT", {
              month: "long",
              year: "numeric",
            })}
          </option>
        ))}
      </select>
      <button
        onClick={handleGenerate}
        disabled={pending}
        className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Generazione..." : "Genera report"}
      </button>
      {error && (
        <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
      )}
    </div>
  );
}
