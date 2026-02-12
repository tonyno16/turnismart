import { eq, and, gte, lte } from "drizzle-orm";
import { format, parseISO, startOfMonth, endOfMonth, getDay } from "date-fns";
import { it } from "date-fns/locale";
import { stringify } from "csv-stringify/sync";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import {
  shifts,
  employees,
  locations,
  roles,
  italianHolidays,
  employeeTimeOff,
  employeeRoles,
} from "@/drizzle/schema";
import { createServiceClient } from "./supabase/service";

function parseTimeMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function hoursBetween(start: string, end: string, breakMins = 0): number {
  const s = parseTimeMinutes(start);
  const e = parseTimeMinutes(end);
  return (e - s - breakMins) / 60;
}

export type EmployeeReportRow = {
  employeeId: string;
  employeeName: string;
  ordinaryHours: number;
  overtimeHours: number;
  holidayHours: number;
  sickHours: number;
  vacationHours: number;
  totalHours: number;
  hourlyRate: number;
  totalCost: number;
};

export type LocationReportRow = {
  locationId: string;
  locationName: string;
  totalHours: number;
  totalCost: number;
};

export type ReportAggregate = {
  month: string;
  byEmployee: EmployeeReportRow[];
  byLocation: LocationReportRow[];
  summary: {
    totalHours: number;
    totalCost: number;
    employeeCount: number;
    ordinaryHours: number;
    overtimeHours: number;
    holidayHours: number;
  };
};

