import Link from "next/link";
import { requireOrganization } from "@/lib/auth";
import { getEmployeesByOrganization } from "@/lib/employees";
import { getOnboardingData } from "@/app/actions/onboarding";
import { EmployeesPageClient } from "./employees-page-client";
import { EmployeesTableClient } from "@/components/employees/employees-table-client";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; active?: string }>;
}) {
  const params = await searchParams;
  const { organization } = await requireOrganization();
  const { roles } = await getOnboardingData();

  const employeesList = await getEmployeesByOrganization(organization.id, {
    search: params.search,
    isActive: params.active === "false" ? false : params.active === "true" ? true : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Dipendenti
        </h1>
        <div className="flex gap-2">
          <EmployeesPageClient />
          <Link
            href="/employees/new"
            className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            + Nuovo dipendente
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <form method="get" className="flex gap-2">
          <input
            name="search"
            type="search"
            placeholder="Cerca nome, email, telefono..."
            defaultValue={params.search}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
          <select
            name="active"
            defaultValue={params.active ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          >
            <option value="">Tutti</option>
            <option value="true">Attivi</option>
            <option value="false">Inattivi</option>
          </select>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 dark:hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Filtra
          </button>
        </form>
      </div>

      {employeesList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-400">
            Nessun dipendente trovato.
          </p>
          <Link
            href="/employees/new"
            className="mt-4 inline-block text-[hsl(var(--primary))] hover:underline"
          >
            Aggiungi il primo
          </Link>
        </div>
      ) : (
        <EmployeesTableClient
          employees={employeesList}
          roles={roles.map((r) => ({ id: r.id, name: r.name }))}
        />
      )}
    </div>
  );
}
