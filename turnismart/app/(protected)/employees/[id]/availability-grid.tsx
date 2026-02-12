"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAvailability } from "@/app/actions/employees";

const DAYS = 7;
const PERIODS = ["morning", "evening"] as const;
const STATUSES = ["available", "unavailable", "preferred"] as const;

type AvailabilityItem = {
  day_of_week: number;
  shift_period: string;
  status: string;
};

const periodLabels = ["M", "S"];
const dayLabels = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const statusLabels: Record<string, string> = {
  available: "✓",
  unavailable: "✗",
  preferred: "★",
};

export function EmployeeAvailabilityGrid({
  employeeId,
  availability,
}: {
  employeeId: string;
  availability: AvailabilityItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (let day = 0; day < DAYS; day++) {
      for (const period of PERIODS) {
        const key = `${day}_${period}`;
        const found = availability.find(
          (a) => a.day_of_week === day && a.shift_period === period
        );
        v[key] = found?.status ?? "available";
      }
    }
    return v;
  });

  const handleSave = () => {
    const updates: Array<{ dayOfWeek: number; shiftPeriod: string; status: string }> = [];
    for (let day = 0; day < DAYS; day++) {
      for (const period of PERIODS) {
        const key = `${day}_${period}`;
        updates.push({
          dayOfWeek: day,
          shiftPeriod: period,
          status: values[key] ?? "available",
        });
      }
    }
    startTransition(async () => {
      await updateAvailability(employeeId, updates);
      router.refresh();
    });
  };

  const cycleStatus = (key: string) => {
    const current = values[key] ?? "available";
    const idx = STATUSES.indexOf(current as (typeof STATUSES)[number]);
    const next = STATUSES[(idx + 1) % STATUSES.length];
    setValues((v) => ({ ...v, [key]: next }));
  };

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs text-zinc-500">
        ✓ Disponibile · ✗ Non disponibile · ★ Preferito — clic per cambiare
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="p-2 text-left font-medium">Giorno</th>
              {dayLabels.flatMap((label, d) =>
                periodLabels.map((_, p) => (
                  <th
                    key={`${d}-${p}`}
                    className="p-1 text-center text-xs text-zinc-500"
                  >
                    {p === 0 ? label : ""}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 font-medium text-zinc-600 dark:text-zinc-400">
                Disponibilità
              </td>
              {Array.from({ length: DAYS * 2 }, (_, i) => {
                const day = Math.floor(i / 2);
                const period = PERIODS[i % 2];
                const key = `${day}_${period}`;
                const status = values[key] ?? "available";
                return (
                  <td key={key} className="p-1">
                    <button
                      type="button"
                      onClick={() => cycleStatus(key)}
                      className={`w-8 rounded px-1 py-1 text-sm transition ${
                        status === "available"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400"
                          : status === "preferred"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                      title={status}
                    >
                      {statusLabels[status] ?? "✓"}
                    </button>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <button
        onClick={handleSave}
        disabled={pending}
        className="mt-4 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Salvataggio..." : "Salva disponibilità"}
      </button>
    </div>
  );
}
