"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addWeeks, format } from "date-fns";
import { publishSchedule } from "@/app/actions/shifts";

export function DashboardActions({
  scheduleId,
  weekStart,
}: {
  scheduleId: string;
  weekStart: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handlePublish = () => {
    startTransition(async () => {
      await publishSchedule(scheduleId);
      router.refresh();
    });
  };

  const nextWeekStart = format(addWeeks(new Date(weekStart), 1), "yyyy-MM-dd");

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/schedule?week=${nextWeekStart}`}
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
      >
        Settimana prossima
      </Link>
      <button
        onClick={handlePublish}
        disabled={pending}
        className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "..." : "Pubblica programmazione"}
      </button>
      <Link
        href="/reports"
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
      >
        Report mensile
      </Link>
    </div>
  );
}
