import { redirect } from "next/navigation";
import { getEmployeeForUser, requireUser } from "@/lib/auth";
import { getMyRequests } from "@/app/actions/requests";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { NewRequestForm } from "./new-request-form";

const TYPE_LABELS: Record<string, string> = {
  shift_swap: "Cambio turno",
  vacation: "Ferie",
  personal_leave: "Permesso",
  sick_leave: "Malattia",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "In attesa",
  approved: "Approvato",
  rejected: "Rifiutato",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400",
};

const TIME_OFF_LABELS: Record<string, string> = {
  vacation: "Ferie",
  personal_leave: "Permesso",
  sick_leave: "Malattia",
  other: "Altro",
};

export default async function MyRequestsPage() {
  const user = await requireUser();
  const employee = await getEmployeeForUser(user.id);
  if (!employee) {
    redirect("/dashboard?msg=employee_only");
  }

  const { shiftRequests, timeOff } = await getMyRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Le mie richieste
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Richieste di cambio turno, ferie, permessi e malattia.
        </p>
      </div>

      <NewRequestForm />

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-white">
            Stato richieste
          </h2>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {shiftRequests.length === 0 && timeOff.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">
              Nessuna richiesta inviata.
            </div>
          ) : (
            <>
              {shiftRequests.map((r) => (
                <div
                  key={`sr-${r.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {TYPE_LABELS[r.type] ?? r.type}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {r.shift_date && r.location_name
                        ? `${r.shift_date} · ${r.location_name} ${r.shift_start ? `· ${r.shift_start}-${r.shift_end}` : ""}`
                        : r.start_date && r.end_date
                        ? `${r.start_date} – ${r.end_date}`
                        : format(r.created_at, "d MMM yyyy", { locale: it })}
                      {r.reason && ` · ${r.reason}`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      STATUS_COLORS[r.status] ?? ""
                    }`}
                  >
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </div>
              ))}
              {timeOff.map((t) => (
                <div
                  key={`to-${t.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {TIME_OFF_LABELS[t.type] ?? t.type}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {t.start_date} – {t.end_date}
                      {t.notes && ` · ${t.notes}`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      STATUS_COLORS[t.status] ?? ""
                    }`}
                  >
                    {STATUS_LABELS[t.status] ?? t.status}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
