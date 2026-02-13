"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { exportSchedulePdf } from "@/app/actions/schedule-pdf";

export function ExportPdfModal({
  scheduleId,
  onClose,
}: {
  scheduleId: string;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"by_location" | "by_employee">("by_location");

  const handleExport = () => {
    startTransition(async () => {
      const result = await exportSchedulePdf(scheduleId, mode);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const bytes = Uint8Array.from(atob(result.pdfBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF scaricato");
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Esporta PDF
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Scegli il formato dell&apos;orario da stampare.
        </p>
        <div className="mt-4 space-y-2">
          <label className="flex cursor-pointer gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
            <input
              type="radio"
              name="mode"
              checked={mode === "by_location"}
              onChange={() => setMode("by_location")}
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <div>
              <span className="text-sm font-medium">Per sede</span>
              <p className="text-xs text-zinc-500">
                Tabella con turni raggruppati per sede
              </p>
            </div>
          </label>
          <label className="flex cursor-pointer gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
            <input
              type="radio"
              name="mode"
              checked={mode === "by_employee"}
              onChange={() => setMode("by_employee")}
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <div>
              <span className="text-sm font-medium">Per dipendente</span>
              <p className="text-xs text-zinc-500">
                Scheda per ogni dipendente con i suoi turni
              </p>
            </div>
          </label>
        </div>
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
            onClick={handleExport}
            disabled={pending}
            className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Generazione..." : "Esporta PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
