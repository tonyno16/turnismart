"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { replicatePreviousWeek } from "@/app/actions/shifts";

export function ReplicateWeekModal({
  scheduleId,
  weekStart,
  onClose,
}: {
  scheduleId: string;
  weekStart: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        const result = await replicatePreviousWeek(scheduleId, weekStart);
        if (result.total === 0) {
          toast.info("Nessun turno nella settimana precedente");
        } else {
          toast.success(
            `${result.replicated} turni replicati${
              result.skipped > 0 ? `, ${result.skipped} saltati (conflitti)` : ""
            }`
          );
        }
        onClose();
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore durante la replica");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Replica settimana precedente
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Copierai tutti i turni attivi della settimana scorsa nella settimana
          corrente. I turni con conflitti (disponibilità, sovrapposizioni,
          dipendente inattivo) saranno saltati.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Replica in corso..." : "Replica"}
          </button>
        </div>
      </div>
    </div>
  );
}
