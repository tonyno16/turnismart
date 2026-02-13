"use client";

import { useState, memo } from "react";

type Role = { id: string; name: string };
type Location = { id: string; name: string };

export type SchedulerFiltersState = {
  roleId: string;
  preferredLocationId: string;
  onlyUncovered: boolean;
};

export const SchedulerFilters = memo(function SchedulerFilters({
  roles,
  locations,
  filters,
  onChange,
  collapsed = false,
}: {
  roles: Role[];
  locations: Location[];
  filters: SchedulerFiltersState;
  onChange: (f: SchedulerFiltersState) => void;
  collapsed?: boolean;
}) {
  const [open, setOpen] = useState(!collapsed);

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50"
      >
        <span>Filtri</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div className="space-y-2 border-t border-zinc-200 px-3 pb-3 pt-2 dark:border-zinc-700">
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Mansione</label>
            <select
              value={filters.roleId}
              onChange={(e) =>
                onChange({ ...filters, roleId: e.target.value })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            >
              <option value="">Tutte</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              Sede preferita
            </label>
            <select
              value={filters.preferredLocationId}
              onChange={(e) =>
                onChange({ ...filters, preferredLocationId: e.target.value })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            >
              <option value="">Tutte</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.onlyUncovered}
              onChange={(e) =>
                onChange({ ...filters, onlyUncovered: e.target.checked })
              }
              className="rounded border-zinc-300"
            />
            <span>Solo scoperti</span>
          </label>
        </div>
      )}
    </div>
  );
});
