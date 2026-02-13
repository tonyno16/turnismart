"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { listScheduleTemplates, applyScheduleTemplate } from "@/app/actions/schedule-templates";

export function ApplyTemplateModal({
  weekStart,
  onClose,
}: {
  weekStart: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    listScheduleTemplates()
      .then(setTemplates)
      .catch(() => toast.error("Errore nel caricamento dei template"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (templates.length > 0 && !selectedId) setSelectedId(templates[0].id);
  }, [templates, selectedId]);

  const handleApply = () => {
    if (!selectedId) return;
    startTransition(async () => {
      const result = await applyScheduleTemplate(selectedId, weekStart);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        `Template applicato: ${result.staffingCount} fabbisogni, ${result.shiftsCount} turni`
      );
      onClose();
      router.push(`/schedule?week=${weekStart}`);
    });
  };

  const weekLabel = `${format(parseISO(weekStart), "d MMM yyyy", { locale: it })} – ${format(
    addDays(parseISO(weekStart), 6),
    "d MMM yyyy",
    { locale: it }
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Applica template
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          I turni del template verranno applicati alla settimana corrente. I turni
          con conflitti (disponibilità, sovrapposizioni) saranno saltati.
        </p>
        <label className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Template
        </label>
        {loading ? (
          <p className="mt-2 text-sm text-zinc-500">Caricamento...</p>
        ) : templates.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            Nessun template salvato. Salva prima la settimana corrente come
            template.
          </p>
        ) : (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            disabled={pending}
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}
        <p className="mt-2 text-xs text-zinc-500">
          Settimana: {weekLabel}
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
            onClick={handleApply}
            disabled={pending || !selectedId || templates.length === 0}
            className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Applicazione..." : "Applica"}
          </button>
        </div>
      </div>
    </div>
  );
}
