"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, addWeeks, startOfWeek, startOfMonth, endOfMonth, getDaysInMonth } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { updateStaffingRequirements, getLocationStaffingForWeek, getLocationStaffingForMonth } from "@/app/actions/locations";

const DAYS = 7;
const PERIODS = ["morning", "evening"] as const;

type StaffingItem = {
  id: string;
  role_id: string;
  role_name: string;
  day_of_week: number;
  shift_period: string;
  required_count: number;
};

type Role = { id: string; name: string };

function getWeekStart(date: Date): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

export function LocationStaffingGrid({
  locationId,
  roles,
  initialStaffing,
}: {
  locationId: string;
  roles: Role[];
  initialStaffing: StaffingItem[];
}) {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [weekStart, setWeekStart] = useState<string>(() => getWeekStart(new Date()));
  const [monthDate, setMonthDate] = useState<Date>(() => new Date());

  function weekStartToDate(ws: string): Date {
    const [y, m, d] = ws.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }
  const [staffing, setStaffing] = useState<StaffingItem[]>(initialStaffing);
  const [monthData, setMonthData] = useState<Map<string, Record<string, number>> | null>(null);
  const [pending, startTransition] = useTransition();

  const isTemplate = weekStart === "template";

  const loadWeekStaffing = (ws: string) => {
    if (ws === "template") {
      setStaffing(initialStaffing);
      return;
    }
    startTransition(async () => {
      const data = await getLocationStaffingForWeek(locationId, ws);
      setStaffing(data);
    });
  };

  const loadMonthData = (d: Date) => {
    startTransition(async () => {
      const data = await getLocationStaffingForMonth(
        locationId,
        d.getFullYear(),
        d.getMonth() + 1
      );
      setMonthData(data);
    });
  };

  useEffect(() => {
    if (viewMode === "week") {
      if (isTemplate) {
        setStaffing(initialStaffing);
      } else {
        loadWeekStaffing(weekStart);
      }
    }
  }, [weekStart, viewMode]);

  useEffect(() => {
    if (isTemplate) setStaffing(initialStaffing);
  }, [isTemplate, initialStaffing]);

  useEffect(() => {
    if (viewMode === "month") loadMonthData(monthDate);
  }, [monthDate, viewMode]);

  const router = useRouter();

  const [values, setValues] = useState<Record<string, number>>(() => {
    const v: Record<string, number> = {};
    for (const s of initialStaffing) {
      v[`${s.role_id}_${s.day_of_week}_${s.shift_period}`] = s.required_count;
    }
    return v;
  });

  useEffect(() => {
    const v: Record<string, number> = {};
    for (const s of staffing) {
      v[`${s.role_id}_${s.day_of_week}_${s.shift_period}`] = s.required_count;
    }
    setValues(v);
  }, [staffing]);

  const handleSaveWeek = () => {
    const updates: Array<{ roleId: string; dayOfWeek: number; shiftPeriod: string; requiredCount: number }> = [];
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
      try {
        await updateStaffingRequirements(
          locationId,
          updates,
          isTemplate ? null : weekStart
        );
        toast.success(
          isTemplate
            ? "Modello standard salvato"
            : "Fabbisogno settimanale salvato"
        );
        router.refresh();
        if (!isTemplate) loadWeekStaffing(weekStart);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore nel salvataggio");
      }
    });
  };

  const handleSaveMonth = () => {
    if (!monthData) return;
    const updatesByWeek = new Map<string, Array<{ roleId: string; dayOfWeek: number; shiftPeriod: string; requiredCount: number }>>();
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, "yyyy-MM-dd");
      const ws = format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
      const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
      const dayVals = monthData.get(dateStr);
      if (!dayVals) continue;
      for (const role of roles) {
        for (const period of PERIODS) {
          const key = `${role.id}_${period}`;
          const count = dayVals[key] ?? 0;
          if (count > 0) {
            const arr = updatesByWeek.get(ws) ?? [];
            arr.push({
              roleId: role.id,
              dayOfWeek,
              shiftPeriod: period,
              requiredCount: count,
            });
            updatesByWeek.set(ws, arr);
          }
        }
      }
    }
    startTransition(async () => {
      try {
        for (const [ws, updates] of updatesByWeek) {
          await updateStaffingRequirements(locationId, updates, ws);
        }
        toast.success("Fabbisogno mensile salvato");
        router.refresh();
        loadMonthData(monthDate);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore nel salvataggio");
      }
    });
  };

  const periodLabels: Record<string, string> = {
    morning: "Mattina",
    evening: "Sera",
  };

  const weekDates = isTemplate
    ? ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"]
    : Array.from({ length: 7 }, (_, i) =>
        format(addDays(parseDate(weekStart), i), "EEE d MMM", { locale: it })
      );

  function parseDate(s: string): Date {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }

  const navigateWeek = (delta: number) => {
    const ref = isTemplate ? new Date() : parseDate(weekStart);
    setWeekStart(getWeekStart(addWeeks(ref, delta)));
  };

  const navigateMonth = (delta: number) => {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() + delta);
    setMonthDate(d);
  };

  return (
    <div className="mt-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => {
              setWeekStart(getWeekStart(monthDate));
              setViewMode("week");
            }}
            className={`px-3 py-1.5 text-sm ${
              viewMode === "week"
                ? "bg-[hsl(var(--primary))] text-white"
                : "bg-transparent text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            } rounded-l-lg`}
          >
            Settimanale
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isTemplate) setMonthDate(weekStartToDate(weekStart));
              setViewMode("month");
            }}
            className={`px-3 py-1.5 text-sm ${
              viewMode === "month"
                ? "bg-[hsl(var(--primary))] text-white"
                : "bg-transparent text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            } rounded-r-lg`}
          >
            Mensile
          </button>
        </div>

        {viewMode === "week" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateWeek(-1)}
              disabled={pending}
              className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 disabled:opacity-50"
            >
              ←
            </button>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setWeekStart("template")}
                className={`rounded px-2 py-1 text-sm ${
                  isTemplate
                    ? "bg-amber-100 font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                Modello standard
              </button>
              <button
                type="button"
                onClick={() => setWeekStart(getWeekStart(new Date()))}
                className={`rounded px-2 py-1 text-sm ${
                  !isTemplate && weekStart === getWeekStart(new Date())
                    ? "bg-blue-100 font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                Settimana corrente
              </button>
            </div>
            <span className="min-w-[140px] text-center text-sm">
              {isTemplate
                ? "Modello ricorrente"
                : `${format(parseDate(weekStart), "d MMM yyyy", { locale: it })} – ${format(addDays(parseDate(weekStart), 6), "d MMM yyyy", { locale: it })}`}
            </span>
            <button
              type="button"
              onClick={() => navigateWeek(1)}
              disabled={pending}
              className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 disabled:opacity-50"
            >
              →
            </button>
          </div>
        )}

        {viewMode === "month" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              disabled={pending}
              className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 disabled:opacity-50"
            >
              ←
            </button>
            <span className="min-w-[120px] text-center text-sm font-medium">
              {format(monthDate, "MMMM yyyy", { locale: it })}
            </span>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              disabled={pending}
              className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 disabled:opacity-50"
            >
              →
            </button>
          </div>
        )}
      </div>

      <p className="mb-2 text-xs text-zinc-500">
        {viewMode === "week"
          ? isTemplate
            ? "Modello ricorrente (si applica a tutte le settimane senza override). Ogni giorno: Mattina (08–14) e Sera (14–23)."
            : "Fabbisogno per questa settimana. Modifica e salva per creare un override."
          : "Fabbisogno per ogni giorno del mese. Modifica e salva per applicare gli override alle rispettive settimane."}
      </p>

      {viewMode === "week" ? (
        <>
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
            onClick={handleSaveWeek}
            disabled={pending}
            className="mt-4 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Salvataggio..." : "Salva fabbisogno"}
          </button>
        </>
      ) : (
        <>
          <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th rowSpan={2} className="sticky left-0 z-10 bg-zinc-100 p-2 text-left font-medium dark:bg-zinc-800">
                    Ruolo
                  </th>
                  {Array.from(
                    { length: getDaysInMonth(monthDate) },
                    (_, i) => i + 1
                  ).map((day) => (
                    <th
                      key={day}
                      colSpan={2}
                      className="border-l border-zinc-200 p-1 text-center text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  {Array.from(
                    { length: getDaysInMonth(monthDate) },
                    (_, i) => i + 1
                  ).flatMap((day) =>
                    PERIODS.map((period) => (
                      <th
                        key={`${day}-${period}`}
                        className={`border-l border-zinc-100 p-1 text-center text-xs dark:border-zinc-800 ${
                          period === "morning"
                            ? "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
                        }`}
                      >
                        {period === "morning" ? "M" : "S"}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="sticky left-0 z-10 bg-white p-2 font-medium dark:bg-zinc-900">
                      {role.name}
                    </td>
                    {Array.from(
                      { length: getDaysInMonth(monthDate) },
                      (_, i) => i + 1
                    ).flatMap((day) => {
                      const d = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
                      const dateStr = format(d, "yyyy-MM-dd");
                      const dayVals = monthData?.get(dateStr);
                      return PERIODS.map((period) => {
                        const key = `${role.id}_${period}`;
                        const val = dayVals?.[key] ?? 0;
                        return (
                          <td
                            key={`${day}-${period}`}
                            className={`p-0.5 border-l border-zinc-100 dark:border-zinc-800 ${
                              period === "morning"
                                ? "bg-amber-50/50 dark:bg-amber-900/10"
                                : "bg-slate-50/50 dark:bg-slate-800/20"
                            }`}
                          >
                            <input
                              type="number"
                              min={0}
                              max={20}
                              value={val}
                              onChange={(e) => {
                                const n = parseInt(e.target.value, 10) || 0;
                                setMonthData((prev) => {
                                  const next = new Map(prev ?? []);
                                  const row = { ...(next.get(dateStr) ?? {}) };
                                  row[key] = n;
                                  next.set(dateStr, row);
                                  return next;
                                });
                              }}
                              className="w-8 rounded border border-zinc-200 px-0.5 py-0.5 text-center text-xs dark:border-zinc-500 dark:bg-zinc-700 dark:text-white"
                            />
                          </td>
                        );
                      });
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={handleSaveMonth}
            disabled={pending || !monthData}
            className="mt-4 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Salvataggio..." : "Salva fabbisogno"}
          </button>
        </>
      )}
    </div>
  );
}
