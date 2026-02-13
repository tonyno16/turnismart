"use client";

export function ConflictPopup({
  message,
  onAssignAnyway,
  onCancel,
  pending,
  confirmLabel = "Assegna comunque",
}: {
  message: string;
  onAssignAnyway: () => void;
  onCancel: () => void;
  pending: boolean;
  confirmLabel?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="mx-4 max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400">
          Attenzione
        </h3>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={pending}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
          >
            Annulla
          </button>
          <button
            onClick={onAssignAnyway}
            disabled={pending}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {pending ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
