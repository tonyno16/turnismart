"use client";

import Link from "next/link";

type Shift = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  location_name: string;
  role_name: string;
};

export function MyScheduleClient({
  weekLabel,
  prevWeek,
  nextWeek,
  dayDates,
  shiftsByDay,
  dayLabels,
}: {
  weekLabel: string;
  prevWeek: string;
  nextWeek: string;
  dayDates: string[];
  shiftsByDay: Record<string, Shift[]>;
  dayLabels: string[];
}) {

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/my-schedule?week=${prevWeek}`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          ← Settimana prima
        </Link>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {weekLabel}
        </span>
        <Link
          href={`/my-schedule?week=${nextWeek}`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          Settimana dopo →
        </Link>
      </div>

      <div className="space-y-3">
        {dayDates.map((dateStr, dayIndex) => {
          const shifts = shiftsByDay[dateStr] ?? [];
          const dayLabel = dayLabels[dayIndex] ?? "";
          return (
            <div
              key={dateStr}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <p className="mb-2 font-medium text-zinc-900 dark:text-white">
                {dayLabel} {dateStr}
              </p>
              {shifts.length === 0 ? (
                <p className="text-sm text-zinc-500">Nessun turno</p>
              ) : (
                <div className="space-y-2">
                  {shifts.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800"
                    >
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">
                          {s.location_name} · {s.role_name}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {s.start_time} – {s.end_time}
                          {s.break_minutes > 0 && (
                            <span> (pausa {s.break_minutes} min)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
