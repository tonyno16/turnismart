"use server";

import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  employees,
  employeeRoles,
  employeeAvailability,
  employeeAvailabilityExceptions,
  employeeIncompatibilities,
  employeeTimeOff,
  roles,
  locations,
  contractTypes,
  availabilityStatuses,
  timeOffTypes,
  type ContractType,
  type AvailabilityStatus,
  type TimeOffType,
} from "@/drizzle/schema";
import { requireOrganization, requireEmployee } from "@/lib/auth";
import { checkQuota } from "@/lib/usage";

export async function createEmployee(formData: FormData) {
  const { organization } = await requireOrganization();
  const quota = await checkQuota(organization.id, "employees");
  if (!quota.allowed) throw new Error(quota.message ?? "Limite dipendenti raggiunto");
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  if (!firstName || !lastName) throw new Error("Nome e cognome obbligatori");

  const hourlyRateRaw = (formData.get("hourlyRate") as string)?.trim();
  const hourlyRate = hourlyRateRaw && !isNaN(parseFloat(hourlyRateRaw))
    ? parseFloat(hourlyRateRaw)
    : 0;

  const [emp] = await db
    .insert(employees)
    .values({
      organization_id: organization.id,
      first_name: firstName,
      last_name: lastName,
      email: (formData.get("email") as string)?.trim() || null,
      phone: (formData.get("phone") as string)?.trim() || null,
      weekly_hours: parseInt((formData.get("weeklyHours") as string) || "40", 10),
      contract_type: (() => {
        const v = (formData.get("contractType") as string) || "full_time";
        return (contractTypes as readonly string[]).includes(v)
          ? (v as ContractType)
          : "full_time";
      })(),
      hourly_rate: String(hourlyRate),
    })
    .returning();
  const roleIds = [
    formData.get("roleId1") as string,
    formData.get("roleId2") as string,
    formData.get("roleId3") as string,
  ].filter(Boolean) as string[];
  if (emp && roleIds.length > 0) {
    for (let i = 0; i < Math.min(roleIds.length, 3); i++) {
      await db.insert(employeeRoles).values({
        employee_id: emp.id,
        role_id: roleIds[i],
        priority: i + 1,
      });
    }
  }
  revalidatePath("/employees");
  return emp;
}

export async function updateEmployee(employeeId: string, formData: FormData) {
  const { organization } = await requireOrganization();
  const [emp] = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.id, employeeId),
        eq(employees.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!emp) throw new Error("Dipendente non trovato");

  const hourlyRateRaw = (formData.get("hourlyRate") as string)?.trim();
  const hourlyRate = hourlyRateRaw ? parseFloat(hourlyRateRaw) : null;

  await db
    .update(employees)
    .set({
      first_name: (formData.get("firstName") as string)?.trim() ?? emp.first_name,
      last_name: (formData.get("lastName") as string)?.trim() ?? emp.last_name,
      email: (formData.get("email") as string)?.trim() || null,
      phone: (formData.get("phone") as string)?.trim() || null,
      weekly_hours: parseInt((formData.get("weeklyHours") as string) || String(emp.weekly_hours), 10),
      contract_type: (() => {
        const v = (formData.get("contractType") as string) || emp.contract_type;
        return (contractTypes as readonly string[]).includes(v)
          ? (v as ContractType)
          : emp.contract_type;
      })(),
      preferred_location_id: (formData.get("preferredLocationId") as string) || null,
      hourly_rate: hourlyRate !== null && !isNaN(hourlyRate) ? String(hourlyRate) : emp.hourly_rate,
      notes: (formData.get("notes") as string)?.trim() || null,
      updated_at: new Date(),
    })
    .where(eq(employees.id, employeeId));
  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
}

export async function deleteEmployee(employeeId: string) {
  const { organization } = await requireOrganization();
  const [emp] = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.id, employeeId),
        eq(employees.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!emp) throw new Error("Dipendente non trovato");

  await db.delete(employees).where(eq(employees.id, employeeId));
  revalidatePath("/employees");
  revalidatePath("/dashboard");
  revalidatePath("/schedule");
  return { ok: true };
}

export async function toggleEmployeeActive(employeeId: string) {
  const { organization } = await requireOrganization();
  const [emp] = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.id, employeeId),
        eq(employees.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!emp) throw new Error("Dipendente non trovato");
  await db
    .update(employees)
    .set({
      is_active: !emp.is_active,
      updated_at: new Date(),
    })
    .where(eq(employees.id, employeeId));
  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
}

