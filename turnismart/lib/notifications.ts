import { eq, and, inArray } from "drizzle-orm";
import { format, parseISO, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { db } from "@/lib/db";
import {
  notifications,
  notificationJobs,
  shifts,
  employees,
  users,
  locations,
  roles,
} from "@/drizzle/schema";
import { sendEmail } from "./resend";
import { sendWhatsApp, isWhatsAppConfigured } from "./twilio";

function formatShiftSummary(
  items: Array<{
    date: string;
    start_time: string;
    end_time: string;
    location_name: string;
    role_name: string;
    notes?: string | null;
  }>
): string {
  return items
    .map((s) => {
      const base = `${format(parseISO(s.date), "EEE d MMM", { locale: it })} ${s.start_time}-${s.end_time} @ ${s.location_name} (${s.role_name})`;
      const notesLine = s.notes?.trim() ? `\n  📝 ${s.notes.trim()}` : "";
      return base + notesLine;
    })
    .join("\n");
}

function buildSchedulePublishedEmail(name: string, shiftSummary: string, weekLabel: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;line-height:1.5;color:#333;max-width:600px;margin:0 auto;padding:20px}h1{color:#1a1a2e}.shifts{background:#f5f5f5;padding:15px;border-radius:8px;margin:20px 0;white-space:pre-wrap}p{margin:10px 0}</style></head>
<body>
  <h1>Ciao ${name},</h1>
  <p>Il tuo orario per la settimana <strong>${weekLabel}</strong> è pronto.</p>
  <div class="shifts">${shiftSummary.replace(/\n/g, "<br>")}</div>
  <p>Puoi visualizzare il programma completo dall'app TurniSmart.</p>
  <p>Buon lavoro!</p>
</body>
</html>
`;
}

function buildSickLeaveReplacementEmail(name: string, date: string, time: string, location: string, role: string): string {
  const dateStr = format(parseISO(date), "EEEE d MMMM", { locale: it });
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;line-height:1.5;color:#333;max-width:600px;margin:0 auto;padding:20px}h1{color:#1a1a2e}.info{background:#e8f4fd;padding:15px;border-radius:8px;margin:20px 0}p{margin:10px 0}</style></head>
<body>
  <h1>Ciao ${name},</h1>
  <p>Ti è stato assegnato un turno di sostituzione:</p>
  <div class="info">
    <strong>${dateStr}</strong> - ${time}<br>
    ${location} (${role})
  </div>
  <p>Controlla l'app per i dettagli completi.</p>
  <p>Grazie!</p>
</body>
</html>
`;
}

export async function dispatchSchedulePublishedNotifications(params: {
  organizationId: string;
  scheduleId: string;
  weekStart: string;
}): Promise<{ sent: number; failed: number }> {
  const { organizationId, scheduleId, weekStart } = params;

  const shiftsRows = await db
    .select({
      employee_id: shifts.employee_id,
      date: shifts.date,
      start_time: shifts.start_time,
      end_time: shifts.end_time,
      location_name: locations.name,
      role_name: roles.name,
      notes: shifts.notes,
    })
    .from(shifts)
    .innerJoin(locations, eq(shifts.location_id, locations.id))
    .innerJoin(roles, eq(shifts.role_id, roles.id))
    .where(
      and(
        eq(shifts.schedule_id, scheduleId),
        eq(shifts.status, "active")
      )
    )
    .orderBy(shifts.date, shifts.start_time);

  const byEmployee = new Map<
    string,
    Array<{
      date: string;
      start_time: string;
      end_time: string;
      location_name: string;
      role_name: string;
      notes?: string | null;
    }>
  >();
  for (const s of shiftsRows) {
    const list = byEmployee.get(s.employee_id) ?? [];
    list.push({
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      location_name: s.location_name,
      role_name: s.role_name,
      notes: s.notes,
    });
    byEmployee.set(s.employee_id, list);
  }

  const empIds = [...byEmployee.keys()];
  if (empIds.length === 0) return { sent: 0, failed: 0 };

  const emps = await db
    .select({
      id: employees.id,
      first_name: employees.first_name,
      last_name: employees.last_name,
      email: employees.email,
      phone: employees.phone,
      user_id: employees.user_id,
    })
    .from(employees)
    .where(
      and(
        eq(employees.organization_id, organizationId),
        inArray(employees.id, empIds)
      )
    );

  const empMap = new Map(emps.map((e) => [e.id, e]));
  const userIds = [...new Set(emps.map((e) => e.user_id).filter(Boolean))] as string[];
  let userEmailMap = new Map<string, string>();
  if (userIds.length > 0) {
    const usersList = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(inArray(users.id, userIds));
    userEmailMap = new Map(usersList.map((u) => [u.id, u.email]));
  }

  const [job] = await db
    .insert(notificationJobs)
    .values({
      organization_id: organizationId,
      event_type: "schedule_published",
      recipient_count: empIds.length,
      status: "sending",
      progress_percentage: 0,
    })
    .returning();

  const weekEnd = addDays(parseISO(weekStart), 6);
  const weekLabel = `${format(parseISO(weekStart), "d MMM", { locale: it })} – ${format(weekEnd, "d MMM", { locale: it })}`;
  let sent = 0;
  let failed = 0;

  for (const empId of empIds) {
    const emp = empMap.get(empId);
    if (!emp) continue;

    const shiftList = byEmployee.get(empId) ?? [];
    const shiftSummary = formatShiftSummary(shiftList);
    const name = `${emp.first_name} ${emp.last_name}`;
    const email =
      emp.email ?? (emp.user_id ? userEmailMap.get(emp.user_id!) : null) ?? null;

    const [notif] = await db
      .insert(notifications)
      .values({
        organization_id: organizationId,
        recipient_employee_id: empId,
        recipient_user_id: emp.user_id,
        channel: "email",
        event_type: "schedule_published",
        subject: `Il tuo orario è pronto - ${weekLabel}`,
        body: shiftSummary,
        delivery_status: "pending",
      })
      .returning();

    if (email) {
      const result = await sendEmail({
        to: email,
        subject: `Il tuo orario è pronto - ${weekLabel}`,
        html: buildSchedulePublishedEmail(name, shiftSummary, weekLabel),
      });
      if (result.ok) {
        await db
          .update(notifications)
          .set({
            delivery_status: "sent",
            external_id: result.id,
            sent_at: new Date(),
          })
          .where(eq(notifications.id, notif.id));
        sent++;
      } else {
        await db
          .update(notifications)
          .set({
            delivery_status: "failed",
            body: `${notif.body}\n[ERRORE: ${result.error}]`,
          })
          .where(eq(notifications.id, notif.id));
        failed++;
      }
    } else if (emp.phone && isWhatsAppConfigured()) {
      const body = `Ciao ${name}, il tuo orario per ${weekLabel} è pronto.\n\n${shiftSummary}\n\nVisualizza l'app per i dettagli.`;
      const result = await sendWhatsApp(emp.phone, body);
      if (result.ok) {
        await db
          .update(notifications)
          .set({
            channel: "whatsapp",
            delivery_status: "sent",
            external_id: result.sid,
            sent_at: new Date(),
          })
          .where(eq(notifications.id, notif.id));
        sent++;
      } else {
        await db
          .update(notifications)
          .set({ delivery_status: "failed", body: `${notif.body}\n[ERRORE: ${result.error}]` })
          .where(eq(notifications.id, notif.id));
        failed++;
      }
    } else {
      failed++;
    }
  }

  await db
    .update(notificationJobs)
    .set({
      status: failed > 0 && sent > 0 ? "partial" : failed > 0 ? "failed" : "completed",
      progress_percentage: 100,
      result_summary: { sent, failed, pending: 0 },
      completed_at: new Date(),
    })
    .where(eq(notificationJobs.id, job.id));

  return { sent, failed };
}

export async function dispatchSickLeaveReplacementNotification(params: {
  organizationId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  locationName: string;
  roleName: string;
}): Promise<{ sent: boolean }> {
  const { organizationId, employeeId, employeeName, date, startTime, endTime, locationName, roleName } = params;

  const [emp] = await db
    .select({
      id: employees.id,
      email: employees.email,
      phone: employees.phone,
      user_id: employees.user_id,
    })
    .from(employees)
    .where(eq(employees.id, employeeId))
    .limit(1);

  if (!emp) return { sent: false };

  let email = emp.email;
  if (!email && emp.user_id) {
    const [u] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, emp.user_id))
      .limit(1);
    email = u?.email ?? null;
  }

  const timeStr = `${startTime}–${endTime}`;

  await db.insert(notifications).values({
    organization_id: organizationId,
    recipient_employee_id: employeeId,
    recipient_user_id: emp.user_id,
    channel: email ? "email" : "whatsapp",
    event_type: "sick_leave_replacement",
    subject: `Turno di sostituzione assegnato - ${date}`,
    body: `Turno ${date} ${timeStr} @ ${locationName} (${roleName})`,
    delivery_status: "pending",
  });

  if (email) {
    const result = await sendEmail({
      to: email,
      subject: `Turno di sostituzione - ${format(parseISO(date), "d MMM", { locale: it })}`,
      html: buildSickLeaveReplacementEmail(employeeName, date, timeStr, locationName, roleName),
    });
    return { sent: result.ok };
  }

  if (emp.phone && isWhatsAppConfigured()) {
    const body = `Ciao ${employeeName}, ti è stato assegnato un turno di sostituzione:\n${date} ${timeStr} @ ${locationName} (${roleName})`;
    const result = await sendWhatsApp(emp.phone, body);
    return { sent: result.ok };
  }

  return { sent: false };
}