export async function aggregateMonthlyData(
  organizationId: string,
  monthStr: string
): Promise<ReportAggregate> {
  const monthStart = startOfMonth(parseISO(monthStr));
  const monthEnd = endOfMonth(monthStart);
  const monthStartStr = format(monthStart, "yyyy-MM-dd");
  const monthEndStr = format(monthEnd, "yyyy-MM-dd");

  const holidayDates = await db
    .select({ date: italianHolidays.date })
    .from(italianHolidays)
    .where(
      and(
        gte(italianHolidays.date, monthStartStr),
        lte(italianHolidays.date, monthEndStr)
      )
    );
  const holidaySet = new Set(holidayDates.map((h) => h.date));

  const timeOffRows = await db
    .select({
      employee_id: employeeTimeOff.employee_id,
      type: employeeTimeOff.type,
      start_date: employeeTimeOff.start_date,
      end_date: employeeTimeOff.end_date,
    })
    .from(employeeTimeOff)
    .where(
      and(
        eq(employeeTimeOff.status, "approved"),
        lte(employeeTimeOff.start_date, monthEndStr),
        gte(employeeTimeOff.end_date, monthStartStr)
      )
    );

  const shiftsRows = await db
    .select({
      employee_id: shifts.employee_id,
      employee_first: employees.first_name,
      employee_last: employees.last_name,
      emp_hourly_rate: employees.hourly_rate,
      role_hourly_rate: employeeRoles.hourly_rate,
      overtime_rate: employees.overtime_rate,
      holiday_rate: employees.holiday_rate,
      weekly_hours: employees.weekly_hours,
      location_id: shifts.location_id,
      location_name: locations.name,
      date: shifts.date,
      start_time: shifts.start_time,
      end_time: shifts.end_time,
      break_minutes: shifts.break_minutes,
    })
    .from(shifts)
    .innerJoin(employees, eq(shifts.employee_id, employees.id))
    .leftJoin(
      employeeRoles,
      and(
        eq(shifts.employee_id, employeeRoles.employee_id),
        eq(shifts.role_id, employeeRoles.role_id)
      )
    )
    .innerJoin(locations, eq(shifts.location_id, locations.id))
    .where(
      and(
        eq(shifts.organization_id, organizationId),
        eq(shifts.status, "active"),
        gte(shifts.date, monthStartStr),
        lte(shifts.date, monthEndStr)
      )
    );

  const empMap = new Map<
    string,
    {
      name: string;
      hourlyRate: number;
      overtimeRate: number;
      holidayRate: number;
      weeklyHours: number;
      ordinary: number;
      overtime: number;
      holiday: number;
      locHours: Map<string, number>;
      locCost: Map<string, number>;
    }
  >();

  for (const s of shiftsRows) {
    const hrs = hoursBetween(
      s.start_time,
      s.end_time,
      s.break_minutes ?? 0
    );
    const hourlyRate = Number(s.role_hourly_rate ?? s.emp_hourly_rate ?? 0);
    const overtimeRate = Number(s.overtime_rate ?? hourlyRate);
    const holidayRate = Number(s.holiday_rate ?? hourlyRate);

    const isSunday = getDay(parseISO(s.date)) === 0;
    const isHoliday = holidaySet.has(s.date);
    const isHolidayOrSunday = isSunday || isHoliday;

    let emp = empMap.get(s.employee_id);
    if (!emp) {
      emp = {
        name: `${s.employee_first} ${s.employee_last}`,
        hourlyRate,
        overtimeRate,
        holidayRate,
        weeklyHours: s.weekly_hours ?? 40,
        ordinary: 0,
        overtime: 0,
        holiday: 0,
        locHours: new Map(),
        locCost: new Map(),
      };
      empMap.set(s.employee_id, emp);
    }

    const cost = isHolidayOrSunday
      ? hrs * holidayRate
      : hrs * hourlyRate;

    if (isHolidayOrSunday) {
      emp.holiday += hrs;
    } else {
      emp.ordinary += hrs;
    }

    const locHours = (emp.locHours.get(s.location_id) ?? 0) + hrs;
    const locCost = (emp.locCost.get(s.location_id) ?? 0) + cost;
    emp.locHours.set(s.location_id, locHours);
    emp.locCost.set(s.location_id, locCost);
  }

  const sickByEmp = new Map<string, number>();
  const vacByEmp = new Map<string, number>();
  for (const to of timeOffRows) {
    const start = parseISO(to.start_date);
    const end = parseISO(to.end_date);
    let days = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const ds = format(d, "yyyy-MM-dd");
      if (ds >= monthStartStr && ds <= monthEndStr) days++;
    }
    const hrs = days * 8;
    if (to.type === "sick_leave") {
      sickByEmp.set(to.employee_id, (sickByEmp.get(to.employee_id) ?? 0) + hrs);
    } else if (to.type === "vacation") {
      vacByEmp.set(to.employee_id, (vacByEmp.get(to.employee_id) ?? 0) + hrs);
    }
  }

  const byEmployee: EmployeeReportRow[] = [];
  const locAgg = new Map<string, { name: string; hours: number; cost: number }>();

  for (const [empId, emp] of empMap) {
    const totalHrs =
      emp.ordinary + emp.overtime + emp.holiday +
      (sickByEmp.get(empId) ?? 0) +
      (vacByEmp.get(empId) ?? 0);
    const totalCost = [...emp.locCost.values()].reduce((a, c) => a + c, 0);

    const workedHrs = emp.ordinary + emp.overtime + emp.holiday;
    const displayHourlyRate =
      workedHrs > 0 ? totalCost / workedHrs : emp.hourlyRate;

    byEmployee.push({
      employeeId: empId,
      employeeName: emp.name,
      ordinaryHours: Math.round(emp.ordinary * 100) / 100,
      overtimeHours: Math.round(emp.overtime * 100) / 100,
      holidayHours: Math.round(emp.holiday * 100) / 100,
      sickHours: Math.round((sickByEmp.get(empId) ?? 0) * 100) / 100,
      vacationHours: Math.round((vacByEmp.get(empId) ?? 0) * 100) / 100,
      totalHours: Math.round(totalHrs * 100) / 100,
      hourlyRate: Math.round(displayHourlyRate * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
    });

    for (const [locId, hrs] of emp.locHours) {
      const cost = emp.locCost.get(locId) ?? 0;
      const loc = locAgg.get(locId);
      const locRow = shiftsRows.find((s) => s.location_id === locId);
      if (!loc) {
        locAgg.set(locId, {
          name: locRow?.location_name ?? "-",
          hours: hrs,
          cost,
        });
      } else {
        loc.hours += hrs;
        loc.cost += cost;
      }
    }
  }

  const byLocation: LocationReportRow[] = [...locAgg.entries()].map(
    ([id, v]) => ({
      locationId: id,
      locationName: v.name,
      totalHours: Math.round(v.hours * 100) / 100,
      totalCost: Math.round(v.cost * 100) / 100,
    })
  );

  const totalHours = byEmployee.reduce((s, e) => s + e.totalHours, 0);
  const totalCost = byEmployee.reduce((s, e) => s + e.totalCost, 0);
  const ordinaryHours = byEmployee.reduce((s, e) => s + e.ordinaryHours, 0);
  const overtimeHours = byEmployee.reduce((s, e) => s + e.overtimeHours, 0);
  const holidayHours = byEmployee.reduce((s, e) => s + e.holidayHours, 0);

  return {
    month: monthStr,
    byEmployee,
    byLocation,
    summary: {
      totalHours: Math.round(totalHours * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      employeeCount: byEmployee.length,
      ordinaryHours: Math.round(ordinaryHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      holidayHours: Math.round(holidayHours * 100) / 100,
    },
  };
}

export async function generateReportCsv(aggregate: ReportAggregate): Promise<Buffer> {
  const rows = aggregate.byEmployee.map((e) => ({
    Dipendente: e.employeeName,
    "Ore ordinarie": e.ordinaryHours,
    "Ore straordinarie": e.overtimeHours,
    "Ore festive": e.holidayHours,
    "Ore malattia": e.sickHours,
    "Ore ferie": e.vacationHours,
    "Totale ore": e.totalHours,
    "Costo lordo": e.totalCost,
  }));
  const csv = stringify(rows, { header: true, delimiter: ";" });
  return Buffer.from(csv, "utf-8");
}

export async function generateReportExcel(aggregate: ReportAggregate): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "TurniSmart";

  const ws1 = wb.addWorksheet("Riepilogo", { headerFooter: { firstHeader: "Report mensile" } });
  ws1.columns = [
    { header: "Indicatore", key: "k", width: 25 },
    { header: "Valore", key: "v", width: 15 },
  ];
  ws1.addRows([
    { k: "Mese", v: format(parseISO(aggregate.month), "MMMM yyyy", { locale: it }) },
    { k: "Totale ore", v: aggregate.summary.totalHours },
    { k: "Costo totale", v: aggregate.summary.totalCost },
    { k: "Dipendenti", v: aggregate.summary.employeeCount },
    { k: "Ore ordinarie", v: aggregate.summary.ordinaryHours },
    { k: "Ore straordinarie", v: aggregate.summary.overtimeHours },
    { k: "Ore festive", v: aggregate.summary.holidayHours },
  ]);

  const ws2 = wb.addWorksheet("Per dipendente");
  ws2.columns = [
    { header: "Dipendente", key: "name", width: 25 },
    { header: "Ore ord.", key: "ord", width: 10 },
    { header: "Ore str.", key: "ovt", width: 10 },
    { header: "Ore fest.", key: "hol", width: 10 },
    { header: "Ore malattia", key: "sick", width: 12 },
    { header: "Ore ferie", key: "vac", width: 10 },
    { header: "Totale ore", key: "tot", width: 10 },
    { header: "Costo", key: "cost", width: 12 },
  ];
  aggregate.byEmployee.forEach((e) =>
    ws2.addRow({
      name: e.employeeName,
      ord: e.ordinaryHours,
      ovt: e.overtimeHours,
      hol: e.holidayHours,
      sick: e.sickHours,
      vac: e.vacationHours,
      tot: e.totalHours,
      cost: e.totalCost,
    })
  );

  const ws3 = wb.addWorksheet("Per sede");
  ws3.columns = [
    { header: "Sede", key: "name", width: 25 },
    { header: "Totale ore", key: "hours", width: 12 },
    { header: "Costo", key: "cost", width: 12 },
  ];
  aggregate.byLocation.forEach((l) =>
    ws3.addRow({
      name: l.locationName,
      hours: l.totalHours,
      cost: l.totalCost,
    })
  );

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

export async function generateReportPdf(aggregate: ReportAggregate): Promise<Buffer> {
  const { renderToBuffer } = await import("@react-pdf/renderer");
  const { ReportPDFDocument } = await import("./report-pdf-document");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buf = await renderToBuffer(
    ReportPDFDocument({ aggregate }) as any
  );
  return Buffer.from(buf);
}

export async function uploadReportToStorage(
  organizationId: string,
  monthStr: string,
  type: "pdf" | "csv" | "xlsx",
  buffer: Buffer
): Promise<string> {
  const supabase = createServiceClient();
  const ext = type === "xlsx" ? "xlsx" : type;
  const path = `${organizationId}/${monthStr}-report.${ext}`;

  const { data, error } = await supabase.storage
    .from("reports")
    .upload(path, buffer, {
      contentType:
        type === "pdf"
          ? "application/pdf"
          : type === "csv"
          ? "text/csv"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from("reports").getPublicUrl(data.path);
  return urlData.publicUrl;
}
