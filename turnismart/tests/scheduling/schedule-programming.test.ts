/**
 * Test di scenari per verificare che la programmazione degli orari sia corretta.
 * Verifica che le regole di validazione vengano applicate correttamente.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

function chainableMock(resolvedValue: unknown = []) {
  const chain: Record<string, unknown> = {};
  const methods = [
    "select", "from", "where", "limit", "orderBy",
    "innerJoin", "leftJoin", "insert", "values",
    "returning", "update", "set", "delete", "eq", "and", "or", "gte", "lte",
  ];
  for (const method of methods) {
    (chain as Record<string, unknown>)[method] = vi.fn().mockReturnValue(chain);
  }
  (chain as { then: (r: (v: unknown) => void) => void }).then = (resolve) => resolve(resolvedValue);
  return chain;
}

const mockDb = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));
const mockGetEmployeeWeekShifts = vi.hoisted(() => vi.fn().mockResolvedValue([]));

vi.mock("@/lib/db", () => ({ db: mockDb }));
vi.mock("@/drizzle/schema", () => ({
  shifts: { employee_id: "employee_id", date: "date", status: "status", schedule_id: "schedule_id", start_time: "start_time", end_time: "end_time", location_id: "location_id", role_id: "role_id" },
  employees: { id: "id", max_weekly_hours: "max_weekly_hours" },
  employeeAvailability: { employee_id: "employee_id", day_of_week: "day_of_week", shift_period: "shift_period" },
  employeeAvailabilityExceptions: { employee_id: "employee_id", day_of_week: "day_of_week", start_date: "start_date", end_date: "end_date" },
  employeeIncompatibilities: { employee_a_id: "employee_a_id", employee_b_id: "employee_b_id" },
  employeeTimeOff: { employee_id: "employee_id", status: "status", start_date: "start_date", end_date: "end_date" },
}));
vi.mock("@/drizzle/schema/employee-availability", () => ({}));
vi.mock("@/lib/schedules", async () => {
  const actual = await vi.importActual<typeof import("@/lib/schedules")>("@/lib/schedules");
  return { ...actual, getEmployeeWeekShifts: mockGetEmployeeWeekShifts };
});

import { validateShiftAssignment } from "@/lib/schedule-validation";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Scenari programmazione orari - regole corrette", () => {
  const baseParams = {
    employeeId: "emp1",
    organizationId: "org1",
    scheduleId: "sch1",
    locationId: "loc1",
    roleId: "role1",
    weekStart: "2025-01-06",
  };

  it("Scenario: turno valido viene accettato", async () => {
    mockDb.select.mockReturnValue(chainableMock([]));
    mockGetEmployeeWeekShifts.mockResolvedValue([]);

    const result = await validateShiftAssignment({
      ...baseParams,
      date: "2030-01-06",
      startTime: "08:00",
      endTime: "14:00",
    });

    expect(result).toBeNull();
  });

  it("Scenario: due turni sovrapposti stesso giorno → secondo rifiutato", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([{ id: "s1", start_time: "08:00", end_time: "14:00", status: "active" }])
    );
    mockDb.select.mockReturnValue(chainableMock([]));

    const result = await validateShiftAssignment({
      ...baseParams,
      date: "2030-01-06",
      startTime: "10:00",
      endTime: "16:00",
    });

    expect(result).not.toBeNull();
    expect(result!.type).toBe("overlap");
  });

  it("Scenario: superamento max ore settimanali → rifiutato", async () => {
    mockDb.select
      .mockReturnValueOnce(chainableMock([]))
      .mockReturnValueOnce(chainableMock([]))
      .mockReturnValueOnce(chainableMock([]))
      .mockReturnValueOnce(chainableMock([]))
      .mockReturnValueOnce(chainableMock([{ max_weekly_hours: 40 }]))
      .mockReturnValue(chainableMock([]));
    mockGetEmployeeWeekShifts.mockResolvedValue([
      { id: "s1", date: "2030-01-06", start_time: "08:00", end_time: "14:00" },
      { id: "s2", date: "2030-01-07", start_time: "08:00", end_time: "14:00" },
      { id: "s3", date: "2030-01-08", start_time: "08:00", end_time: "14:00" },
      { id: "s4", date: "2030-01-09", start_time: "08:00", end_time: "14:00" },
      { id: "s5", date: "2030-01-10", start_time: "08:00", end_time: "14:00" },
      { id: "s6", date: "2030-01-10", start_time: "14:00", end_time: "22:00" },
    ]);

    const result = await validateShiftAssignment({
      ...baseParams,
      weekStart: "2030-01-06",
      date: "2030-01-11",
      startTime: "08:00",
      endTime: "14:00",
    });

    expect(result).not.toBeNull();
    expect(result!.type).toBe("max_hours");
  });

  it("Scenario: turno in giorno passato → rifiutato", async () => {
    const result = await validateShiftAssignment({
      ...baseParams,
      date: "2020-01-01",
      startTime: "08:00",
      endTime: "14:00",
    });

    expect(result).not.toBeNull();
    expect(result!.type).toBe("past_date");
  });

  it("Scenario: riposo < 11h tra turni consecutivi → rifiutato", async () => {
    mockDb.select
      .mockReturnValueOnce(chainableMock([]))
      .mockReturnValueOnce(chainableMock([]))
      .mockReturnValueOnce(chainableMock([]))
      .mockReturnValueOnce(chainableMock([]))
      .mockReturnValueOnce(chainableMock([{ max_weekly_hours: 40 }]))
      .mockReturnValueOnce(chainableMock([
        { id: "s1", date: "2030-01-05", start_time: "14:00", end_time: "23:00", status: "active" },
      ]))
      .mockReturnValue(chainableMock([]));
    mockGetEmployeeWeekShifts.mockResolvedValue([]);

    const result = await validateShiftAssignment({
      ...baseParams,
      weekStart: "2030-01-06",
      date: "2030-01-06",
      startTime: "08:00",
      endTime: "14:00",
    });

    expect(result).not.toBeNull();
    expect(result!.type).toBe("rest_period");
  });

  it("Scenario: turno notturno (22:00-06:00) conta solo ore in settimana", async () => {
    mockDb.select
      .mockReturnValueOnce(chainableMock([]))
      .mockReturnValueOnce(chainableMock([]))
      .mockReturnValueOnce(chainableMock([]))
      .mockReturnValueOnce(chainableMock([]))
      .mockReturnValueOnce(chainableMock([{ max_weekly_hours: 40 }]))
      .mockReturnValue(chainableMock([]));
    // 6 turni x 6h = 36h. Domenica 22:00-06:00 = solo 2h in settimana
    mockGetEmployeeWeekShifts.mockResolvedValue([
      { id: "s1", date: "2030-01-06", start_time: "08:00", end_time: "14:00" },
      { id: "s2", date: "2030-01-07", start_time: "08:00", end_time: "14:00" },
      { id: "s3", date: "2030-01-08", start_time: "08:00", end_time: "14:00" },
      { id: "s4", date: "2030-01-09", start_time: "08:00", end_time: "14:00" },
      { id: "s5", date: "2030-01-10", start_time: "08:00", end_time: "14:00" },
      { id: "s6", date: "2030-01-11", start_time: "08:00", end_time: "14:00" },
    ]);

    const result = await validateShiftAssignment({
      ...baseParams,
      weekStart: "2030-01-06",
      date: "2030-01-12",
      startTime: "22:00",
      endTime: "06:00",
    });

    // 36 + 2 = 38h <= 40h → accettato
    expect(result).toBeNull();
  });
});