/** roleIds: ordered array, max 3. hourlyRates: { roleId: "12.50" } - paga per mansione, null = usa base. */
export async function updateEmployeeRoles(
  employeeId: string,
  roleIds: string[],
  hourlyRates?: Record<string, string>
) {
  const { organization } = await requireOrganization();
  const [emp] = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.id, employeeId),
        eq(employees.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!emp) throw new Error("Dipendente non trovato");

  const limited = roleIds.filter(Boolean).slice(0, 3);
  await db.delete(employeeRoles).where(eq(employeeRoles.employee_id, employeeId));
  for (let i = 0; i < limited.length; i++) {
    const roleId = limited[i];
    const rateStr = hourlyRates?.[roleId]?.trim();
    const rate = rateStr && !isNaN(parseFloat(rateStr)) && parseFloat(rateStr) >= 0
      ? String(parseFloat(rateStr))
      : null;
    await db.insert(employeeRoles).values({
      employee_id: employeeId,
      role_id: roleId,
      priority: i + 1,
      hourly_rate: rate,
    });
  }
  revalidatePath(`/employees/${employeeId}`);
}

export async function updateAvailability(
  employeeId: string,
  updates: Array<{
    dayOfWeek: number;
    shiftPeriod: string;
    status: string;
  }>
) {
  const { organization } = await requireOrganization();
  const [emp] = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.id, employeeId),
        eq(employees.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!emp) throw new Error("Dipendente non trovato");

  const SHIFT_PERIODS = ["morning", "evening"] as const;
  for (const u of updates) {
    const shiftPeriod = SHIFT_PERIODS.includes(
      u.shiftPeriod as (typeof SHIFT_PERIODS)[number]
    )
      ? (u.shiftPeriod as (typeof SHIFT_PERIODS)[number])
      : "morning";
    const status: AvailabilityStatus = (availabilityStatuses as readonly string[]).includes(
      u.status
    )
      ? (u.status as AvailabilityStatus)
      : "available";
    await db
      .insert(employeeAvailability)
      .values({
        employee_id: employeeId,
        day_of_week: u.dayOfWeek,
        shift_period: shiftPeriod,
        status,
      })
      .onConflictDoUpdate({
        target: [
          employeeAvailability.employee_id,
          employeeAvailability.day_of_week,
          employeeAvailability.shift_period,
        ],
        set: {
          status,
          updated_at: new Date(),
        },
      });
  }
  revalidatePath(`/employees/${employeeId}`);
}

export async function createIncompatibility(
  employeeAId: string,
  employeeBId: string,
  reason?: string
) {
  const { organization } = await requireOrganization();
  const [a, b] = [employeeAId, employeeBId].sort();
  if (a === b) throw new Error("Seleziona due dipendenti diversi");
  await db.insert(employeeIncompatibilities).values({
    organization_id: organization.id,
    employee_a_id: a,
    employee_b_id: b,
    reason: reason?.trim() || null,
  });
  revalidatePath(`/employees/${employeeAId}`);
  revalidatePath(`/employees/${employeeBId}`);
}

export async function updateEmployeePeriodPreference(
  employeeId: string,
  periodPreference: "morning" | "evening" | null
) {
  const { organization } = await requireOrganization();
  const [emp] = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.id, employeeId),
        eq(employees.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!emp) throw new Error("Dipendente non trovato");

  await db
    .update(employees)
    .set({
      period_preference: periodPreference,
      updated_at: new Date(),
    })
    .where(eq(employees.id, employeeId));
  revalidatePath(`/employees/${employeeId}`);
}

export async function addAvailabilityException(
  employeeId: string,
  startDate: string,
  endDate: string,
  dayOfWeek: number
) {
  const { organization } = await requireOrganization();
  const [emp] = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.id, employeeId),
        eq(employees.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!emp) throw new Error("Dipendente non trovato");
  if (dayOfWeek < 0 || dayOfWeek > 6) throw new Error("Giorno non valido");
  if (startDate > endDate) throw new Error("Data inizio deve essere ≤ data fine");

  await db.insert(employeeAvailabilityExceptions).values({
    employee_id: employeeId,
    start_date: startDate,
    end_date: endDate,
    day_of_week: dayOfWeek,
  });
  revalidatePath(`/employees/${employeeId}`);
}

export async function removeAvailabilityException(exceptionId: string) {
  const { organization } = await requireOrganization();
  const [ex] = await db
    .select({
      id: employeeAvailabilityExceptions.id,
      employee_id: employeeAvailabilityExceptions.employee_id,
      org_id: employees.organization_id,
    })
    .from(employeeAvailabilityExceptions)
    .innerJoin(employees, eq(employeeAvailabilityExceptions.employee_id, employees.id))
    .where(eq(employeeAvailabilityExceptions.id, exceptionId))
    .limit(1);
  if (!ex || ex.org_id !== organization.id) throw new Error("Eccezione non trovata");

  await db
    .delete(employeeAvailabilityExceptions)
    .where(eq(employeeAvailabilityExceptions.id, exceptionId));
  revalidatePath(`/employees/${ex.employee_id}`);
}

