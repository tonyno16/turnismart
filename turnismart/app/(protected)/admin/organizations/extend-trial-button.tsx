"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { extendTrial } from "@/app/actions/admin";

export function ExtendTrialButton({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showInput, setShowInput] = useState(false);
  const [days, setDays] = useState("7");

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        await extendTrial(organizationId, parseInt(days, 10) || 7);
        toast.success("Trial esteso con successo");
        setShowInput(false);
        router.refresh();
      } catch {
        toast.error("Errore nell'estensione del trial");
      }
    });
  };

  if (!showInput) {
    return (
      <button
        type="button"
        onClick={() => setShowInput(true)}
        className="text-xs text-[hsl(var(--primary))] hover:underline"
      >
        Estendi trial
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={1}
        max={90}
        value={days}
        onChange={(e) => setDays(e.target.value)}
        className="w-12 rounded border px-1 py-0.5 text-xs dark:bg-zinc-800"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending}
        className="text-xs text-[hsl(var(--primary))] hover:underline disabled:opacity-50"
      >
        {pending ? "..." : "OK"}
      </button>
      <button
        type="button"
        onClick={() => setShowInput(false)}
        className="text-xs text-zinc-500 hover:underline"
      >
        Annulla
      </button>
    </div>
  );
}
