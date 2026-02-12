import { redirect } from "next/navigation";
import { getEmployeeForUser, requireUser } from "@/lib/auth";
import { getEmployeeDetail } from "@/lib/employees";
import { MyPreferencesGrid } from "./my-preferences-grid";

export default async function MyPreferencesPage() {
  const user = await requireUser();
  const employee = await getEmployeeForUser(user.id);
  if (!employee) {
    redirect("/dashboard?msg=employee_only");
  }

  const detail = await getEmployeeDetail(employee.id);
  if (!detail) {
    redirect("/dashboard?msg=employee_only");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Le mie preferenze
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Indica quando sei disponibile a lavorare (ricorrente ogni settimana).
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Disponibilità settimanale
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          ✓ Disponibile · ✗ Non disponibile · ★ Preferito — tocca per cambiare
        </p>
        <MyPreferencesGrid availability={detail.availability} />
      </div>
    </div>
  );
}
