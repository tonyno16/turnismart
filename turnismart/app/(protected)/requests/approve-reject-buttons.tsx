"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { approveShiftRequest, rejectShiftRequest } from "@/app/actions/requests";
import { approveTimeOff, rejectTimeOff } from "@/app/actions/employees";

export function ApproveRejectButtons({
  type,
  id,
}: {
  type: "shift_request" | "time_off";
  id: string;
  organizationId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      try {
        if (type === "shift_request") {
          await approveShiftRequest(id);
        } else {
          await approveTimeOff(id);
        }
        toast.success(type === "shift_request" ? "Richiesta approvata" : "Assenza approvata");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore");
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      try {
        if (type === "shift_request") {
          await rejectShiftRequest(id);
        } else {
          await rejectTimeOff(id);
        }
        toast.success(type === "shift_request" ? "Richiesta rifiutata" : "Assenza rifiutata");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore");
      }
    });
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleApprove}
        disabled={pending}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        Approva
      </button>
      <button
        type="button"
        onClick={handleReject}
        disabled={pending}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50"
      >
        Rifiuta
      </button>
    </div>
  );
}
