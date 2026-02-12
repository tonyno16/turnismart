"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createRole, updateRole, deleteRole } from "@/app/actions/roles";

const COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
];

type Role = {
  id: string;
  name: string;
  color: string | null;
  is_active: boolean;
};

export function RolesManager({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("name", newName.trim());
        fd.set("color", newColor);
        await createRole(fd);
        toast.success("Mansione aggiunta");
        setNewName("");
        setShowAdd(false);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore");
      }
    });
  };

  const handleUpdate = (roleId: string) => {
    if (!editName.trim()) return;
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("name", editName.trim());
        fd.set("color", editColor);
        await updateRole(roleId, fd);
        toast.success("Mansione aggiornata");
        setEditingId(null);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore");
      }
    });
  };

  const handleDelete = (roleId: string, roleName: string) => {
    if (!confirm(`Eliminare la mansione "${roleName}"? Verranno rimossi anche fabbisogno e assegnazioni collegate.`)) return;
    startTransition(async () => {
      try {
        await deleteRole(roleId);
        toast.success("Mansione eliminata");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="font-semibold text-zinc-900 dark:text-white">
          Mansioni configurate
        </h2>
        <ul className="mt-4 space-y-2">
          {roles.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
            >
              {editingId === r.id ? (
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                  />
                  <div className="flex gap-1">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditColor(c)}
                        className={`h-6 w-6 rounded-full border-2 ${
                          editColor === c ? "border-zinc-900 dark:border-white" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdate(r.id)}
                    disabled={pending}
                    className="rounded bg-[hsl(var(--primary))] px-2 py-1 text-sm text-white"
                  >
                    Salva
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    disabled={pending}
                    className="rounded border px-2 py-1 text-sm"
                  >
                    Annulla
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 shrink-0 rounded-full"
                      style={{ backgroundColor: r.color ?? "#3B82F6" }}
                    />
                    <span className="font-medium">{r.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(r.id);
                        setEditName(r.name);
                        setEditColor(r.color ?? "#3B82F6");
                      }}
                      className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400"
                    >
                      Modifica
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, r.name)}
                      disabled={pending}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Elimina
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="font-semibold text-zinc-900 dark:text-white">
          Aggiungi mansione
        </h2>
        {showAdd ? (
          <form onSubmit={handleAdd} className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400">
                Nome
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="es. Cameriere"
                required
                className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400">
                Colore
              </label>
              <div className="mt-1 flex gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={`h-8 w-8 rounded-full border-2 ${
                      newColor === c ? "border-zinc-900 dark:border-white" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={pending || !newName.trim()}
              className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white"
            >
              {pending ? "Aggiunta..." : "Aggiungi"}
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              disabled={pending}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Annulla
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="mt-4 rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            + Aggiungi mansione
          </button>
        )}
      </div>
    </div>
  );
}