/** Employee self-service: request time off (vacation, leave, sick) */
export async function createMyTimeOff(formData: FormData) {
  const { employee } = await requireEmployee();
  return createTimeOff(employee.id, formData);
}

/** Employee self-service: update own availability (role must be employee with linked record) */
export async function updateMyAvailability(
  updates: Array<{
    dayOfWeek: number;
    shiftPeriod: string;
    status: string;
  }>
) {
  const { employee } = await requireEmployee();
  return updateAvailability(employee.id, updates);
}

export async function removeIncompatibility(incompatibilityId: string) {
  await requireOrganization();
  await db
    .delete(employeeIncompatibilities)
    .where(eq(employeeIncompatibilities.id, incompatibilityId));
  revalidatePath("/employees");
}

export async function createTimeOff(
  employeeId: string,
  formData: FormData
) {
  const { organization } = await requireOrganization();
  const [emp] = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.id, employeeId),
        eq(employees.organization_id, organization.id)
      )
    )
    .limit(1);
  if (!emp) throw new Error("Dipendente non trovato");

  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  if (!startDate || !endDate) throw new Error("Date obbligatorie");

  const timeOffType: TimeOffType = (timeOffTypes as readonly string[]).includes(
    (formData.get("type") as string) || ""
  )
    ? ((formData.get("type") as string) as TimeOffType)
    : "vacation";

  await db.insert(employeeTimeOff).values({
    employee_id: employeeId,
    type: timeOffType,
    start_date: startDate,
    end_date: endDate,
    notes: (formData.get("notes") as string)?.trim() || null,
  });
  revalidatePath(`/employees/${employeeId}`);
}

export async function approveTimeOff(timeOffId: string) {
  const { user } = await requireOrganization();
  await db
    .update(employeeTimeOff)
    .set({
      status: "approved",
      approved_by_user_id: user.id,
    })
    .where(eq(employeeTimeOff.id, timeOffId));
  revalidatePath("/employees");
  revalidatePath("/requests");
}

export async function rejectTimeOff(timeOffId: string) {
  await requireOrganization();
  await db
    .update(employeeTimeOff)
    .set({ status: "rejected" })
    .where(eq(employeeTimeOff.id, timeOffId));
  revalidatePath("/employees");
  revalidatePath("/requests");
}

/** Bulk deactivate selected employees (is_active = false) */
export async function bulkDeactivate(
  employeeIds: string[]
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const { organization } = await requireOrganization();
  if (!employeeIds.length) return { ok: false, error: "Nessun dipendente selezionato" };

  const valid = await db
    .select({ id: employees.id })
    .from(employees)
    .where(
      and(
        eq(employees.organization_id, organization.id),
        inArray(employees.id, employeeIds)
      )
    );
  const ids = valid.map((r) => r.id);
  if (ids.length === 0) return { ok: false, error: "Nessun dipendente valido trovato" };

  await db
    .update(employees)
    .set({ is_active: false, updated_at: new Date() })
    .where(inArray(employees.id, ids));
  revalidatePath("/employees");
  revalidatePath("/schedule");
  return { ok: true, count: ids.length };
}

/** Bulk add role to selected employees. Skips if already has role or has 3 roles. */
export async function bulkAddRole(
  employeeIds: string[],
  roleId: string
): Promise<{ ok: true; updated: number; skipped: number } | { ok: false; error: string }> {
  const { organization } = await requireOrganization();
  if (!employeeIds.length || !roleId) return { ok: false, error: "Dati mancanti" };

  const roleValid = await db
    .select({ id: roles.id })
    .from(roles)
    .where(
      and(
        eq(roles.organization_id, organization.id),
        eq(roles.id, roleId)
      )
    )
    .limit(1);
  if (!roleValid.length) return { ok: false, error: "Ruolo non trovato" };

  const validEmps = await db
    .select({ id: employees.id })
    .from(employees)
    .where(
      and(
        eq(employees.organization_id, organization.id),
        inArray(employees.id, employeeIds)
      )
    );
  const existingRoles = await db
    .select({
      employee_id: employeeRoles.employee_id,
      role_id: employeeRoles.role_id,
      priority: employeeRoles.priority,
    })
    .from(employeeRoles)
    .where(inArray(employeeRoles.employee_id, validEmps.map((e) => e.id)));

  const byEmp = new Map<string, { roleIds: Set<string>; maxPriority: number }>();
  for (const r of existingRoles) {
    if (!byEmp.has(r.employee_id)) {
      byEmp.set(r.employee_id, { roleIds: new Set(), maxPriority: 0 });
    }
    const entry = byEmp.get(r.employee_id)!;
    entry.roleIds.add(r.role_id);
    entry.maxPriority = Math.max(entry.maxPriority, r.priority);
  }

  let updated = 0;
  let skipped = 0;
  for (const emp of validEmps) {
    const entry = byEmp.get(emp.id) ?? { roleIds: new Set(), maxPriority: 0 };
    if (entry.roleIds.has(roleId)) {
      skipped++;
      continue;
    }
    if (entry.roleIds.size >= 3) {
      skipped++;
      continue;
    }
    await db.insert(employeeRoles).values({
      employee_id: emp.id,
      role_id: roleId,
      priority: entry.maxPriority + 1,
    }).onConflictDoNothing({ target: [employeeRoles.employee_id, employeeRoles.role_id] });
    updated++;
  }
  revalidatePath("/employees");
  revalidatePath("/schedule");
  return { ok: true, updated, skipped };
}

