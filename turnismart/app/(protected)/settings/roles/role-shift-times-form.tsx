"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateRoleShiftTimes } from "@/app/actions/roles";
import type { RoleShiftTimesMap, RoleShiftTimesWithDays } from "@/lib/roles";
import { DAY_ALL } from "@/drizzle/schema";

type Role = { id: string; name: string };

const DAY_LABELS: Record<number, string> = {
  5: "Sabato",
  6: "Domenica",
};

export function RoleShiftTimesForm({
  roles,
  initialTimes,
}: {
  roles: Role[];
  initialTimes: RoleShiftTimesWithDays;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const def = initialTimes.default ?? {};
  const byDay = initialTimes.byDay ?? {};
  const [values, setValues] = useState<RoleShiftTimesMap>(() => {
    const v: RoleShiftTimesMap = {};
    for (const r of roles) {
      v[r.id] = def[r.id] ?? {
        morning: { start: "08:00", end: "14:00" },
        evening: { start: "14:00", end: "23:00" },
      };
    }
    return v;
  });
  const [dayValues, setDayValues] = useState<Partial<Record<number, RoleShiftTimesMap>>>(() => {
    const v: Partial<Record<number, RoleShiftTimesMap>> = {};
    for (const d of [5, 6] as const) {
      if (byDay[d]) {
        v[d] = {};
        for (const r of roles) {
          v[d]![r.id] = byDay[d]![r.id] ?? def[r.id] ?? {
            morning: { start: "08:00", end: "14:00" },
            evening: { start: "14:00", end: "23:00" },
          };
        }
      }
    }
    return v;
  });
  const [showDayOverrides, setShowDayOverrides] = useState(
    Object.keys(byDay).length > 0 || Object.keys(dayValues).length > 0
  );

  const defaultTimes = { morning: { start: "08:00", end: "14:00" }, evening: { start: "14:00", end: "23:00" } };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const updates: Array<{ roleId: string; dayOfWeek: number; morning: { start: string; end: string }; evening: { start: string; end: string } }> = [];
        for (const [roleId, t] of Object.entries(values)) {
          updates.push({ roleId, dayOfWeek: DAY_ALL, morning: t.morning, evening: t.evening });
        }
        for (const [dayStr, dayMap] of Object.entries(dayValues)) {
          const day = parseInt(dayStr, 10);
          if (dayMap)
            for (const [roleId, t] of Object.entries(dayMap)) {
              updates.push({ roleId, dayOfWeek: day, morning: t.morning, evening: t.evening });
            }
        }
        await updateRoleShiftTimes(updates);
        toast.success("Orari salvati");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore");
      }
    });
  };

  const renderRow = (
    roleId: string,
    roleName: string,
    v: RoleShiftTimesMap,
    setV: (action: React.SetStateAction<RoleShiftTimesMap>) => void
  ) => (
    <tr key={roleId} className="border-b border-zinc-100 dark:border-zinc-800">
      <td className="py-2 font-medium">{roleName}</td>
      <td className="py-2">
        <div className="flex items-center gap-1">
          <input
            type="time"
            value={v[roleId]?.morning.start ?? "08:00"}
            onChange={(e) =>
              setV((prev) => ({
                ...prev,
                [roleId]: {
                  ...prev[roleId],
                  morning: { ...(prev[roleId]?.morning ?? defaultTimes.morning), start: e.target.value },
                },
              }))
            }
            className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
          />
          <span className="text-zinc-400">–</span>
          <input
            type="time"
            value={v[roleId]?.morning.end ?? "14:00"}
            onChange={(e) =>
              setV((prev) => ({
                ...prev,
                [roleId]: {
                  ...prev[roleId],
                  morning: { ...(prev[roleId]?.morning ?? defaultTimes.morning), end: e.target.value },
                },
              }))
            }
            className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
      </td>
      <td className="py-2">
        <div className="flex items-center gap-1">
          <input
            type="time"
            value={v[roleId]?.evening.start ?? "14:00"}
            onChange={(e) =>
              setV((prev) => ({
                ...prev,
                [roleId]: {
                  ...prev[roleId],
                  evening: { ...(prev[roleId]?.evening ?? defaultTimes.evening), start: e.target.value },
                },
              }))
            }
            className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
          />
          <span className="text-zinc-400">–</span>
          <input
            type="time"
            value={v[roleId]?.evening.end ?? "23:00"}
            onChange={(e) =>
              setV((prev) => ({
                ...prev,
                [roleId]: {
                  ...prev[roleId],
                  evening: { ...(prev[roleId]?.evening ?? defaultTimes.evening), end: e.target.value },
                },
              }))
            }
            className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
      </td>
    </tr>
  );

  if (roles.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
      <h2 className="font-semibold text-zinc-900 dark:text-white">
        Orari turni per mansione
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Orari predefiniti quando crei un turno. Sabato e domenica possono avere orari diversi.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[400px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="py-2 text-left font-medium">Mansione</th>
              <th className="py-2 text-left font-medium">Mattina</th>
              <th className="py-2 text-left font-medium">Sera</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-2 font-medium">{r.name}</td>
                <td className="py-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={values[r.id]?.morning.start ?? "08:00"}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          [r.id]: {
                            ...v[r.id],
                            morning: { ...(v[r.id]?.morning ?? { start: "08:00", end: "14:00" }), start: e.target.value },
                          },
                        }))
                      }
                      className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                    />
                    <span className="text-zinc-400">–</span>
                    <input
                      type="time"
                      value={values[r.id]?.morning.end ?? "14:00"}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          [r.id]: {
                            ...v[r.id],
                            morning: { ...(v[r.id]?.morning ?? { start: "08:00", end: "14:00" }), end: e.target.value },
                          },
                        }))
                      }
                      className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                    />
                  </div>
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={values[r.id]?.evening.start ?? "14:00"}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          [r.id]: {
                            ...v[r.id],
                            evening: { ...(v[r.id]?.evening ?? { start: "14:00", end: "23:00" }), start: e.target.value },
                          },
                        }))
                      }
                      className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                    />
                    <span className="text-zinc-400">–</span>
                    <input
                      type="time"
                      value={values[r.id]?.evening.end ?? "23:00"}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          [r.id]: {
                            ...v[r.id],
                            evening: { ...(v[r.id]?.evening ?? { start: "14:00", end: "23:00" }), end: e.target.value },
                          },
                        }))
                      }
                      className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowDayOverrides(!showDayOverrides)}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          {showDayOverrides ? "▼" : "▶"} Orari sabato e domenica (opzionale)
        </button>
        {showDayOverrides && (
          <div className="mt-3 space-y-4">
            {([5, 6] as const).map((day) => {
              const dayMap = dayValues[day] ?? Object.fromEntries(roles.map((x) => [x.id, { ...(values[x.id] ?? defaultTimes) }]));
              return (
                <div key={day} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                  <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {DAY_LABELS[day]}
                  </h3>
                  <table className="w-full min-w-[400px] text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-700">
                        <th className="py-1 text-left font-medium">Mansione</th>
                        <th className="py-1 text-left font-medium">Mattina</th>
                        <th className="py-1 text-left font-medium">Sera</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((r) =>
                        renderRow(
                          r.id,
                          r.name,
                          dayMap,
                          (action) =>
                            setDayValues((prev) => {
                              const current =
                                prev[day] ??
                                Object.fromEntries(
                                  roles.map((x) => [
                                    x.id,
                                    { ...(values[x.id] ?? defaultTimes) },
                                  ])
                                );
                              const next =
                                typeof action === "function"
                                  ? action(current)
                                  : action;
                              return { ...prev, [day]: next };
                            })
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="mt-4 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Salvataggio..." : "Salva orari"}
      </button>
    </div>
  );
}
