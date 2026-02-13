import { task, logger } from "@trigger.dev/sdk/v3";
import Papa from "papaparse";
import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import {
  importJobs,
  employees,
  employeeRoles,
  roles,
  contractTypes,
} from "../drizzle/schema";
import {
  autoMapColumns,
  normalizeHeader,
  validateEmail,
  validatePhone,
  CONTRACT_MAP,
} from "./csv-import-helpers";

export const createEmployeeRecords = task({
  id: "create-employee-records",
  run: async (payload: {
    jobId: string;
    organizationId: string;
    validRows: Array<Record<string, string>>;
    roleNameToId: Record<string, string>;
  }) => {
    const db = getDb();
    let imported = 0;
    const errors: Array<{ row: number; reason: string }> = [];

    for (let i = 0; i < payload.validRows.length; i++) {
      const row = payload.validRows[i];
        const rowNum = Number((row as any)._row) || i + 2;
      try {
        const roleName = (row.role || "").trim();
        const roleId = roleName ? payload.roleNameToId[roleName.toLowerCase()] : null;

        const [emp] = await db
          .insert(employees)
          .values({
            organization_id: payload.organizationId,
            first_name: (row.first_name || "").trim() || "—",
            last_name: (row.last_name || "").trim() || "—",
            email: (row.email || "").trim() || null,
            phone: (row.phone || "").trim() || null,
            contract_type: (() => {
              const key = (row.contract_type || "full_time").toLowerCase().replace(/\s/g, "_").replace(/-/g, "_");
              return CONTRACT_MAP[key] && (contractTypes as readonly string[]).includes(CONTRACT_MAP[key])
                ? (CONTRACT_MAP[key] as any)
                : "full_time";
            })(),
            weekly_hours: parseInt(row.weekly_hours || "40", 10) || 40,
          })
          .returning();

        if (emp && roleId) {
          await db.insert(employeeRoles).values({
            employee_id: emp.id,
            role_id: roleId,
            priority: 1,
          });
        }
        imported++;
      } catch (e) {
        errors.push({
          row: rowNum,
          reason: e instanceof Error ? e.message : "Errore inserimento",
        });
      }
    }

    return { imported, errors };
  },
});

export const finalizeImport = task({
  id: "finalize-import",
  run: async (payload: {
    jobId: string;
    imported: number;
    skipped: number;
    errors: Array<{ row: number; reason: string }>;
  }) => {
    const db = getDb();
    await db
      .update(importJobs)
      .set({
        status: "completed",
        progress_percentage: 100,
        result_summary: {
          imported: payload.imported,
          skipped: payload.skipped,
          errors: payload.errors,
        },
        completed_at: new Date(),
      })
      .where(eq(importJobs.id, payload.jobId));
  },
});

