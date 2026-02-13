"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { format, addDays, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { FileText, Copy, Clock, AlertTriangle } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";

type ActivePopover = "notes" | "times" | "duplicate" | null;

/** Subset di shift usato da ShiftCard; compatibile con il tipo Shift dello scheduler */
type ShiftForCard = {
  id: string;
  employee_name: string;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string | null;
  location_name: string;
  role_name: string;
};

export const ShiftCard = memo(function ShiftCard({
  shift,
  weekStart,
  isRoleMismatch = false,
  onDelete,
  onFindSubstitute,
  onUpdateNotes,
  onUpdateTimes,
  onDuplicate,
}: {
  shift: ShiftForCard;
  weekStart: string;
  isRoleMismatch?: boolean;
  onDelete: (id: string) => void;
  onFindSubstitute: (shift: ShiftForCard) => void;
  onUpdateNotes: (id: string, notes: string | null) => void;
  onUpdateTimes?: (id: string, startTime: string, endTime: string) => void;
  onDuplicate: (shiftId: string, targetDate: string) => void;
}) {
  const [activePopover, setActivePopover] = useState<ActivePopover>(null);
  const [startDraft, setStartDraft] = useState(shift.start_time.slice(0, 5));
  const [endDraft, setEndDraft] = useState(shift.end_time.slice(0, 5));
  const [noteDraft, setNoteDraft] = useState(shift.notes ?? "");
  const cardRef = useRef<HTMLDivElement>(null);

  const closePopover = useCallback(() => setActivePopover(null), []);
  useClickOutside(cardRef, closePopover, activePopover !== null);

  useEffect(() => {
    setNoteDraft(shift.notes ?? "");
  }, [shift.notes]);

  useEffect(() => {
    if (activePopover === "times") {
      setStartDraft(shift.start_time.slice(0, 5));
      setEndDraft(shift.end_time.slice(0, 5));
    }
  }, [activePopover, shift.start_time, shift.end_time]);

  const handleSaveNote = () => {
    onUpdateNotes(shift.id, noteDraft.trim() || null);
    setActivePopover(null);
  };

  const handleSaveTimes = () => {
    if (!onUpdateTimes) return;
    const start = startDraft.length === 5 ? startDraft : `${startDraft}:00`.slice(0, 5);
    const end = endDraft.length === 5 ? endDraft : `${endDraft}:00`.slice(0, 5);
    if (start && end) {
      onUpdateTimes(shift.id, start, end);
      setActivePopover(null);
    }
  };

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(parseISO(weekStart), i), "yyyy-MM-dd")
  );

  const timeStr = `${shift.start_time.slice(0, 5)}–${shift.end_time.slice(0, 5)}`;
  return (
    <div
      ref={cardRef}
      className={`group relative flex flex-col gap-0.5 rounded-lg border px-2 py-1.5 pr-7 text-xs ${
        isRoleMismatch
          ? "border-amber-500/80 bg-amber-50/80 dark:border-amber-500/60 dark:bg-amber-950/30"
          : "border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10"
      }`}
      title={isRoleMismatch ? "Dipendente assegnato a ruolo non tra i suoi" : undefined}
    >
      <div className="min-w-0 flex-1 truncate font-medium flex items-center gap-1">
        {isRoleMismatch && (
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        )}
        <span className="truncate">{shift.employee_name}</span>
        {shift.notes && (
          <span className="ml-1 text-[10px] text-zinc-500" title={shift.notes}>
            📝
          </span>
        )}
      </div>
      <div className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400" title={`${timeStr}`}>
        {timeStr}
      </div>
      <div className="absolute right-1 top-1 flex items-center gap-0.5 rounded bg-white/90 opacity-0 shadow-sm group-hover:opacity-100 dark:bg-zinc-800/90">
        {onUpdateTimes && (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePopover(activePopover === "times" ? null : "times");
              }}
              className="rounded p-0.5 hover:bg-[hsl(var(--primary))]/30"
              title="Modifica orari"
              aria-label="Modifica orari turno"
            >
              <Clock className="h-3.5 w-3.5" />
            </button>
            {activePopover === "times" && (
              <div
                className="absolute left-0 top-full z-50 mt-1 w-40 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="time"
                    aria-label="Ora inizio turno"
                    value={startDraft}
                    onChange={(e) => setStartDraft(e.target.value)}
                    className="w-full rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-900"
                  />
                  <span className="text-zinc-400">–</span>
                  <input
                    type="time"
                    aria-label="Ora fine turno"
                    value={endDraft}
                    onChange={(e) => setEndDraft(e.target.value)}
                    className="w-full rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-900"
                  />
                </div>
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="rounded px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTimes}
                    className="rounded bg-[hsl(var(--primary))] px-2 py-1 text-xs text-white hover:opacity-90"
                  >
                    Salva
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActivePopover(activePopover === "notes" ? null : "notes");
            }}
            className="rounded p-0.5 hover:bg-[hsl(var(--primary))]/30"
            title="Note"
            aria-label="Modifica note turno"
          >
            <FileText className="h-3.5 w-3.5" />
          </button>
          {activePopover === "notes" && (
            <div
              className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Note turno..."
                className="mb-2 w-full rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-900"
                rows={2}
                autoFocus
              />
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setActivePopover(null)}
                  className="rounded px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="rounded bg-[hsl(var(--primary))] px-2 py-1 text-xs text-white hover:opacity-90"
                >
                  Salva
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActivePopover(activePopover === "duplicate" ? null : "duplicate");
            }}
            className="rounded p-0.5 hover:bg-[hsl(var(--primary))]/30"
            title="Duplica"
            aria-label="Duplica turno su altro giorno"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          {activePopover === "duplicate" && (
            <div
              className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2 py-1 text-[10px] font-medium text-zinc-500">
                Duplica su:
              </div>
              {weekDates
                .filter((d) => d !== shift.date)
                .map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      onDuplicate(shift.id, d);
                      setActivePopover(null);
                    }}
                    className="block w-full px-2 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    {format(parseISO(d), "EEE d", { locale: it })}
                  </button>
                ))}
            </div>
          )}
        </div>
        <button
          onClick={() => onFindSubstitute(shift)}
          className="rounded p-0.5 hover:bg-[hsl(var(--primary))]/30"
          title="Trova sostituto"
          aria-label="Trova sostituto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
          >
            <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(shift.id)}
          className="rounded p-0.5 hover:bg-red-500/30"
          title="Rimuovi"
          aria-label="Rimuovi turno"
        >
          ×
        </button>
      </div>
    </div>
  );
});
