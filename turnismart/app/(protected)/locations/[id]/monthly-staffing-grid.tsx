"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  getISODay,
  isSameMonth,
} from "date-fns";
import { it } from "date-fns/locale";
import {
  getDailyStaffingForMonth,
  updateDailyStaffingOverrides,
} from "@/app/actions/locations";

const PERIODS = ["morning", "evening"] as const;

type StaffingItem = {
  id: string;
  role_id: string;
  role_name: string;
  day_of_week: number;
  shift_period: string;
  required_count: number;
};

type DailyOverride = {
  id: string;
  role_id: string;
  date: string;
  shift_period: string;
  required_count: number;
};

type Role = { id: string; name: string };

function getMonthStr(date: Date): string {
  return format(date, "yyyy-MM");
}

export function MonthlyStaffingGrid({
  locationId,
  roles,
  weeklyStaffing,
  initialOverrides,
  initialMonth,
}: {
  locationId: string;
  roles: Role[];
  weeklyStaffing: StaffingItem[];
  initialOverrides: DailyOverride[];
  initialMonth: string; // "YYYY-MM"
}) {
  const [pending, startTransition] = useTransition();
  const [monthDate, setMonthDate] = useState(
    () => new Date(initialMonth + "-01T00:00:00")
  );
  const [overrides, setOverrides] = useState<DailyOverride[]>(initialOverrides);
  const [values, setValues] = useState<Record<string, number>>({});
  const [dirty, setDirty] = useState(false);

  const month = getMonthStr(monthDate);

  // Build weekly template lookup: roleId_dayOfWeek_period → count
  const templateMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of weeklyStaffing) {
      map.set(`${s.role_id}_${s.day_of_week}_${s.shift_period}`, s.required_count);
    }
    return map;
  }, [weeklyStaffing]);

  // Build override lookup: roleId_date_period → count
  const overrideMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of overrides) {
      map.set(`${o.role_id}_${o.date}_${o.shift_period}`, o.required_count);
    }
    return map;
  }, [overrides]);

  // Generate calendar weeks for the month
  const calendarWeeks = useMemo(() => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const allDays = eachDayOfInterval({ start: calStart, end: calEnd });
    const weeks: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }
    return weeks;
  }, [monthDate]);

  // Get the effective value for a cell
  const getCellValue = useCallback(
    (roleId: string, date: Date, period: string): number => {
      const dateStr = format(date, "yyyy-MM-dd");
      const editKey = `${roleId}_${dateStr}_${period}`;

      // User edit takes priority
      if (editKey in values) return values[editKey];

      // Then daily override from DB
      const overrideVal = overrideMap.get(editKey);
      if (overrideVal !== undefined) return overrideVal;

      // Fall back to weekly template
      const dayOfWeek = getISODay(date) - 1; // 1=Mon→0, 7=Sun→6
      const templateKey = `${roleId}_${dayOfWeek}_${period}`;
      return templateMap.get(templateKey) ?? 0;
    },
    [values, overrideMap, templateMap]
  );

  // Check if a cell differs from the weekly template
  const isOverridden = useCallback(
    (roleId: string, date: Date, period: string): boolean => {
      const val = getCellValue(roleId, date, period);
      const dayOfWeek = getISODay(date) - 1;
      const templateVal = templateMap.get(`${roleId}_${dayOfWeek}_${period}`) ?? 0;
      return val !== templateVal;
    },
    [getCellValue, templateMap]
  );

  const handleChange = (roleId: string, date: Date, period: string, newVal: number) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const key = `${roleId}_${dateStr}_${period}`;
    setValues((prev) => ({ ...prev, [key]: newVal }));
    setDirty(true);
  };

  const handleResetCell = (roleId: string, date: Date, period: string) => {
    const dayOfWeek = getISODay(date) - 1;
    const templateVal = templateMap.get(`${roleId}_${dayOfWeek}_${period}`) ?? 0;
    const dateStr = format(date, "yyyy-MM-dd");
    const key = `${roleId}_${dateStr}_${period}`;
    setValues((prev) => ({ ...prev, [key]: templateVal }));
    setDirty(true);
  };

  const handleSave = () => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const updates: Array<{
      roleId: string;
      date: string;
      shiftPeriod: string;
      requiredCount: number;
    }> = [];

    for (const role of roles) {
      for (const day of allDays) {
        for (const period of PERIODS) {
          const val = getCellValue(role.id, day, period);
          const dayOfWeek = getISODay(day) - 1;
          const templateVal =
            templateMap.get(`${role.id}_${dayOfWeek}_${period}`) ?? 0;

          // Only send cells that differ from template
          if (val !== templateVal) {
            updates.push({
              roleId: role.id,
              date: format(day, "yyyy-MM-dd"),
              shiftPeriod: period,
              requiredCount: val,
            });
          }
        }
      }
    }

    startTransition(async () => {
      await updateDailyStaffingOverrides(locationId, month, updates);
      // Refresh overrides from server
      const fresh = await getDailyStaffingForMonth(locationId, month);
      setOverrides(fresh);
      setValues({});
      setDirty(false);
    });
  };

  const navigateMonth = async (delta: number) => {
    const newDate = addMonths(monthDate, delta);
    const newMonth = getMonthStr(newDate);

    // Save pending changes first? For now just warn
    if (dirty) {
      const ok = confirm("Hai modifiche non salvate. Vuoi cambiare mese senza salvare?");
      if (!ok) return;
    }

    startTransition(async () => {
      const fresh = await getDailyStaffingForMonth(locationId, newMonth);
      setOverrides(fresh);
      setValues({});
      setDirty(false);
      setMonthDate(newDate);
    });
  };

  return (
    <div className="mt-4 space-y-4">
      <p className="text-xs text-zinc-500">
        Fabbisogno giornaliero: modifica i valori per singoli giorni. Le celle
        con sfondo blu hanno un valore diverso dal template settimanale.
      </p>

      {/* Month navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateMonth(-1)}
          disabled={pending}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          ←
        </button>
        <span className="text-sm font-semibold capitalize">
          {format(monthDate, "MMMM yyyy", { locale: it })}
        </span>
        <button
          onClick={() => navigateMonth(1)}
          disabled={pending}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          →
        </button>
      </div>

      {/* Per-role grids */}
      {roles.map((role) => (
        <div key={role.id} className="space-y-1">
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {role.name}
          </h4>
          <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[600px] text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="w-10 p-1 text-center text-zinc-500"></th>
                  {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map(
                    (d) => (
                      <th
                        key={d}
                        colSpan={2}
                        className="border-l border-zinc-200 p-1 text-center font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                      >
                        {d}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {calendarWeeks.map((week, wi) => (
                  <tr
                    key={wi}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="p-1 text-center text-zinc-400 text-[10px]">
                      {format(week[0], "d")}-{format(week[6], "d")}
                    </td>
                    {week.map((day) => {
                      const inMonth = isSameMonth(day, monthDate);
                      return PERIODS.map((period) => {
                        const val = inMonth
                          ? getCellValue(role.id, day, period)
                          : 0;
                        const overridden =
                          inMonth && isOverridden(role.id, day, period);
                        const isMorning = period === "morning";

                        return (
                          <td
                            key={`${format(day, "yyyy-MM-dd")}_${period}`}
                            className={`border-l border-zinc-100 p-0.5 dark:border-zinc-800 ${
                              !inMonth
                                ? "bg-zinc-50 dark:bg-zinc-900"
                                : overridden
                                  ? "bg-blue-50 dark:bg-blue-900/20"
                                  : isMorning
                                    ? "bg-amber-50/50 dark:bg-amber-900/10"
                                    : "bg-slate-50/50 dark:bg-slate-800/20"
                            }`}
                          >
                            {inMonth ? (
                              <div className="group relative">
                                <input
                                  type="number"
                                  min={0}
                                  max={20}
                                  value={val}
                                  onChange={(e) =>
                                    handleChange(
                                      role.id,
                                      day,
                                      period,
                                      parseInt(e.target.value, 10) || 0
                                    )
                                  }
                                  className={`w-8 rounded border px-0.5 py-0 text-center text-xs ${
                                    overridden
                                      ? "border-blue-300 dark:border-blue-600"
                                      : "border-zinc-200 dark:border-zinc-600"
                                  } dark:bg-zinc-700 dark:text-white`}
                                  title={`${format(day, "d MMM", { locale: it })} ${isMorning ? "M" : "S"}`}
                                />
                                {overridden && (
                                  <button
                                    onClick={() =>
                                      handleResetCell(role.id, day, period)
                                    }
                                    className="absolute -right-1 -top-1 hidden h-3 w-3 items-center justify-center rounded-full bg-blue-500 text-[8px] text-white group-hover:flex"
                                    title="Ripristina template"
                                  >
                                    x
                                  </button>
                                )}
                              </div>
                            ) : null}
                          </td>
                        );
                      });
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-zinc-200 bg-amber-50"></span>
          Mattina (template)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-zinc-200 bg-slate-50"></span>
          Sera (template)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-blue-300 bg-blue-50"></span>
          Modificato
        </span>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={pending || !dirty}
        className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Salvataggio..." : "Salva modifiche mensili"}
      </button>
    </div>
  );
}
