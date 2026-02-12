"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteEmployee } from "@/app/actions/employees";
import { Trash2 } from "lucide-react";

export function DeleteEmployeeButton({
  employeeId,
  employeeName,
}: {
  employeeId: string;
  employeeName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteEmployee(employeeId);
        toast.success("Dipendente eliminato");
        router.push("/employees");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore nell'eliminazione");
      }
    });
  };

  if (showConfirm) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          Eliminare &quot;{employeeName}&quot;? Questa azione non può essere annullata.
          Verranno eliminati anche mansioni, disponibilità, turni e richieste collegate.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {pending ? "Eliminazione..." : "Sì, elimina"}
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            disabled={pending}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 disabled:opacity-50"
          >
            Annulla
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
    >
      <Trash2 className="size-4" />
      Elimina dipendente
    </button>
  );
}
