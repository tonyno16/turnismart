"use client";

import { useTransition, useEffect, useState } from "react";
import { completeStep4, getOnboardingData } from "@/app/actions/onboarding";

type EmployeeRow = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  roleId: string;
  weeklyHours: number;
};

export function Step4Employees({
  onComplete,
  onBack,
  onError,
}: {
  onComplete: () => void;
  onBack: () => void;
  onError: (e: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [roles, setRoles] = useState<Awaited<ReturnType<typeof getOnboardingData>>["roles"]>([]);
  const [rows, setRows] = useState<EmployeeRow[]>([
    { id: "1", firstName: "", lastName: "", phone: "", roleId: "", weeklyHours: 40 },
  ]);

  useEffect(() => {
    getOnboardingData().then((d) => {
      setRoles(d.roles);
      setRows((r) =>
        r.map((row) =>
          !row.roleId && d.roles[0] ? { ...row, roleId: d.roles[0].id } : row
        )
      );
    });
  }, []);

  const addRow = () => {
    setRows((r) => [
      ...r,
      {
        id: crypto.randomUUID(),
        firstName: "",
        lastName: "",
        phone: "",
        roleId: roles[0]?.id ?? "",
        weeklyHours: 40,
      },
    ]);
  };

  const updateRow = (id: string, field: keyof EmployeeRow, value: string | number) => {
    setRows((r) =>
      r.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((r) => r.filter((row) => row.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = rows
      .filter((r) => r.firstName.trim() || r.lastName.trim())
      .map((r) => ({
        firstName: r.firstName,
        lastName: r.lastName,
        phone: r.phone || undefined,
        roleId: r.roleId || roles[0]?.id,
        weeklyHours: r.weeklyHours,
      }));
    const formData = new FormData();
    formData.set("employees", JSON.stringify(data));
    startTransition(async () => {
      try {
        await completeStep4(formData);
        onComplete();
      } catch (err) {
        onError(err instanceof Error ? err.message : "Errore");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Primi dipendenti
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Aggiungi almeno un dipendente. Potrai aggiungerne altri dopo.
      </p>

      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
          >
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs text-zinc-500">Nome</label>
              <input
                value={row.firstName}
                onChange={(e) => updateRow(row.id, "firstName", e.target.value)}
                placeholder="Mario"
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs text-zinc-500">Cognome</label>
              <input
                value={row.lastName}
                onChange={(e) => updateRow(row.id, "lastName", e.target.value)}
                placeholder="Rossi"
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs text-zinc-500">Telefono</label>
              <input
                value={row.phone}
                onChange={(e) => updateRow(row.id, "phone", e.target.value)}
                type="tel"
                placeholder="+39 333..."
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <div className="w-36">
              <label className="block text-xs text-zinc-500">Ruolo</label>
              <select
                value={row.roleId}
                onChange={(e) => updateRow(row.id, "roleId", e.target.value)}
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-20">
              <label className="block text-xs text-zinc-500">Ore/sett</label>
              <input
                type="number"
                min={1}
                max={60}
                value={row.weeklyHours}
                onChange={(e) =>
                  updateRow(row.id, "weeklyHours", parseInt(e.target.value, 10) || 40)
                }
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              className="rounded px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Rimuovi
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="rounded-lg border border-dashed border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-400"
        >
          + Aggiungi dipendente
        </button>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
        >
          Indietro
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Salvataggio..." : "Continua"}
        </button>
      </div>
    </form>
  );
}
