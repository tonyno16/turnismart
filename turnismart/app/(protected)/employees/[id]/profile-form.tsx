"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEmployee, toggleEmployeeActive } from "@/app/actions/employees";

type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  weekly_hours: number;
  contract_type: string;
  preferred_location_id: string | null;
  is_active: boolean;
  notes: string | null;
};

type Role = { id: string; name: string };
type Location = { id: string; name: string };

const CONTRACT_OPTIONS = [
  { value: "full_time", label: "Full time" },
  { value: "part_time", label: "Part time" },
  { value: "on_call", label: "A chiamata" },
  { value: "seasonal", label: "Stagionale" },
];

export function EmployeeProfileForm({
  employee,
  roles,
  locations,
}: {
  employee: Employee;
  roles: Role[];
  locations: Location[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    firstName: employee.first_name,
    lastName: employee.last_name,
    email: employee.email ?? "",
    phone: employee.phone ?? "",
    weeklyHours: String(employee.weekly_hours),
    contractType: employee.contract_type,
    preferredLocationId: employee.preferred_location_id ?? "",
    notes: employee.notes ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("firstName", formData.firstName);
    fd.set("lastName", formData.lastName);
    fd.set("email", formData.email);
    fd.set("phone", formData.phone);
    fd.set("weeklyHours", formData.weeklyHours);
    fd.set("contractType", formData.contractType);
    fd.set("preferredLocationId", formData.preferredLocationId || "");
    fd.set("notes", formData.notes);
    startTransition(async () => {
      await updateEmployee(employee.id, fd);
      router.refresh();
    });
  };

  const handleToggleActive = () => {
    startTransition(async () => {
      await toggleEmployeeActive(employee.id);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nome
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) =>
              setFormData((d) => ({ ...d, firstName: e.target.value }))
            }
            required
            className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Cognome
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) =>
              setFormData((d) => ({ ...d, lastName: e.target.value }))
            }
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
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((d) => ({ ...d, email: e.target.value }))
            }
            className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Telefono
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData((d) => ({ ...d, phone: e.target.value }))
            }
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
            type="number"
            min={1}
            max={60}
            value={formData.weeklyHours}
            onChange={(e) =>
              setFormData((d) => ({ ...d, weeklyHours: e.target.value }))
            }
            className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tipo contratto
          </label>
          <select
            value={formData.contractType}
            onChange={(e) =>
              setFormData((d) => ({ ...d, contractType: e.target.value }))
            }
            className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          >
            {CONTRACT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Sede preferita
          </label>
          <select
            value={formData.preferredLocationId}
            onChange={(e) =>
              setFormData((d) => ({
                ...d,
                preferredLocationId: e.target.value,
              }))
            }
            className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          >
            <option value="">—</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Note
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData((d) => ({ ...d, notes: e.target.value }))
          }
          rows={2}
          className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Salvataggio..." : "Salva profilo"}
        </button>
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={pending}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            employee.is_active
              ? "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200"
              : "bg-green-200 text-green-800 hover:bg-green-300"
          }`}
        >
          {employee.is_active ? "Disattiva" : "Riattiva"}
        </button>
      </div>
    </form>
  );
}
