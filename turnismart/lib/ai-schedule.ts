import { eq, and, isNull, gte, lte } from "drizzle-orm";
import { addDays, format, parseISO } from "date-fns";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { dailyTableExists } from "@/lib/daily-table-check";
import {
  locations,
  staffingRequirements,
  dailyStaffingOverrides,
  employees,
  employeeRoles,
  employeeAvailability,
  employeeAvailabilityExceptions,
  employeeIncompatibilities,
  employeeTimeOff,
  roles,
  shifts,
  schedules,
} from "@/drizzle/schema";
import {
  getPeriodTimesForOrganization,
  getRoleShiftTimesOverrides,
  getLocationRoleShiftTimesOverrides,
  getPeriodTimesForRole,
  getStaffingCoverage,
} from "./schedules";
import { validateShiftAssignment } from "./schedule-validation";
import { shiftMinutesInWeek } from "./schedule-utils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type SchedulingConstraint = {
  locations: Array<{
    id: string;
    name: string;
    requirements: Array<{
      dayOfWeek: number;
      period: string;
      roleId: string;
      roleName: string;
      required: number;
    }>;
  }>;
  employees: Array<{
    id: string;
    name: string;
    roleIds: string[];
    weeklyHours: number;
    maxHours: number;
    periodPreference?: "morning" | "evening" | null;
    availability: Array<{ dayOfWeek: number; period: string; status: string }>;
    incompatibleWith: string[];
    timeOffDates: string[];
    exceptionDates: string[];
  }>;
};

