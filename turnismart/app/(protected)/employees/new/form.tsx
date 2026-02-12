"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createEmployee } from "@/app/actions/employees";

type Role = { id: string; name: string };
type Location = { id: string; name: string };

const CONTRACT_OPTIONS = [
  { value: "full_time", label: "Full time" },
  { value: "part_time", label: "Part time" },
  { value: "on_call", label: "A chiamata" },
  { value: "seasonal", label: "Stagionale" },
];

export function NewEmployeeForm({
  roles,
  locations,
}: {
  roles: Role[];
  locations: Location[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      try {
        const emp = await createEmployee(fd);
        toast.success("Dipendente creato con successo");
        router.push(`/employees/${emp?.id}`);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore nella creazione");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nome *
          </label>
          <input
            name="firstName"
            type="text"
            required
            className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Cognome *
          </label>
          <input
            name="lastName"
            type="text"
            required
            className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </label>
          <input
            name="email"
            type="email"
            className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Telefono
          </label>
          <input
            name="phone"
            type="tel"
            className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Ore settimanali
          </label>
          <input
            name="weeklyHours"
            type="number"
            min={1}
            max={60}
            defaultValue={40}
            className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Paga oraria (€)
          </label>
          <input
            name="hourlyRate"
            type="number"
            min={0}
            step={0.01}
            defaultValue={0}
            placeholder="0"
            className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tipo contratto
          </label>
          <select
            name="contractType"
            defaultValue="full_time"
            className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          >
            {CONTRACT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {roles.length > 0 && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Mansione {i} {i === 1 && "(principale)"}
                </label>
                <select
                  name={`roleId${i}`}
                  className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="">—</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Creazione..." : "Crea dipendente"}
        </button>
        <Link
          href="/employees"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          Annulla
        </Link>
      </div>
    </form>
  );
}
