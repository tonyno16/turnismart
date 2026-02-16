import Link from "next/link";
import { requireOrganization } from "@/lib/auth";
import { getReportsList } from "@/app/actions/reports";
import { format, parseISO, subMonths } from "date-fns";
import { it } from "date-fns/locale";
import { ReportsGenerateForm } from "./reports-generate-form";

export default async function ReportsPage() {
  await requireOrganization();
  const reportsList = await getReportsList();

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(new Date(), i);
    return format(d, "yyyy-MM");
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Report mensili
        </h1>
        <ReportsGenerateForm months={months} />
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Genera report PDF, CSV e Excel con ore e costi per dipendente e sede.
        I report vengono salvati e possono essere scaricati dal commercialista.
        <Link href="/settings/accountant" className="ml-1 text-[hsl(var(--primary))] hover:underline">
          Collega un commercialista
        </Link>
      </p>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-white">
            Report generati
          </h2>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {reportsList.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              Nessun report ancora. Seleziona un mese e clicca &quot;Genera&quot;.
            </div>
          ) : (
            reportsList.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-4 px-4 py-3"
              >
                <div>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {format(parseISO(r.month), "MMMM yyyy", { locale: it })}
                  </span>
                  <p className="text-sm text-zinc-500">
                    {r.summary?.employeeCount ?? 0} dipendenti ·{" "}
                    {(r.summary?.totalHours ?? 0).toFixed(1)}h · €
                    {(r.summary?.totalCost ?? 0).toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {r.pdf_url && (
                    <a
                      href={r.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
                    >
                      PDF
                    </a>
                  )}
                  {r.csv_url && (
                    <a
                      href={r.csv_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
                    >
                      CSV
                    </a>
                  )}
                  {r.excel_url && (
                    <a
                      href={r.excel_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
                    >
                      Excel
                    </a>
                  )}
                  <Link
                    href={`/reports/${r.id}`}
                    className="rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                  >
                    Dettaglio
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
