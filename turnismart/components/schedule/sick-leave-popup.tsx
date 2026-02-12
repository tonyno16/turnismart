"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  getSubstituteSuggestions,
  replaceShiftWithSubstitute,
} from "@/app/actions/substitutes";
import type { SubstituteSuggestion } from "@/lib/substitute-suggestions";

export function SickLeavePopup({
  shiftId,
  shiftInfo,
  onClose,
}: {
  shiftId: string;
  shiftInfo: {
    date: string;
    locationName: string;
    roleName: string;
    employeeName: string;
  };
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<SubstituteSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSubstituteSuggestions(shiftId).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.ok) {
        setSuggestions(res.suggestions);
      } else {
        setError(res.error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [shiftId]);

  const handleAssign = (employeeId: string) => {
    startTransition(async () => {
      const result = await replaceShiftWithSubstitute(shiftId, employeeId);
      if (result.ok) {
        router.refresh();
        onClose();
      } else {
        setError(result.conflict.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Trova sostituto
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {shiftInfo.locationName} · {shiftInfo.roleName} ·{" "}
          {format(new Date(shiftInfo.date), "d MMM", { locale: it })} —{" "}
          {shiftInfo.employeeName}
        </p>

        {loading && (
          <div className="mt-4 py-8 text-center text-sm text-zinc-500">
            Caricamento suggerimenti...
          </div>
        )}

        {error && !loading && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && suggestions.length === 0 && (
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            Nessun sostituto disponibile per questo turno.
          </div>
        )}

        {!loading && suggestions.length > 0 && (
          <ul className="mt-4 space-y-2">
            {suggestions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
              >
                <div>
                  <span className="font-medium">{s.name}</span>
                  <div className="flex gap-2 text-xs text-zinc-500">
                    <span>Score: {s.score}</span>
                    {s.preferredLocation && (
                      <span className="text-green-600">Sede preferita</span>
                    )}
                    <span>{s.shiftsThisWeek} turni settimana</span>
                  </div>
                </div>
                <button
                  onClick={() => handleAssign(s.id)}
                  disabled={pending}
                  className="rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  Assegna
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
