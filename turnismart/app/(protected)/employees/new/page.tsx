import Link from "next/link";
import { requireOrganization } from "@/lib/auth";
import { getOnboardingData } from "@/app/actions/onboarding";
import { getLocations } from "@/lib/locations";
import { NewEmployeeForm } from "./form";

export default async function NewEmployeePage() {
  const { organization } = await requireOrganization();
  const { roles } = await getOnboardingData();
  const locationsList = await getLocations(organization.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/employees"
          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          ← Dipendenti
        </Link>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Nuovo dipendente
        </h1>
        <NewEmployeeForm roles={roles} locations={locationsList} />
      </div>
    </div>
  );
}
