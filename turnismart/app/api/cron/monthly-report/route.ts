import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { subMonths, format, startOfMonth } from "date-fns";
import {
  aggregateMonthlyData,
  generateReportCsv,
  generateReportExcel,
  generateReportPdf,
  uploadReportToStorage,
} from "@/lib/reports";
import { reports } from "@/drizzle/schema";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
    }
  } else if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lastMonthDate = startOfMonth(subMonths(new Date(), 1));
  const lastMonth = format(lastMonthDate, "yyyy-MM");
  const lastMonthFull = format(lastMonthDate, "yyyy-MM-dd");
  const orgs = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.onboarding_completed, true));

  const results: { orgId: string; ok: boolean; error?: string }[] = [];

  for (const org of orgs) {
    try {
      const aggregate = await aggregateMonthlyData(org.id, lastMonthFull);

      if (aggregate.byEmployee.length === 0) {
        results.push({ orgId: org.id, ok: true });
        continue;
      }

      let pdfUrl: string | null = null;
      let csvUrl: string | null = null;
      let excelUrl: string | null = null;

      try {
        pdfUrl = await uploadReportToStorage(
          org.id,
          lastMonthFull,
          "pdf",
          await generateReportPdf(aggregate)
        );
      } catch {}
      try {
        csvUrl = await uploadReportToStorage(
          org.id,
          lastMonthFull,
          "csv",
          await generateReportCsv(aggregate)
        );
      } catch {}
      try {
        excelUrl = await uploadReportToStorage(
          org.id,
          lastMonthFull,
          "xlsx",
          await generateReportExcel(aggregate)
        );
      } catch {}

      await db
        .insert(reports)
        .values({
          organization_id: org.id,
          month: lastMonthFull,
          status: "ready",
          pdf_url: pdfUrl,
          csv_url: csvUrl,
          excel_url: excelUrl,
          summary: aggregate.summary,
          details_by_employee: aggregate.byEmployee,
          details_by_location: aggregate.byLocation,
        })
        .onConflictDoUpdate({
          target: [reports.organization_id, reports.month],
          set: {
            pdf_url: pdfUrl,
            csv_url: csvUrl,
            excel_url: excelUrl,
            summary: aggregate.summary,
            details_by_employee: aggregate.byEmployee,
            details_by_location: aggregate.byLocation,
            status: "ready",
          },
        });

      results.push({ orgId: org.id, ok: true });
    } catch (e) {
      results.push({
        orgId: org.id,
        ok: false,
        error: e instanceof Error ? e.message : "Errore",
      });
    }
  }

  return NextResponse.json({
    month: lastMonth,
    processed: orgs.length,
    results,
  });
}
