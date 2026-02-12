"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { copyStaffingFromLocation } from "@/app/actions/locations";

type Location = { id: string; name: string };

export function CopyStaffingForm({
  currentLocationId,
  otherLocations,
}: {
  currentLocationId: string;
  otherLocations: Location[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sourceId, setSourceId] = useState("");

  if (otherLocations.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId) {
      toast.error("Seleziona una sede");
      return;
    }
    startTransition(async () => {
      try {
        const result = await copyStaffingFromLocation(currentLocationId, sourceId);
        toast.success(`${result.copied} righe di fabbisogno copiate`);
        setSourceId("");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore durante la copia");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Copia da sede
        </label>
        <select
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          disabled={pending}
          className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        >
          <option value="">— Seleziona —</option>
          {otherLocations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending || !sourceId}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? "Copia..." : "Copia fabbisogno"}
      </button>
    </form>
  );
}
