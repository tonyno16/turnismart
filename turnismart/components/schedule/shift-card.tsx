"use client";

import { useState, useRef, useEffect } from "react";
import { format, addDays, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { FileText, Copy } from "lucide-react";

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

export function ShiftCard({
  shift,
  weekStart,
  onDelete,
  onFindSubstitute,
  onUpdateNotes,
  onDuplicate,
}: {
  shift: ShiftForCard;
  weekStart: string;
  onDelete: (id: string) => void;
  onFindSubstitute: (shift: ShiftForCard) => void;
  onUpdateNotes: (id: string, notes: string | null) => void;
  onDuplicate: (shiftId: string, targetDate: string) => void;
}) {
  const [showNotePopover, setShowNotePopover] = useState(false);
  const [showDuplicateMenu, setShowDuplicateMenu] = useState(false);
  const [noteDraft, setNoteDraft] = useState(shift.notes ?? "");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNoteDraft(shift.notes ?? "");
  }, [shift.notes]);

  useEffect(() => {
    if (!showNotePopover && !showDuplicateMenu) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (cardRef.current?.contains(target)) return;
      setShowNotePopover(false);
      setShowDuplicateMenu(false);
    };
    const id = setTimeout(() => document.addEventListener("click", onClick), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", onClick);
    };
  }, [showNotePopover, showDuplicateMenu]);

  const handleSaveNote = () => {
    onUpdateNotes(shift.id, noteDraft.trim() || null);
    setShowNotePopover(false);
  };

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(parseISO(weekStart), i), "yyyy-MM-dd")
  );

  const timeStr = `${shift.start_time.slice(0, 5)}–${shift.end_time.slice(0, 5)}`;
  return (
    <div
      ref={cardRef}
      className="group relative flex flex-col gap-0.5 rounded-lg border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 px-2 py-1.5 pr-7 text-xs"
    >
      <div className="min-w-0 flex-1 truncate font-medium">
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
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowNotePopover(!showNotePopover);
              setShowDuplicateMenu(false);
            }}
            className="rounded p-0.5 hover:bg-[hsl(var(--primary))]/30"
            title="Note"
            aria-label="Modifica note turno"
          >
            <FileText className="h-3.5 w-3.5" />
          </button>
          {showNotePopover && (
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
                  onClick={() => setShowNotePopover(false)}
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
              setShowDuplicateMenu(!showDuplicateMenu);
              setShowNotePopover(false);
            }}
            className="rounded p-0.5 hover:bg-[hsl(var(--primary))]/30"
            title="Duplica"
            aria-label="Duplica turno su altro giorno"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          {showDuplicateMenu && (
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
                      setShowDuplicateMenu(false);
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
}