export async function collectSchedulingConstraints(
  organizationId: string,
  weekStart: string,
  locationIds?: string[]
): Promise<SchedulingConstraint> {
  const locs = await db
    .select()
    .from(locations)
    .where(eq(locations.organization_id, organizationId));

  const filteredLocs =
    locationIds && locationIds.length > 0
      ? locs.filter((l) => locationIds.includes(l.id))
      : locs;

  const locIds = new Set(filteredLocs.map((l) => l.id));

  const [templateStaffing, overrideStaffing] = await Promise.all([
    db
      .select({
        location_id: staffingRequirements.location_id,
        day_of_week: staffingRequirements.day_of_week,
        shift_period: staffingRequirements.shift_period,
        role_id: staffingRequirements.role_id,
        role_name: roles.name,
        required_count: staffingRequirements.required_count,
      })
      .from(staffingRequirements)
      .innerJoin(roles, eq(staffingRequirements.role_id, roles.id))
      .innerJoin(locations, eq(staffingRequirements.location_id, locations.id))
      .where(
        and(
          eq(locations.organization_id, organizationId),
          isNull(staffingRequirements.week_start_date)
        )
      ),
    db
      .select({
        location_id: staffingRequirements.location_id,
        day_of_week: staffingRequirements.day_of_week,
        shift_period: staffingRequirements.shift_period,
        role_id: staffingRequirements.role_id,
        role_name: roles.name,
        required_count: staffingRequirements.required_count,
      })
      .from(staffingRequirements)
      .innerJoin(roles, eq(staffingRequirements.role_id, roles.id))
      .innerJoin(locations, eq(staffingRequirements.location_id, locations.id))
      .where(
        and(
          eq(locations.organization_id, organizationId),
          eq(staffingRequirements.week_start_date, weekStart)
        )
      ),
  ]);

  const overrideKey = (r: { location_id: string; role_id: string; day_of_week: number; shift_period: string }) =>
    `${r.location_id}_${r.role_id}_${r.day_of_week}_${r.shift_period}`;
  const weeklyOverrideMap = new Map(overrideStaffing.map((r) => [overrideKey(r), r]));
  const templateKeys = new Set(templateStaffing.map((t) => overrideKey(t)));
  const mergedFromTemplate =
    templateStaffing.length > 0
      ? templateStaffing.map((t) => weeklyOverrideMap.get(overrideKey(t)) ?? t)
      : [];
  const overrideOnly = overrideStaffing.filter((o) => !templateKeys.has(overrideKey(o)));
  const allStaffing = [...mergedFromTemplate, ...overrideOnly];

  const weekStartDate = parseISO(weekStart);
  const weekDates: string[] = Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStartDate, i), "yyyy-MM-dd")
  );
  const weekEndDate = weekDates[6];
  const dailyOverrideMap = new Map<string, number>();
  if (await dailyTableExists()) {
    const dailyOverrides = await db
      .select({
        location_id: dailyStaffingOverrides.location_id,
        role_id: dailyStaffingOverrides.role_id,
        date: dailyStaffingOverrides.date,
        shift_period: dailyStaffingOverrides.shift_period,
        required_count: dailyStaffingOverrides.required_count,
      })
      .from(dailyStaffingOverrides)
      .innerJoin(locations, eq(dailyStaffingOverrides.location_id, locations.id))
      .where(
        and(
          eq(locations.organization_id, organizationId),
          gte(dailyStaffingOverrides.date, weekStart),
          lte(dailyStaffingOverrides.date, weekEndDate)
        )
      );
    for (const o of dailyOverrides) {
      const dayIdx = weekDates.indexOf(o.date);
      if (dayIdx >= 0) {
        dailyOverrideMap.set(
          `${o.location_id}_${o.role_id}_${dayIdx}_${o.shift_period}`,
          o.required_count
        );
      }
    }
  }

  const staffingForLocs = allStaffing
    .filter((s) => locIds.has(s.location_id))
    .map((s) => {
      const key = `${s.location_id}_${s.role_id}_${s.day_of_week}_${s.shift_period}`;
      const override = dailyOverrideMap.get(key);
      return override !== undefined ? { ...s, required_count: override } : s;
    });

  const emps = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.organization_id, organizationId),
        eq(employees.is_active, true))
    );

  const empRolesRows = await db
    .select({
      employee_id: employeeRoles.employee_id,
      role_id: roles.id,
      priority: employeeRoles.priority,
    })
    .from(employeeRoles)
    .innerJoin(roles, eq(employeeRoles.role_id, roles.id))
    .where(eq(roles.organization_id, organizationId));

  const avail = await db.select().from(employeeAvailability);
  const exceptions = await db.select().from(employeeAvailabilityExceptions);
  const inc = await db.select().from(employeeIncompatibilities);
  const to = await db
    .select()
    .from(employeeTimeOff)
    .where(eq(employeeTimeOff.status, "approved"));

  const locReqs = filteredLocs.map((loc) => ({
    id: loc.id,
    name: loc.name,
    requirements: staffingForLocs
      .filter((s) => s.location_id === loc.id)
      .map((s) => ({
        dayOfWeek: s.day_of_week,
        period: s.shift_period,
        roleId: s.role_id,
        roleName: s.role_name,
        required: s.required_count,
      })),
  }));

  const empData = emps.map((e) => {
    const ers = empRolesRows
      .filter((er) => er.employee_id === e.id)
      .sort((a, b) => a.priority - b.priority);
    const av = avail.filter((a) => a.employee_id === e.id);
    const incPairs = inc.filter(
      (i) => i.employee_a_id === e.id || i.employee_b_id === e.id
    );
    const otherIds = incPairs.map((p) =>
      p.employee_a_id === e.id ? p.employee_b_id : p.employee_a_id
    );
    const toDates = to
      .filter((t) => t.employee_id === e.id)
      .flatMap((t) => {
        const start = parseISO(t.start_date);
        const end = parseISO(t.end_date);
        const dates: string[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(format(d, "yyyy-MM-dd"));
        }
        return dates;
      });

    const weekEnd = format(addDays(parseISO(weekStart), 6), "yyyy-MM-dd");
    const exceptionDates = exceptions
      .filter((ex) => ex.employee_id === e.id && ex.start_date <= weekEnd && ex.end_date >= weekStart)
      .flatMap((ex) => {
        const start = parseISO(ex.start_date);
        const end = parseISO(ex.end_date);
        const dates: string[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dow = (d.getDay() + 6) % 7;
          if (dow === ex.day_of_week) {
            dates.push(format(d, "yyyy-MM-dd"));
          }
        }
        return dates;
      });

    return {
      id: e.id,
      name: `${e.first_name} ${e.last_name}`,
      roleIds: ers.map((r) => r.role_id),
      weeklyHours: e.weekly_hours,
      maxHours: e.max_weekly_hours,
      periodPreference: e.period_preference ?? null,
      availability: av.map((a) => ({
        dayOfWeek: a.day_of_week,
        period: a.shift_period,
        status: a.status,
      })),
      incompatibleWith: otherIds,
      timeOffDates: toDates,
      exceptionDates,
    };
  });

  return {
    locations: locReqs,
    employees: empData,
  };
}

