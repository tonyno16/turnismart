import Link from "next/link";
import { eq, and, desc } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  accountantClients,
  organizations,
  reports,
} from "@/drizzle/schema";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";

export default async function AccountantClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const user = await requireRole(["accountant"]);

  const [link] = await db
    .select({
      orgId: organizations.id,
      orgName: organizations.name,
    })
    .from(accountantClients)
    .innerJoin(
      organizations,
      eq(accountantClients.organization_id, organizations.id)
    )
    .where(
      and(
        eq(accountantClients.accountant_user_id, user.id),
        eq(accountantClients.organization_id, clientId)
      )
    )
    .limit(1);

  if (!link) {
    return (
      <div>
        <p>Cliente non trovato.</p>
        <Link href="/accountant" className="text-[hsl(var(--primary))]">
          ← Torna al portale
        </Link>
      </div>
    );
  }

  const reportsList = await db
    .select()
    .from(reports)
    .where(eq(reports.organization_id, clientId))
    .orderBy(desc(reports.month));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/accountant"
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          ← Portale commercialista
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
          {link.orgName}
        </h1>
        <p className="text-sm text-zinc-500">Report mensili</p>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {reportsList.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              Nessun report ancora per questo cliente.
            </div>
          ) : (
            reportsList.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-4 px-4 py-3"
              >
                <div>
                  <span className="font-medium">
                    {format(parseISO(r.month), "MMMM yyyy", { locale: it })}
                  </span>
                  <p className="text-sm text-zinc-500">
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
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
