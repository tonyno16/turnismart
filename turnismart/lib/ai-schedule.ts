import { eq, and } from "drizzle-orm";
import { addDays, format, parseISO } from "date-fns";
import OpenAI from "openai";
import { db } from "@/lib/db";
import {
  locations,
  staffingRequirements,
  employees,
  employeeRoles,
  employeeAvailability,
  employeeIncompatibilities,
  employeeTimeOff,
  roles,
  shifts,
  schedules,
} from "@/drizzle/schema";
import { PERIOD_TIMES } from "./schedules";
import { validateShiftAssignment } from "./schedule-validation";

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
    availability: Array<{ dayOfWeek: number; period: string; status: string }>;
    incompatibleWith: string[];
    timeOffDates: string[];
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

  const allStaffing = await db
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
    .where(eq(locations.organization_id, organizationId));

  const staffingForLocs = allStaffing.filter((s) => locIds.has(s.location_id));

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
    })
    .from(employeeRoles)
    .innerJoin(roles, eq(employeeRoles.role_id, roles.id))
    .where(eq(roles.organization_id, organizationId));

  const avail = await db.select().from(employeeAvailability);
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
    const ers = empRolesRows.filter((er) => er.employee_id === e.id);
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

    return {
      id: e.id,
      name: `${e.first_name} ${e.last_name}`,
      roleIds: ers.map((r) => r.role_id),
      weeklyHours: e.weekly_hours,
      maxHours: e.max_weekly_hours,
      availability: av.map((a) => ({
        dayOfWeek: a.day_of_week,
        period: a.shift_period,
        status: a.status,
      })),
      incompatibleWith: otherIds,
      timeOffDates: toDates,
    };
  });

  return {
    locations: locReqs,
    employees: empData,
  };
}

export type GeneratedShift = {
  employeeId: string;
  locationId: string;
  roleId: string;
  dayOfWeek: number;
  period: string;
};

export async function generateScheduleWithAI(
  constraints: SchedulingConstraint,
  weekStart: string
): Promise<GeneratedShift[]> {
  const periodTimes = Object.entries(PERIOD_TIMES).map(([p, t]) => ({
    period: p,
    start: t.start,
    end: t.end,
  }));

  const prompt = `Sei un esperto di scheduling. Genera un orario settimanale ottimale.

Settimana: ${weekStart} (lunedì = giorno 0, domenica = giorno 6).

LOCALI E FABBISOGNO:
${JSON.stringify(constraints.locations, null, 2)}

DIPENDENTI (con disponibilità, incompatibilità, assenze):
${JSON.stringify(constraints.employees, null, 2)}

PERIODI ORARI:
${JSON.stringify(periodTimes)}

REGOLE:
1. Assegna solo dipendenti disponibili (availability status "available" o "preferred", NON "unavailable")
2. Rispetta timeOffDates: non assegnare in quelle date
3. Non assegnare due dipendenti incompatibili (incompatibleWith) allo stesso turno
4. Ogni dipendente max maxHours ore/settimana
5. Riposo 11h tra turni consecutivi
6. Un dipendente deve avere il ruolo richiesto (roleIds contiene roleId del turno)

Rispondi SOLO con un array JSON di oggetti: [{"employeeId":"uuid","locationId":"uuid","roleId":"uuid","dayOfWeek":0-6,"period":"morning|afternoon|evening"}]
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
  const errors: string[] = [];
  let saved = 0;
  let skipped = 0;

  for (const s of shiftsToSave) {
    const date = format(addDays(weekStartDate, s.dayOfWeek), "yyyy-MM-dd");
    const times = PERIOD_TIMES[s.period] ?? PERIOD_TIMES.morning;

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
