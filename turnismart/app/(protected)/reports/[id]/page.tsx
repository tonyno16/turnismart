import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { requireOrganization } from "@/lib/auth";
import { db } from "@/lib/db";
import { reports } from "@/drizzle/schema";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organization } = await requireOrganization();

  const [report] = await db
    .select()
    .from(reports)
    .where(
      and(
        eq(reports.id, id),
        eq(reports.organization_id, organization.id)
      )
    )
    .limit(1);

  if (!report) {
    return (
      <div className="space-y-4">
        <p>Report non trovato.</p>
        <Link href="/reports" className="text-[hsl(var(--primary))]">
          ← Torna ai report
        </Link>
      </div>
    );
  }

  const byEmployee = (report.details_by_employee ?? []) as Array<{
    employeeName: string;
    ordinaryHours: number;
    overtimeHours: number;
    holidayHours: number;
    sickHours?: number;
    vacationHours?: number;
    totalHours?: number;
    totalCost: number;
  }>;

  const byLocation = (report.details_by_location ?? []) as Array<{
    locationName: string;
    totalHours: number;
    totalCost: number;
  }>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/reports"
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            ← Report
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {format(parseISO(report.month), "MMMM yyyy", { locale: it })}
          </h1>
          <p className="text-sm text-zinc-500">
            {report.summary?.employeeCount ?? 0} dipendenti ·{" "}
            {(report.summary?.totalHours ?? 0).toFixed(1)}h totali · €
            {(report.summary?.totalCost ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="flex gap-2">
          {report.pdf_url && (
            <a
              href={report.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
            >
              Scarica PDF
            </a>
          )}
          {report.csv_url && (
            <a
              href={report.csv_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
            >
              Scarica CSV
            </a>
          )}
          {report.excel_url && (
            <a
              href={report.excel_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
            >
              Scarica Excel
            </a>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="font-semibold">Per dipendente</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                <th className="px-4 py-2 text-left">Dipendente</th>
                <th className="px-4 py-2 text-right">Ore ord.</th>
                <th className="px-4 py-2 text-right">Ore str.</th>
                <th className="px-4 py-2 text-right">Ore fest.</th>
                <th className="px-4 py-2 text-right">Malattia</th>
                <th className="px-4 py-2 text-right">Ferie</th>
                <th className="px-4 py-2 text-right">Totale</th>
                <th className="px-4 py-2 text-right">Costo</th>
              </tr>
            </thead>
            <tbody>
              {byEmployee.map((e) => (
                <tr
                  key={e.employeeName}
                  className="border-b border-zinc-100 dark:border-zinc-800"
                >
                  <td className="px-4 py-2 font-medium">{e.employeeName}</td>
                  <td className="px-4 py-2 text-right">{e.ordinaryHours}</td>
                  <td className="px-4 py-2 text-right">{e.overtimeHours}</td>
                  <td className="px-4 py-2 text-right">{e.holidayHours}</td>
                  <td className="px-4 py-2 text-right">{e.sickHours}</td>
                  <td className="px-4 py-2 text-right">{e.vacationHours}</td>
                  <td className="px-4 py-2 text-right">{e.totalHours ?? 0}</td>
                  <td className="px-4 py-2 text-right">€{e.totalCost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {byLocation.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="font-semibold">Per sede</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                  <th className="px-4 py-2 text-left">Sede</th>
                  <th className="px-4 py-2 text-right">Ore</th>
                  <th className="px-4 py-2 text-right">Costo</th>
                </tr>
              </thead>
              <tbody>
                {byLocation.map((l) => (
                  <tr
                    key={l.locationName}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="px-4 py-2 font-medium">{l.locationName}</td>
                    <td className="px-4 py-2 text-right">{l.totalHours}</td>
                    <td className="px-4 py-2 text-right">€{l.totalCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
