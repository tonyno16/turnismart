"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type EditType = "notes" | "times";

type ShiftEditModalProps = {
  type: EditType;
  shiftId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  onClose: () => void;
  onSaveNotes: (shiftId: string, notes: string | null) => void;
  onSaveTimes: (shiftId: string, startTime: string, endTime: string) => void;
};

export function ShiftEditModal({
  type,
  shiftId,
  employeeName,
  date,
  startTime,
  endTime,
  notes,
  onClose,
  onSaveNotes,
  onSaveTimes,
}: ShiftEditModalProps) {
  const [noteDraft, setNoteDraft] = useState(notes ?? "");
  const [startDraft, setStartDraft] = useState(startTime.slice(0, 5));
  const [endDraft, setEndDraft] = useState(endTime.slice(0, 5));

  useEffect(() => {
    setNoteDraft(notes ?? "");
    setStartDraft(startTime.slice(0, 5));
    setEndDraft(endTime.slice(0, 5));
  }, [notes, startTime, endTime]);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [onClose]);

  const handleSaveNotes = () => {
    onSaveNotes(shiftId, noteDraft.trim() || null);
    onClose();
  };

  const handleSaveTimes = () => {
    const start = startDraft.length === 5 ? startDraft : `${startDraft}:00`.slice(0, 5);
    const end = endDraft.length === 5 ? endDraft : `${endDraft}:00`.slice(0, 5);
    if (start && end) {
      onSaveTimes(shiftId, start, end);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (typeof document === "undefined") return null;

  const content =
    type === "notes" ? (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-800 w-full max-w-md">
        <h3 className="mb-2 text-sm font-semibold">Note turno – {employeeName}</h3>
        <p className="mb-2 text-xs text-zinc-500">{date}</p>
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Note turno..."
          className="mb-4 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          rows={3}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleSaveNotes}
            className="rounded bg-[hsl(var(--primary))] px-3 py-1.5 text-sm text-white hover:opacity-90"
          >
            Salva
          </button>
        </div>
      </div>
    ) : (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-800 w-full max-w-sm">
        <h3 className="mb-2 text-sm font-semibold">Modifica orari – {employeeName}</h3>
        <p className="mb-3 text-xs text-zinc-500">{date}</p>
        <div className="mb-4 flex items-center gap-2">
          <input
            type="time"
            aria-label="Ora inizio"
            value={startDraft}
            onChange={(e) => setStartDraft(e.target.value)}
            className="flex-1 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
          <span className="text-zinc-400">–</span>
          <input
            type="time"
            aria-label="Ora fine"
            value={endDraft}
            onChange={(e) => setEndDraft(e.target.value)}
            className="flex-1 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleSaveTimes}
            className="rounded bg-[hsl(var(--primary))] px-3 py-1.5 text-sm text-white hover:opacity-90"
          >
            Salva
          </button>
        </div>
      </div>
    );

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shift-edit-title"
    >
      {content}
    </div>,
    document.body
  );
}
