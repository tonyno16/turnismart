import { redirect } from "next/navigation";
import Link from "next/link";
import { getEmployeeForUser } from "@/lib/auth";
import { requireUser } from "@/lib/auth";
import { getEmployeeWeekShiftsWithDetails, getWeekStart } from "@/lib/schedules";
import { format, parseISO, addDays, subWeeks, addWeeks } from "date-fns";
import { it } from "date-fns/locale";
import { parseTimeMinutes } from "@/lib/time-utils";
import { MyScheduleClient } from "./my-schedule-client";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export default async function MySchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const user = await requireUser();
  const employee = await getEmployeeForUser(user.id);
  if (!employee) {
    redirect("/dashboard?msg=employee_only");
  }

  const { week } = await searchParams;
  const weekStart = week ?? getWeekStart(new Date().toISOString().slice(0, 10));
  const shifts = await getEmployeeWeekShiftsWithDetails(employee.id, weekStart);

  const weekDate = parseISO(weekStart);
  const prevWeek = format(subWeeks(weekDate, 1), "yyyy-MM-dd");
  const nextWeek = format(addWeeks(weekDate, 1), "yyyy-MM-dd");
  const weekLabel = `${format(weekDate, "d MMM", { locale: it })} – ${format(
    addDays(weekDate, 6),
    "d MMM yyyy",
    { locale: it }
  )}`;

  let totalMinutes = 0;
  for (const s of shifts) {
    totalMinutes += parseTimeMinutes(s.end_time) - parseTimeMinutes(s.start_time);
  }
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const dayDates: string[] = [];
  const shiftsByDay: Record<string, typeof shifts> = {};
  for (let d = 0; d < 7; d++) {
    const dateStr = format(addDays(weekDate, d), "yyyy-MM-dd");
    dayDates.push(dateStr);
    shiftsByDay[dateStr] = shifts.filter((s) => s.date === dateStr);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          I miei turni
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Visualizza i turni assegnati per la settimana.
        </p>
      </div>

      <MyScheduleClient
        weekLabel={weekLabel}
        prevWeek={prevWeek}
        nextWeek={nextWeek}
        dayDates={dayDates}
        shiftsByDay={shiftsByDay}
        dayLabels={DAY_LABELS}
      />

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Totale ore: {totalHours}h
        </p>
      </div>
    </div>
  );
}