/** Converte turni esistenti nel formato fixed per OR-Tools (fill_gaps). */
export function existingShiftsToFixed(
  existing: Array<{ employee_id: string; location_id: string; role_id: string; date: string; start_time: string }>,
  weekStart: string
): GeneratedShift[] {
  const weekStartDate = parseISO(weekStart);
  const parseTimeMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  return existing.map((s) => {
    const d = parseISO(s.date);
    const dayOfWeek = Math.floor((d.getTime() - weekStartDate.getTime()) / (24 * 60 * 60 * 1000));
    const startM = parseTimeMinutes(s.start_time);
    const period = startM < 14 * 60 ? "morning" : "evening";
    return {
      employeeId: s.employee_id,
      locationId: s.location_id,
      roleId: s.role_id,
      dayOfWeek,
      period,
    };
  });
}

export type GeneratedShift = {
  employeeId: string;
  locationId: string;
  roleId: string;
  dayOfWeek: number;
  period: string;
};

export async function generateScheduleWithAI(
  organizationId: string,
  constraints: SchedulingConstraint,
  weekStart: string
): Promise<GeneratedShift[]> {
  const orgPeriodTimes = await getPeriodTimesForOrganization(organizationId);
  const periodTimes = Object.entries(orgPeriodTimes).map(([p, t]) => ({
    period: p,
    start: t.start,
    end: t.end,
  }));

  const prompt = `Sei un esperto di scheduling. Genera un orario settimanale ottimale.

OBIETTIVO PRINCIPALE: Copri OGNI slot richiesto. Ogni cella con required>0 deve avere esattamente required assegnazioni. Non lasciare celle vuote (0/1) se esiste un dipendente idoneo. La copertura totale ha priorità sul bilanciamento ore.

Settimana: ${weekStart} (lunedì = giorno 0, domenica = giorno 6).

LOCALI E FABBISOGNO:
${JSON.stringify(constraints.locations, null, 2)}

DIPENDENTI (con disponibilità, incompatibilità, assenze):
${JSON.stringify(constraints.employees, null, 2)}

PERIODI ORARI:
${JSON.stringify(periodTimes)}

REGOLE:
1. DISPONIBILITÀ: Se availability è [] (vuoto), il dipendente è SEMPRE disponibile. Se ha record: "available"/"preferred" = assegnabile. "avoid" = evita se possibile. "unavailable" = mai in quel giorno/periodo.
2. Rispetta timeOffDates e exceptionDates: non assegnare in quelle date
3. periodPreference: se presente, preferisci turni mattina/sera (puoi ignorare se necessario per coprire)
4. Non assegnare due dipendenti incompatibili (incompatibleWith) allo stesso turno
5. Ogni dipendente max maxHours ore/settimana
6. Riposo 11h tra turni consecutivi
7. Un dipendente deve avere il ruolo richiesto (roleIds deve contenere il roleId dello slot)
8. Per ogni slot: genera ESATTAMENTE required assegnazioni, mai di più. Non superare mai required per cella.

Rispondi SOLO con un array JSON di oggetti: [{"employeeId":"uuid","locationId":"uuid","roleId":"uuid","dayOfWeek":0-6,"period":"morning|evening"}]
Nessun altro testo.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Risposta AI vuota");

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  const jsonStr = jsonMatch ? jsonMatch[0] : content;
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Formato risposta AI non valido");
  }

  if (!Array.isArray(parsed)) throw new Error("Risposta deve essere un array");
  return parsed as GeneratedShift[];
}

export async function saveGeneratedShifts(
  organizationId: string,
  scheduleId: string,
  weekStart: string,
  shiftsToSave: GeneratedShift[]
): Promise<{ saved: number; skipped: number; errors: string[] }> {
  const weekStartDate = parseISO(weekStart);
  const [orgPeriodTimes, roleOverrides, locationRoleOverrides, coverage] = await Promise.all([
    getPeriodTimesForOrganization(organizationId),
    getRoleShiftTimesOverrides(organizationId),
    getLocationRoleShiftTimesOverrides(organizationId),
    getStaffingCoverage(organizationId, weekStart, scheduleId),
  ]);

  const coverageRequired = new Map(
    coverage.map((c) => [
      `${c.locationId}:${c.roleId}:${c.dayOfWeek}:${c.shiftPeriod}`,
      c.required,
    ])
  );
  const insertedPerSlot = new Map<string, number>();

  const errors: string[] = [];
  let saved = 0;
  let skipped = 0;

  for (const s of shiftsToSave) {
    const slotKey = `${s.locationId}:${s.roleId}:${s.dayOfWeek}:${s.period}`;
    const required = coverageRequired.get(slotKey) ?? 0;
    const alreadyInserted = insertedPerSlot.get(slotKey) ?? 0;
    const existingAssigned = coverage.find(
      (c) =>
        c.locationId === s.locationId &&
        c.roleId === s.roleId &&
        c.dayOfWeek === s.dayOfWeek &&
        c.shiftPeriod === s.period
    )?.assigned ?? 0;
    const totalForSlot = existingAssigned + alreadyInserted;
    if (required <= 0) {
      errors.push(`${s.employeeId} @ slot ${slotKey}: nessun fabbisogno`);
      skipped++;
      continue;
    }
    if (totalForSlot >= required) {
      errors.push(`${s.employeeId} @ slot ${slotKey}: già coperto (${totalForSlot}/${required})`);
      skipped++;
      continue;
    }

    const date = format(addDays(weekStartDate, s.dayOfWeek), "yyyy-MM-dd");
    const dayKey = `${s.locationId}:${s.roleId}:${s.period}:${s.dayOfWeek}`;
    const locKey = `${s.locationId}:${s.roleId}:${s.period}`;
    const roleDayKey = `${s.roleId}:${s.period}:${s.dayOfWeek}`;
    const roleKey = `${s.roleId}:${s.period}`;
    const times =
      locationRoleOverrides.get(dayKey) ??
      locationRoleOverrides.get(locKey) ??
      roleOverrides.get(roleDayKey) ??
      roleOverrides.get(roleKey) ??
      (orgPeriodTimes[s.period] ?? orgPeriodTimes.morning);

    const conflict = await validateShiftAssignment({
      employeeId: s.employeeId,
      organizationId,
      scheduleId,
      locationId: s.locationId,
      roleId: s.roleId,
      date,
      startTime: times.start,
      endTime: times.end,
      weekStart,
    });

    if (conflict) {
      errors.push(`${s.employeeId} @ ${date} ${s.period}: ${conflict.message}`);
      skipped++;
      continue;
    }

    try {
      await db.insert(shifts).values({
        schedule_id: scheduleId,
        organization_id: organizationId,
        location_id: s.locationId,
        employee_id: s.employeeId,
        role_id: s.roleId,
        date,
        start_time: times.start,
        end_time: times.end,
        break_minutes: 0,
        is_auto_generated: true,
        status: "active",
      });
      insertedPerSlot.set(slotKey, (insertedPerSlot.get(slotKey) ?? 0) + 1);
      saved++;
    } catch (e) {
      errors.push(
        `${s.employeeId}: ${e instanceof Error ? e.message : "Errore"}`
      );
      skipped++;
    }
  }

  return { saved, skipped, errors };
}

/** Riempie deterministicamente le celle scoperte (0/N) con dipendenti idonei.
 * Ordina i candidati per ore assegnate (asc) per favorire chi ha meno turni. */
export async function fillUncoveredSlots(
  organizationId: string,
  scheduleId: string,
  weekStart: string
): Promise<{ filled: number; errors: string[] }> {
  const weekStartDate = parseISO(weekStart);
  const [coverage, empRoles, activeEmps, currentShifts] = await Promise.all([
    getStaffingCoverage(organizationId, weekStart, scheduleId),
    db
      .select({ employee_id: employeeRoles.employee_id, role_id: employeeRoles.role_id })
      .from(employeeRoles)
      .innerJoin(roles, eq(employeeRoles.role_id, roles.id))
      .where(eq(roles.organization_id, organizationId)),
    db
      .select({ id: employees.id })
      .from(employees)
      .where(and(eq(employees.organization_id, organizationId), eq(employees.is_active, true))),
    db
      .select({
        employee_id: shifts.employee_id,
        date: shifts.date,
        start_time: shifts.start_time,
        end_time: shifts.end_time,
      })
      .from(shifts)
      .where(and(eq(shifts.schedule_id, scheduleId), eq(shifts.status, "active"))),
  ]);

  const activeIds = new Set(activeEmps.map((e) => e.id));
  const roleToEmployees = new Map<string, string[]>();
  for (const er of empRoles) {
    if (!activeIds.has(er.employee_id)) continue;
    const arr = roleToEmployees.get(er.role_id) ?? [];
    arr.push(er.employee_id);
    roleToEmployees.set(er.role_id, arr);
  }

  const empMinutes = new Map<string, number>();
  for (const s of currentShifts) {
    const mins = shiftMinutesInWeek(s.date, s.start_time, s.end_time, weekStart);
    empMinutes.set(s.employee_id, (empMinutes.get(s.employee_id) ?? 0) + mins);
  }

  const uncovered = coverage.filter((c) => c.assigned < c.required);
  const errors: string[] = [];
  let filled = 0;

  for (const slot of uncovered) {
    const need = slot.required - slot.assigned;
    const candidates = (roleToEmployees.get(slot.roleId) ?? []).slice();
    candidates.sort((a, b) => (empMinutes.get(a) ?? 0) - (empMinutes.get(b) ?? 0));

    const date = format(addDays(weekStartDate, slot.dayOfWeek), "yyyy-MM-dd");
    const times = await getPeriodTimesForRole(
      organizationId,
      slot.roleId,
      slot.shiftPeriod,
      slot.locationId,
      date
    );

    for (let i = 0; i < need; i++) {
      let assigned = false;
      for (const empId of candidates) {
        const conflict = await validateShiftAssignment({
          employeeId: empId,
          organizationId,
          scheduleId,
          locationId: slot.locationId,
          roleId: slot.roleId,
          date,
          startTime: times.start,
          endTime: times.end,
          weekStart,
        });
        if (conflict) continue;
        try {
          await db.insert(shifts).values({
            schedule_id: scheduleId,
            organization_id: organizationId,
            location_id: slot.locationId,
            employee_id: empId,
            role_id: slot.roleId,
            date,
            start_time: times.start,
            end_time: times.end,
            break_minutes: 0,
            is_auto_generated: true,
            status: "active",
          });
          const mins = shiftMinutesInWeek(date, times.start, times.end, weekStart);
          empMinutes.set(empId, (empMinutes.get(empId) ?? 0) + mins);
          filled++;
          assigned = true;
          break;
        } catch (e) {
          errors.push(`${slot.locationName}/${slot.roleName} ${date} ${slot.shiftPeriod}: ${e instanceof Error ? e.message : "Errore"}`);
        }
      }
      if (!assigned) {
        errors.push(`${slot.locationName}/${slot.roleName} ${date} ${slot.shiftPeriod}: nessun dipendente idoneo`);
      }
    }
  }

  return { filled, errors };
}