export const csvImportWorkflow = task({
  id: "csv-import-workflow",
  run: async (
    payload: {
      jobId: string;
      organizationId: string;
      filePath: string;
      fileName: string;
    },
    { ctx }
  ) => {
    const db = getDb();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
      await db
        .update(importJobs)
        .set({ status: "parsing", progress_percentage: 10 })
        .where(eq(importJobs.id, payload.jobId));

      const { data: fileData, error: downloadError } = await supabase.storage
        .from("imports")
        .download(payload.filePath);

      if (downloadError || !fileData) {
        throw new Error(downloadError?.message ?? "Download file failed");
      }

      const text = await fileData.text();
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0 && parsed.errors.some((e) => e.type === "Quotes")) {
        // Retry with different encoding
        const buf = await fileData.arrayBuffer();
        const decoder = new TextDecoder("utf-8");
        const decoded = decoder.decode(buf);
        const retry = Papa.parse<Record<string, string>>(decoded, {
          header: true,
          skipEmptyLines: true,
        });
        if (retry.data.length > 0) {
          parsed.data = retry.data;
          parsed.errors = retry.errors;
        }
      }

      const headers = parsed.meta.fields ?? [];
      const columnMap = autoMapColumns(headers);
      if (!columnMap.first_name && !columnMap.last_name) {
        const firstRow = parsed.data[0];
        const keys = firstRow ? Object.keys(firstRow) : [];
        const firstIdx = keys.findIndex((k) =>
          /nome|name|first/i.test(normalizeHeader(k))
        );
        const lastIdx = keys.findIndex((k) =>
          /cognome|last|surname/i.test(normalizeHeader(k))
        );
        if (firstIdx >= 0) columnMap.first_name = firstIdx;
        if (lastIdx >= 0) columnMap.last_name = lastIdx;
      }

      const roleList = await db
        .select({ id: roles.id, name: roles.name })
        .from(roles)
        .where(eq(roles.organization_id, payload.organizationId));
      const roleNameToId: Record<string, string> = {};
      for (const r of roleList) {
        roleNameToId[r.name.toLowerCase()] = r.id;
      }

      const existingEmps = await db
        .select({ email: employees.email, phone: employees.phone })
        .from(employees)
        .where(eq(employees.organization_id, payload.organizationId));
      const existingEmails = new Set(
        existingEmps.map((e) => (e.email || "").toLowerCase()).filter(Boolean)
      );
      const existingPhones = new Set(
        existingEmps.map((e) => (e.phone || "").replace(/\D/g, "")).filter(Boolean)
      );

      const validRows: Array<Record<string, string> & { _row?: number }> = [];
      const errors: Array<{ row: number; reason: string }> = [];
      let skipped = 0;

      for (let i = 0; i < parsed.data.length; i++) {
        const raw = parsed.data[i];
        const rowNum = i + 2;
        const row: Record<string, string> = {};
        for (const [target, idx] of Object.entries(columnMap)) {
          const val = headers[idx] ? raw[headers[idx]] : undefined;
          row[target] = val != null ? String(val).trim() : "";
        }
        (row as any)._row = rowNum;

        const firstName = row.first_name || "";
        const lastName = row.last_name || "";
        if (!firstName && !lastName) {
          errors.push({ row: rowNum, reason: "Nome o cognome mancante" });
          continue;
        }
        const email = (row.email || "").trim();
        const phone = (row.phone || "").trim();
        if (email && !validateEmail(email)) {
          errors.push({ row: rowNum, reason: "Email non valida" });
          continue;
        }
        if (phone && !validatePhone(phone)) {
          errors.push({ row: rowNum, reason: "Telefono non valido" });
          continue;
        }
        const emailNorm = email.toLowerCase();
        const phoneNorm = phone.replace(/\D/g, "");
        if (email && existingEmails.has(emailNorm)) {
          skipped++;
          continue;
        }
        if (phone && existingPhones.has(phoneNorm)) {
          skipped++;
          continue;
        }
        if (email) existingEmails.add(emailNorm);
        if (phone) existingPhones.add(phoneNorm);
        validRows.push(row as any);
      }

      const invalidPct = (errors.length + skipped) / Math.max(1, parsed.data.length);
      if (invalidPct > 0.5) {
        await db
          .update(importJobs)
          .set({
            status: "failed",
            error_message: `Troppi errori (${Math.round(invalidPct * 100)}% righe invalide). Verifica il file.`,
            completed_at: new Date(),
          })
          .where(eq(importJobs.id, payload.jobId));
        return;
      }

      await db
        .update(importJobs)
        .set({ status: "creating", progress_percentage: 40, total_rows: parsed.data.length })
        .where(eq(importJobs.id, payload.jobId));

      const createResult = await createEmployeeRecords.triggerAndWait({
        jobId: payload.jobId,
        organizationId: payload.organizationId,
        validRows,
        roleNameToId,
      });

      if (!createResult.ok) {
        const err = createResult.error as { message?: string } | undefined;
        throw new Error(err?.message ?? "Creazione record fallita");
      }

      const { imported, errors: createErrors } = createResult.output;

      const allErrors = [...errors, ...createErrors];
      const finalizeResult = await finalizeImport.triggerAndWait({
        jobId: payload.jobId,
        imported,
        skipped,
        errors: allErrors,
      });

      if (!finalizeResult.ok) {
        const err = finalizeResult.error as { message?: string } | undefined;
        throw new Error(err?.message ?? "Finalize failed");
      }

      await supabase.storage.from("imports").remove([payload.filePath]);
    } catch (e) {
      logger.error("CSV import failed", { error: e, jobId: payload.jobId });
      await db
        .update(importJobs)
        .set({
          status: "failed",
          error_message: e instanceof Error ? e.message : "Errore importazione",
          completed_at: new Date(),
        })
        .where(eq(importJobs.id, payload.jobId));
    }
  },
});