/** Bulk remove role from selected employees */
export async function bulkRemoveRole(
  employeeIds: string[],
  roleId: string
): Promise<{ ok: true; removed: number } | { ok: false; error: string }> {
  const { organization } = await requireOrganization();
  if (!employeeIds.length || !roleId) return { ok: false, error: "Dati mancanti" };

  const validEmps = await db
    .select({ id: employees.id })
    .from(employees)
    .where(
      and(
        eq(employees.organization_id, organization.id),
        inArray(employees.id, employeeIds)
      )
    );
  const ids = validEmps.map((e) => e.id);

  const deleted = await db
    .delete(employeeRoles)
    .where(
      and(
        inArray(employeeRoles.employee_id, ids),
        eq(employeeRoles.role_id, roleId)
      )
    )
    .returning({ id: employeeRoles.id });
  const removed = deleted.length;
  revalidatePath("/employees");
  revalidatePath("/schedule");
  return { ok: true, removed };
}

/** Export employees as CSV. If employeeIds provided, filter to those only. */
export async function exportEmployeesCsv(
  employeeIds?: string[]
): Promise<{ ok: true; csv: string; filename: string } | { ok: false; error: string }> {
  const { organization } = await requireOrganization();

  const emps = await db
    .select()
    .from(employees)
    .where(
      employeeIds?.length
        ? and(
            eq(employees.organization_id, organization.id),
            inArray(employees.id, employeeIds)
          )
        : eq(employees.organization_id, organization.id)
    )
    .orderBy(employees.last_name, employees.first_name);

  if (emps.length === 0) return { ok: false, error: "Nessun dipendente da esportare" };

  const empIds = emps.map((e) => e.id);
  const empRolesRows = await db
    .select({
      employee_id: employeeRoles.employee_id,
      role_name: roles.name,
      priority: employeeRoles.priority,
    })
    .from(employeeRoles)
    .innerJoin(roles, eq(employeeRoles.role_id, roles.id))
    .where(inArray(employeeRoles.employee_id, empIds))
    .orderBy(employeeRoles.employee_id, employeeRoles.priority);

  const rolesByEmp = new Map<string, string[]>();
  for (const r of empRolesRows) {
    if (!rolesByEmp.has(r.employee_id)) rolesByEmp.set(r.employee_id, []);
    rolesByEmp.get(r.employee_id)!.push(r.role_name);
  }

  const locIds = [...new Set(emps.map((e) => e.preferred_location_id).filter(Boolean))] as string[];
  const locMap = new Map<string, string>();
  if (locIds.length > 0) {
    const locRows = await db
      .select({ id: locations.id, name: locations.name })
      .from(locations)
      .where(inArray(locations.id, locIds));
    for (const l of locRows) locMap.set(l.id, l.name);
  }

  const escapeCsv = (v: string | null | undefined): string => {
    if (v == null || v === "") return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const header = "Nome,Cognome,Email,Telefono,Mansioni,Contratto,Ore settimanali,Sede preferita";
  const rows = emps.map((e) => {
    const roleNames = (rolesByEmp.get(e.id) ?? []).join("; ");
    const locName = e.preferred_location_id ? locMap.get(e.preferred_location_id) ?? "" : "";
    const contract = e.contract_type === "full_time" ? "Full time" : e.contract_type === "part_time" ? "Part time" : e.contract_type === "on_call" ? "A chiamata" : "Stagionale";
    return [
      escapeCsv(e.first_name),
      escapeCsv(e.last_name),
      escapeCsv(e.email),
      escapeCsv(e.phone),
      escapeCsv(roleNames || undefined),
      escapeCsv(contract),
      String(e.weekly_hours),
      escapeCsv(locName),
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");
  const filename = `dipendenti_${new Date().toISOString().slice(0, 10)}.csv`;
  return { ok: true, csv, filename };
}
