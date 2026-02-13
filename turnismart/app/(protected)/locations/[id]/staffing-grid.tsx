"use client";

import { useState, useTransition } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { it } from "date-fns/locale";
import { updateStaffingRequirements } from "@/app/actions/locations";

const DAYS = 7;
const PERIODS = ["morning", "evening"] as const;

function getWeekDates() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStart, i), "EEE d MMM", { locale: it })
  );
}

type StaffingItem = {
  id: string;
  role_id: string;
  role_name: string;
  day_of_week: number;
  shift_period: string;
  required_count: number;
};

type Role = { id: string; name: string };

export function LocationStaffingGrid({
  locationId,
  roles,
  staffing,
}: {
  locationId: string;
  roles: Role[];
  staffing: StaffingItem[];
}) {
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, number>>(() => {
    const v: Record<string, number> = {};
    for (const s of staffing) {
      v[`${s.role_id}_${s.day_of_week}_${s.shift_period}`] = s.required_count;
    }
    return v;
  });

  const handleSave = () => {
    const updates: Array<{
      roleId: string;
      dayOfWeek: number;
      shiftPeriod: string;
      requiredCount: number;
    }> = [];
    for (const role of roles) {
      for (let day = 0; day < DAYS; day++) {
        for (const period of PERIODS) {
          const key = `${role.id}_${day}_${period}`;
          const count = values[key] ?? 0;
          if (count > 0) {
            updates.push({
              roleId: role.id,
              dayOfWeek: day,
              shiftPeriod: period,
              requiredCount: count,
            });
          }
        }
      }
    }
    startTransition(async () => {
      await updateStaffingRequirements(locationId, updates);
    });
  };

  const periodLabels: Record<string, string> = {
    morning: "Mattina",
    evening: "Sera",
  };
  const weekDates = getWeekDates();

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs text-zinc-500">
        Fabbisogno ricorrente settimanale. Ogni giorno ha due turni: Mattina (08–14) e Sera (14–23).
      </p>
      <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th rowSpan={2} className="p-2 text-left font-medium">
                Ruolo
              </th>
              {weekDates.map((dateLabel, d) => (
                <th
                  key={d}
                  colSpan={2}
                  className="border-l border-zinc-200 p-1 text-center text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                >
                  {dateLabel}
                </th>
              ))}
            </tr>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              {weekDates.flatMap((_, d) =>
                PERIODS.map((period) => (
                  <th
                    key={`${d}-${period}`}
                    className={`border-l border-zinc-100 p-1 text-center text-xs dark:border-zinc-800 ${
                      period === "morning"
                        ? "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
                    }`}
                  >
                    {periodLabels[period]}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="p-2 font-medium">{role.name}</td>
                {Array.from({ length: DAYS * 2 }, (_, i) => {
                  const day = Math.floor(i / 2);
                  const period = PERIODS[i % 2];
                  const key = `${role.id}_${day}_${period}`;
                  const isMorning = period === "morning";
                  return (
                    <td
                      key={key}
                      className={`p-1 border-l border-zinc-100 dark:border-zinc-800 ${
                        isMorning
                          ? "bg-amber-50/50 dark:bg-amber-900/10"
                          : "bg-slate-50/50 dark:bg-slate-800/20"
                      }`}
                    >
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
                        className="w-10 rounded border border-zinc-200 px-1 py-0.5 text-center text-sm dark:border-zinc-500 dark:bg-zinc-700 dark:text-white"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={handleSave}
        disabled={pending}
        className="mt-4 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Salvataggio..." : "Salva fabbisogno"}
      </button>
    </div>
  );
}
