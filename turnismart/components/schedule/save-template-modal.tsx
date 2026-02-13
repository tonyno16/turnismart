"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createScheduleTemplate } from "@/app/actions/schedule-templates";

export function SaveTemplateModal({
  scheduleId,
  onClose,
}: {
  scheduleId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Inserisci un nome per il template");
      return;
    }
    startTransition(async () => {
      const result = await createScheduleTemplate(trimmed, scheduleId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Template salvato");
      onClose();
      router.refresh();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Salva come template
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Salverai staffing e turni della settimana corrente come template
          riutilizzabile.
        </p>
        <label className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Nome template
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="es. Settimana standard"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          disabled={pending}
          autoFocus
        />
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
            onClick={handleSave}
            disabled={pending || !name.trim()}
            className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Salvataggio..." : "Salva"}
          </button>
        </div>
      </div>
    </div>
  );
}
