"use server";

import { revalidatePath } from "next/cache";
import { requireOrganization } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { checkQuota } from "@/lib/usage";
import { db } from "@/lib/db";
import { importJobs } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { csvImportWorkflow } from "@/trigger/csv-import";

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ["text/csv", "application/vnd.ms-excel", "text/plain"];

export type CreateImportJobResult =
  | { ok: true; jobId: string }
  | { ok: false; error: string };

export async function uploadCsvAndCreateImportJob(
  formData: FormData
): Promise<CreateImportJobResult> {
  try {
    const { organization } = await requireOrganization();
    if (organization.id === undefined) throw new Error("Organizzazione non trovata");

    const quota = await checkQuota(organization.id, "employees");
    if (!quota.allowed) {
      return { ok: false, error: quota.message ?? "Limite dipendenti raggiunto" };
    }

    const file = formData.get("file") as File | null;
    if (!file) return { ok: false, error: "Nessun file selezionato" };

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return { ok: false, error: "Solo file CSV sono supportati" };
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return { ok: false, error: `File troppo grande (max ${MAX_FILE_SIZE_MB}MB)` };
    }

    const contentType = file.type || "";
    if (!ALLOWED_TYPES.some((t) => contentType.includes(t)) && file.name.endsWith(".csv")) {
      // Allow by extension if CSV
    } else if (!ALLOWED_TYPES.some((t) => contentType.includes(t))) {
      return { ok: false, error: "Tipo file non supportato" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = createServiceClient();
    const jobId = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${organization.id}/${jobId}/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("imports")
      .upload(filePath, buffer, {
        contentType: "text/csv",
        upsert: true,
      });

    if (uploadError) {
      return { ok: false, error: `Upload fallito: ${uploadError.message}` };
    }

    const [job] = await db
      .insert(importJobs)
      .values({
        organization_id: organization.id,
        file_name: file.name,
        file_url: filePath,
        status: "pending",
      })
      .returning();

    if (!job) return { ok: false, error: "Impossibile creare il job" };

    const handle = await csvImportWorkflow.trigger({
      jobId: job.id,
      organizationId: organization.id,
      filePath,
      fileName: file.name,
    });

    await db
      .update(importJobs)
      .set({ trigger_run_id: handle.id })
      .where(eq(importJobs.id, job.id));

    revalidatePath("/employees");
    return { ok: true, jobId: job.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Errore durante l'import",
    };
  }
}

export async function getImportJobStatus(jobId: string) {
  const { organization } = await requireOrganization();
  const [job] = await db
    .select()
    .from(importJobs)
    .where(eq(importJobs.id, jobId))
    .limit(1);
  if (!job || job.organization_id !== organization.id) return null;
  return {
    id: job.id,
    status: job.status,
    progress_percentage: job.progress_percentage,
    total_rows: job.total_rows,
    result_summary: job.result_summary,
    error_message: job.error_message,
    completed_at: job.completed_at,
  };
}
