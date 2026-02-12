import Link from "next/link";
import { requireOrganization } from "@/lib/auth";
import { getPendingRequests } from "@/app/actions/requests";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { ApproveRejectButtons } from "./approve-reject-buttons";

const TYPE_LABELS: Record<string, string> = {
  shift_swap: "Cambio turno",
  vacation: "Ferie",
  personal_leave: "Permesso",
  sick_leave: "Malattia",
};

const TIME_OFF_LABELS: Record<string, string> = {
  vacation: "Ferie",
  personal_leave: "Permesso",
  sick_leave: "Malattia",
  other: "Altro",
};

export default async function RequestsPage() {
  const { user, organization } = await requireOrganization();
  if (user.role !== "owner" && user.role !== "manager") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-900/20">
        <p className="text-amber-800 dark:text-amber-200">
          Solo titolare o manager può gestire le richieste.
        </p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm text-[hsl(var(--primary))] hover:underline">
          ← Torna alla dashboard
        </Link>
      </div>
    );
  }

  const { shiftRequests, timeOff } = await getPendingRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Richieste da esaminare
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Approva o rifiuta le richieste di cambio turno e assenze.
        </p>
      </div>

      {shiftRequests.length === 0 && timeOff.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-zinc-500">Nessuna richiesta in attesa.</p>
          <Link
            href="/dashboard"
            className="mt-2 inline-block text-sm text-[hsl(var(--primary))] hover:underline"
          >
            Vai alla dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {shiftRequests.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <h2 className="font-semibold text-zinc-900 dark:text-white">
                  Richieste turni
                </h2>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {shiftRequests.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {r.employee_first} {r.employee_last} · {TYPE_LABELS[r.type] ?? r.type}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {r.shift_date && r.location_name
                          ? `${r.shift_date} · ${r.location_name} · ${r.shift_start}-${r.shift_end}`
                          : r.start_date && r.end_date
                          ? `${r.start_date} – ${r.end_date}`
                          : format(r.created_at, "d MMM yyyy", { locale: it })}
                        {r.reason && ` · ${r.reason}`}
                      </p>
                    </div>
                    <ApproveRejectButtons type="shift_request" id={r.id} organizationId={organization.id} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {timeOff.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <h2 className="font-semibold text-zinc-900 dark:text-white">
                  Assenze e permessi
                </h2>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {timeOff.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {t.employee_first} {t.employee_last} · {TIME_OFF_LABELS[t.type] ?? t.type}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {t.start_date} – {t.end_date}
                        {t.notes && ` · ${t.notes}`}
                      </p>
                    </div>
                    <ApproveRejectButtons type="time_off" id={t.id} organizationId={organization.id} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
