"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  bulkDeactivate,
  bulkAddRole,
  bulkRemoveRole,
  exportEmployeesCsv,
} from "@/app/actions/employees";

type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  weekly_hours: number;
  is_active: boolean;
};

type Role = { id: string; name: string };

export function EmployeesTableClient({
  employees: employeesList,
  roles: rolesList,
}: {
  employees: Employee[];
  roles: Role[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showRemoveRoleModal, setShowRemoveRoleModal] = useState(false);

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === employeesList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(employeesList.map((e) => e.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDeactivate = () => {
    startTransition(async () => {
      const result = await bulkDeactivate([...selectedIds]);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`${result.count} dipendenti disattivati`);
      setShowDeactivateModal(false);
      clearSelection();
      router.refresh();
    });
  };

  const handleBulkAddRole = (roleId: string) => {
    if (!roleId) return;
    startTransition(async () => {
      const result = await bulkAddRole([...selectedIds], roleId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const msg =
        result.skipped > 0
          ? `${result.updated} aggiornati, ${result.skipped} saltati (già 3 mansioni o già presenti)`
          : `${result.updated} dipendenti aggiornati`;
      toast.success(msg);
      setShowAddRoleModal(false);
      clearSelection();
      router.refresh();
    });
  };

  const handleBulkRemoveRole = (roleId: string) => {
    if (!roleId) return;
    startTransition(async () => {
      const result = await bulkRemoveRole([...selectedIds], roleId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`${result.removed} mansioni rimosse`);
      setShowRemoveRoleModal(false);
      clearSelection();
      router.refresh();
    });
  };

  const handleExportCsv = () => {
    startTransition(async () => {
      const result = await exportEmployeesCsv([...selectedIds]);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV scaricato");
    });
  };

  const selectedCount = selectedIds.size;

  return (
    <>
      {selectedCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {selectedCount} selezionati
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowDeactivateModal(true)}
              disabled={pending}
              aria-label="Disattiva dipendenti selezionati"
              className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 disabled:opacity-50"
            >
              Disattiva
            </button>
            <button
              type="button"
              onClick={() => setShowAddRoleModal(true)}
              disabled={pending}
              aria-label="Aggiungi mansione ai dipendenti selezionati"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-600 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50"
            >
              Aggiungi mansione
            </button>
            <button
              type="button"
              onClick={() => setShowRemoveRoleModal(true)}
              disabled={pending}
              aria-label="Rimuovi mansione dai dipendenti selezionati"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-600 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50"
            >
              Rimuovi mansione
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={pending}
              aria-label="Esporta dipendenti selezionati in CSV"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-600 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50"
            >
              Esporta CSV
            </button>
            <button
              type="button"
              onClick={clearSelection}
              aria-label="Annulla selezione"
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:underline dark:text-zinc-400"
            >
              Annulla selezione
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
              <th className="w-10 p-3">
                <label className="flex cursor-pointer items-center justify-center">
                  <input
                    type="checkbox"
                    checked={
                      employeesList.length > 0 && selectedIds.size === employeesList.length
                    }
                    onChange={toggleAll}
                    aria-label="Seleziona tutti i dipendenti della pagina"
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                </label>
              </th>
              <th className="p-3 text-left font-medium">Nome</th>
              <th className="p-3 text-left font-medium">Contatti</th>
              <th className="p-3 text-left font-medium">Ore/sett</th>
              <th className="p-3 text-left font-medium">Stato</th>
              <th className="p-3 text-right font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {employeesList.map((emp) => (
              <tr
                key={emp.id}
                className={`border-b border-zinc-100 dark:border-zinc-800 ${
                  selectedIds.has(emp.id) ? "bg-[hsl(var(--primary))]/5" : ""
                }`}
              >
                <td className="w-10 p-3">
                  <label className="flex cursor-pointer items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(emp.id)}
                      onChange={() => toggleOne(emp.id)}
                      aria-label={`Seleziona ${emp.first_name} ${emp.last_name}`}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                  </label>
                </td>
                <td className="p-3">
                  <Link
                    href={`/employees/${emp.id}`}
                    className="font-medium text-[hsl(var(--primary))] hover:underline"
                  >
                    {emp.first_name} {emp.last_name}
                  </Link>
                </td>
                <td className="p-3 text-zinc-600 dark:text-zinc-400">
                  {emp.email || emp.phone || "—"}
                </td>
                <td className="p-3">{emp.weekly_hours}h</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      emp.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {emp.is_active ? "Attivo" : "Inattivo"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/employees/${emp.id}`}
                    className="text-[hsl(var(--primary))] hover:underline"
                  >
                    Modifica
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Disattiva {selectedCount} dipendenti
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              I dipendenti selezionati non compariranno più nello scheduler. Puoi
              riattivarli singolarmente dalla scheda dipendente.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                disabled={pending}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleBulkDeactivate}
                disabled={pending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {pending ? "Disattivazione..." : "Disattiva"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddRoleModal && (
        <BulkRoleModal
          title="Aggiungi mansione"
          roles={rolesList}
          onConfirm={handleBulkAddRole}
          onClose={() => setShowAddRoleModal(false)}
          pending={pending}
          confirmLabel="Aggiungi"
        />
      )}

      {showRemoveRoleModal && (
        <BulkRoleModal
          title="Rimuovi mansione"
          roles={rolesList}
          onConfirm={handleBulkRemoveRole}
          onClose={() => setShowRemoveRoleModal(false)}
          pending={pending}
          confirmLabel="Rimuovi"
        />
      )}
    </>
  );
}

function BulkRoleModal({
  title,
  roles,
  onConfirm,
  onClose,
  pending,
  confirmLabel,
}: {
  title: string;
  roles: Role[];
  onConfirm: (roleId: string) => void;
  onClose: () => void;
  pending: boolean;
  confirmLabel: string;
}) {
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
        <label className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Mansione
        </label>
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          disabled={pending}
        >
          <option value="">Seleziona...</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={() => onConfirm(roleId)}
            disabled={pending || !roleId}
            className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
