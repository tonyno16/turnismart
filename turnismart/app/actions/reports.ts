"use server";

import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { format, subMonths } from "date-fns";
import { db } from "@/lib/db";
import { reports, reportGenerationJobs } from "@/drizzle/schema";
import { requireOrganization } from "@/lib/auth";
import {
  aggregateMonthlyData,
  generateReportCsv,
  generateReportExcel,
  generateReportPdf,
  uploadReportToStorage,
} from "@/lib/reports";

export type GenerateReportResult =
  | { ok: true; reportId: string }
  | { ok: false; error: string };

export async function generateReport(monthStr: string): Promise<GenerateReportResult> {
  try {
    const { user, organization } = await requireOrganization();

    const [existing] = await db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.organization_id, organization.id),
          eq(reports.month, monthStr)
        )
      )
      .limit(1);

    const [job] = await db
      .insert(reportGenerationJobs)
      .values({
        organization_id: organization.id,
        month: monthStr,
        status: "aggregating",
        progress_percentage: 10,
      })
      .returning();

    const aggregate = await aggregateMonthlyData(organization.id, monthStr);

    await db
      .update(reportGenerationJobs)
      .set({ status: "generating", progress_percentage: 40 })
      .where(eq(reportGenerationJobs.id, job.id));

    let pdfUrl: string | null = null;
    let csvUrl: string | null = null;
    let excelUrl: string | null = null;

    try {
      const pdfBuf = await generateReportPdf(aggregate);
      pdfUrl = await uploadReportToStorage(
        organization.id,
        monthStr,
        "pdf",
        pdfBuf
      );
    } catch (e) {
      console.error("PDF generation failed:", e);
    }

    try {
      const csvBuf = await generateReportCsv(aggregate);
      csvUrl = await uploadReportToStorage(
        organization.id,
        monthStr,
        "csv",
        csvBuf
      );
    } catch (e) {
      console.error("CSV generation failed:", e);
    }

    try {
      const excelBuf = await generateReportExcel(aggregate);
      excelUrl = await uploadReportToStorage(
        organization.id,
        monthStr,
        "xlsx",
        excelBuf
      );
    } catch (e) {
      console.error("Excel generation failed:", e);
    }

    const reportPayload = {
      organization_id: organization.id,
      month: monthStr,
      status: "ready" as const,
      pdf_url: pdfUrl,
      csv_url: csvUrl,
      excel_url: excelUrl,
      summary: aggregate.summary,
      details_by_employee: aggregate.byEmployee,
      details_by_location: aggregate.byLocation,
      created_by_user_id: user.id,
    };

    let reportId: string;

    if (existing) {
      await db
        .update(reports)
        .set(reportPayload)
        .where(eq(reports.id, existing.id));
      reportId = existing.id;
    } else {
      const [r] = await db.insert(reports).values(reportPayload).returning();
      reportId = r!.id;
    }

    await db
      .update(reportGenerationJobs)
      .set({
        report_id: reportId,
        status: "completed",
        progress_percentage: 100,
        completed_at: new Date(),
      })
      .where(eq(reportGenerationJobs.id, job.id));

    revalidatePath("/reports");
    revalidatePath("/accountant");

    return { ok: true, reportId };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Errore generazione report",
    };
  }
}

export async function getReportsList() {
  const { organization } = await requireOrganization();
  return db
    .select()
    .from(reports)
    .where(eq(reports.organization_id, organization.id))
    .orderBy(desc(reports.month));
}
