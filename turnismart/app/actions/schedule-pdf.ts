"use server";

import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { schedules, shifts, locations, employees, roles } from "@/drizzle/schema";
import { requireOrganization } from "@/lib/auth";

export async function exportSchedulePdf(
  scheduleId: string,
  mode: "by_location" | "by_employee"
): Promise<{ ok: true; pdfBase64: string; filename: string } | { ok: false; error: string }> {
  const { organization } = await requireOrganization();

  const [sched] = await db
    .select()
    .from(schedules)
    .where(
      and(
        eq(schedules.id, scheduleId),
        eq(schedules.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!sched) return { ok: false, error: "Programmazione non trovata" };

  const shiftsRows = await db
    .select({
      id: shifts.id,
      location_id: shifts.location_id,
      location_name: locations.name,
      employee_id: shifts.employee_id,
      role_id: shifts.role_id,
      role_name: roles.name,
      date: shifts.date,
      start_time: shifts.start_time,
      end_time: shifts.end_time,
      status: shifts.status,
    })
    .from(shifts)
    .innerJoin(locations, eq(shifts.location_id, locations.id))
    .innerJoin(employees, eq(shifts.employee_id, employees.id))
    .innerJoin(roles, eq(shifts.role_id, roles.id))
    .where(
      and(
        eq(shifts.schedule_id, scheduleId),
        eq(shifts.status, "active")
      )
    )
    .orderBy(shifts.date, shifts.start_time);

  const empRows = await db
    .select({
      id: employees.id,
      first_name: employees.first_name,
      last_name: employees.last_name,
    })
    .from(employees)
    .where(eq(employees.organization_id, organization.id));

  const empMap = new Map(empRows.map((e) => [e.id, `${e.first_name} ${e.last_name}`]));
  const shiftsWithNames = shiftsRows.map((r) => ({
    ...r,
    employee_name: empMap.get(r.employee_id) ?? "",
  }));

  const locIds = [...new Set(shiftsWithNames.map((s) => s.location_id))];
  const locsForPdf =
    locIds.length > 0
      ? await db
          .select({ id: locations.id, name: locations.name })
          .from(locations)
          .where(
            and(
              eq(locations.organization_id, organization.id),
              inArray(locations.id, locIds)
            )
          )
      : [];

  const { renderToBuffer } = await import("@react-pdf/renderer");
  let buf: Buffer;

  if (mode === "by_location") {
    const { SchedulePDFByLocation } = await import("@/lib/schedule-pdf-document");
    buf = Buffer.from(
      await renderToBuffer(
        SchedulePDFByLocation({
          weekStart: sched.week_start_date,
          shifts: shiftsWithNames,
          locations: locsForPdf,
        }) as React.ReactElement
      )
    );
  } else {
    const { SchedulePDFByEmployee } = await import("@/lib/schedule-pdf-document");
    const empsWithShifts = empRows.filter((e) =>
      shiftsWithNames.some((s) => s.employee_id === e.id)
    );
    buf = Buffer.from(
      await renderToBuffer(
        SchedulePDFByEmployee({
          weekStart: sched.week_start_date,
          shifts: shiftsWithNames,
          employees: empsWithShifts,
        }) as React.ReactElement
      )
    );
  }

  const filename = `orario_${sched.week_start_date}_${mode === "by_location" ? "sede" : "dipendenti"}.pdf`;
  return {
    ok: true,
    pdfBase64: buf.toString("base64"),
    filename,
  };
}
