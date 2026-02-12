import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getAccountantClients, getClientReports } from "@/lib/accountant";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";

export default async function AccountantPage() {
  const user = await requireRole(["accountant"]);
  const clients = await getAccountantClients(user.id);

  if (clients.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Portale Commercialista
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Non hai ancora clienti collegati. I titolari possono invitarti dalle
          impostazioni della loro attivit&agrave;.
        </p>
      </div>
    );
  }

  const clientsWithReports = await Promise.all(
    clients.map(async (c) => ({
      ...c,
      reports: await getClientReports(c.organizationId),
    }))
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        Portale Commercialista
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Seleziona un cliente per visualizzare e scaricare i report mensili.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clientsWithReports.map((client) => (
          <div
            key={client.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              {client.organizationName}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {client.reports.length} report disponibili
            </p>
            <div className="mt-3 space-y-2">
              {client.reports.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {format(parseISO(r.month), "MMM yyyy", { locale: it })}
                  </span>
                  <div className="flex gap-1">
                    {r.pdf_url && (
                      <a
                        href={r.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[hsl(var(--primary))] hover:underline"
                      >
                        PDF
                      </a>
                    )}
                    {r.csv_url && (
                      <a
                        href={r.csv_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[hsl(var(--primary))] hover:underline"
                      >
                        CSV
                      </a>
                    )}
                    {r.excel_url && (
                      <a
                        href={r.excel_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[hsl(var(--primary))] hover:underline"
                      >
                        Excel
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {client.reports.length > 3 && (
                <Link
                  href={`/accountant/${client.organizationId}`}
                  className="text-sm text-[hsl(var(--primary))] hover:underline"
                >
                  Vedi tutti →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
