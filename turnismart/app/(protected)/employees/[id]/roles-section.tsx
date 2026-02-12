"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateEmployeeRoles } from "@/app/actions/employees";

type Role = { id: string; name: string };
type EmployeeRole = {
  id: string;
  role_id: string;
  role_name: string;
  priority: number;
  hourly_rate: string | null;
};

export function EmployeeRolesSection({
  employeeId,
  employeeRoles: currentRoles,
  allRoles,
  baseHourlyRate,
}: {
  employeeId: string;
  employeeRoles: EmployeeRole[];
  allRoles: Role[];
  baseHourlyRate: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [role1, setRole1] = useState(currentRoles.find((r) => r.priority === 1)?.role_id ?? "");
  const [role2, setRole2] = useState(currentRoles.find((r) => r.priority === 2)?.role_id ?? "");
  const [role3, setRole3] = useState(currentRoles.find((r) => r.priority === 3)?.role_id ?? "");
  const [rate1, setRate1] = useState(currentRoles.find((r) => r.priority === 1)?.hourly_rate ?? "");
  const [rate2, setRate2] = useState(currentRoles.find((r) => r.priority === 2)?.hourly_rate ?? "");
  const [rate3, setRate3] = useState(currentRoles.find((r) => r.priority === 3)?.hourly_rate ?? "");

  const roleIds = [role1, role2, role3].filter(Boolean);
  const hourlyRates: Record<string, string> = {};
  if (role1 && rate1) hourlyRates[role1] = rate1;
  if (role2 && rate2) hourlyRates[role2] = rate2;
  if (role3 && rate3) hourlyRates[role3] = rate3;

  const sortedCurrent = [...currentRoles].sort((a, b) => a.priority - b.priority);
  const rolesChanged =
    JSON.stringify(roleIds) !== JSON.stringify(sortedCurrent.map((r) => r.role_id));
  const ratesChanged =
    JSON.stringify(hourlyRates) !==
    JSON.stringify(
      Object.fromEntries(
        sortedCurrent
          .filter((r) => r.hourly_rate)
          .map((r) => [r.role_id, r.hourly_rate!])
      )
    );
  const hasChanges = rolesChanged || ratesChanged;

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateEmployeeRoles(employeeId, roleIds, hourlyRates);
        toast.success("Mansioni aggiornate");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore nell'aggiornamento");
      }
    });
  };

  const availableFor = (slot: number) => {
    const others = [role1, role2, role3].filter((_, i) => i !== slot - 1);
    const current = slot === 1 ? role1 : slot === 2 ? role2 : role3;
    return allRoles.filter((r) => r.id === current || !others.includes(r.id));
  };

  const getRate = (slot: number) => (slot === 1 ? rate1 : slot === 2 ? rate2 : rate3);
  const setRate = (slot: number, v: string) => {
    if (slot === 1) setRate1(v);
    else if (slot === 2) setRate2(v);
    else setRate3(v);
  };

  if (allRoles.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Fino a 3 mansioni in ordine di priorità. Puoi impostare una paga oraria specifica per ogni
        mansione (vuoto = usa la paga base: {baseHourlyRate ? `${baseHourlyRate} €/h` : "non impostata"}).
      </p>
      <div className="flex flex-wrap gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Mansione {i} {i === 1 && "(principale)"}
              </label>
              <select
                value={i === 1 ? role1 : i === 2 ? role2 : role3}
                onChange={(e) => {
                  const v = e.target.value;
                  if (i === 1) setRole1(v);
                  else if (i === 2) setRole2(v);
                  else setRole3(v);
                }}
                className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              >
                <option value="">—</option>
                {availableFor(i).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400">
                Paga (€/h)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={getRate(i)}
                onChange={(e) => setRate(i, e.target.value)}
                placeholder="Uguale a base"
                className="mt-0.5 w-24 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>
        ))}
      </div>
      {hasChanges && (
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Salvataggio..." : "Salva mansioni"}
        </button>
      )}
    </div>
  );
}
