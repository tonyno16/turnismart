import { describe, it, expect, vi, beforeEach } from "vitest";

function chainableMock(resolvedValue: unknown = []) {
  const chain: Record<string, any> = {};
  const methods = [
    "select", "from", "where", "limit", "orderBy",
    "innerJoin", "leftJoin", "insert", "values",
    "returning", "update", "set", "delete",
  ];
  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }
  chain.then = (resolve: (v: unknown) => void) => resolve(resolvedValue);
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
vi.mock("@/lib/schedules", () => ({
  getEmployeeWeekShifts: mockGetEmployeeWeekShifts,
}));

import {
  checkOverlap,
  checkMaxWeeklyHours,
  checkMinRestPeriod,
  checkAvailability,
  checkTimeOff,
  checkIncompatibility,
  validateShiftAssignment,
} from "@/lib/schedule-validation";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkOverlap", () => {
  it("returns conflict when shifts overlap", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([
        { id: "s1", start_time: "08:00", end_time: "14:00", status: "active" },
      ])
    );
    const result = await checkOverlap("emp1", "2025-01-06", "10:00", "16:00");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("overlap");
  });

  it("returns null when shifts don't overlap", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([
        { id: "s1", start_time: "08:00", end_time: "14:00", status: "active" },
      ])
    );
    const result = await checkOverlap("emp1", "2025-01-06", "14:00", "23:00");
    expect(result).toBeNull();
  });

  it("excludes specific shift id", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([
        { id: "s1", start_time: "08:00", end_time: "14:00", status: "active" },
      ])
    );
    const result = await checkOverlap("emp1", "2025-01-06", "10:00", "16:00", "s1");
    expect(result).toBeNull();
  });
});

describe("checkMaxWeeklyHours", () => {
  it("returns conflict when exceeding max hours", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([{ max_weekly_hours: 40 }])
    );
    // 6 shifts x 6h = 36h existing + 6h new = 42h > 40h
    mockGetEmployeeWeekShifts.mockResolvedValueOnce([
      { id: "s1", start_time: "08:00", end_time: "14:00", date: "2025-01-06" },
      { id: "s2", start_time: "08:00", end_time: "14:00", date: "2025-01-07" },
      { id: "s3", start_time: "08:00", end_time: "14:00", date: "2025-01-08" },
      { id: "s4", start_time: "08:00", end_time: "14:00", date: "2025-01-09" },
      { id: "s5", start_time: "08:00", end_time: "14:00", date: "2025-01-10" },
      { id: "s6", start_time: "14:00", end_time: "22:00", date: "2025-01-10" },
    ]);

    const result = await checkMaxWeeklyHours(
      "emp1", "2025-01-06", "2025-01-11", "08:00", "14:00"
    );
    expect(result).not.toBeNull();
    expect(result!.type).toBe("max_hours");
  });

  it("returns null when under max hours", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([{ max_weekly_hours: 40 }])
    );
    mockGetEmployeeWeekShifts.mockResolvedValueOnce([]);

    const result = await checkMaxWeeklyHours(
      "emp1", "2025-01-06", "2025-01-07", "08:00", "14:00"
    );
    expect(result).toBeNull();
  });
});

describe("checkMinRestPeriod", () => {
  it("returns conflict when rest period is too short", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([
        { id: "s1", date: "2025-01-05", start_time: "14:00", end_time: "23:00", status: "active" },
      ])
    );
    const result = await checkMinRestPeriod("emp1", "2025-01-06", "08:00", "14:00");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("rest_period");
  });

  it("returns null when rest period is sufficient", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([
        { id: "s1", date: "2025-01-05", start_time: "08:00", end_time: "14:00", status: "active" },
      ])
    );
    const result = await checkMinRestPeriod("emp1", "2025-01-06", "08:00", "14:00");
    expect(result).toBeNull();
  });
});

describe("checkAvailability", () => {
  it("returns conflict when employee is unavailable", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([{ status: "unavailable" }])
    );
    const result = await checkAvailability("emp1", 0, "morning");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("availability");
  });

  it("returns null when employee is preferred", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([{ status: "preferred" }])
    );
    const result = await checkAvailability("emp1", 0, "morning");
    expect(result).toBeNull();
  });

  it("returns null when no availability record exists", async () => {
    mockDb.select.mockReturnValueOnce(chainableMock([]));
    const result = await checkAvailability("emp1", 0, "morning");
    expect(result).toBeNull();
  });
});

describe("checkTimeOff", () => {
  it("returns conflict when approved time-off covers the date", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([{ id: "to1", employee_id: "emp1", start_date: "2025-01-06", end_date: "2025-01-10", status: "approved" }])
    );
    const result = await checkTimeOff("emp1", "2025-01-07");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("time_off");
  });

  it("returns null when no time-off for date", async () => {
    mockDb.select.mockReturnValueOnce(chainableMock([]));
    const result = await checkTimeOff("emp1", "2025-01-07");
    expect(result).toBeNull();
  });
});

describe("checkIncompatibility", () => {
  it("returns conflict when incompatible employee is on the same shift", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([{ employee_a_id: "emp1", employee_b_id: "emp2" }])
    );
    mockDb.select.mockReturnValueOnce(
      chainableMock([{ employee_id: "emp2" }])
    );
    const result = await checkIncompatibility("emp1", "loc1", "2025-01-06", "08:00", "14:00", "sch1");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("incompatibility");
  });

  it("returns null when no incompatible employees on same shift", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([{ employee_a_id: "emp1", employee_b_id: "emp2" }])
    );
    mockDb.select.mockReturnValueOnce(
      chainableMock([{ employee_id: "emp3" }])
    );
    const result = await checkIncompatibility("emp1", "loc1", "2025-01-06", "08:00", "14:00", "sch1");
    expect(result).toBeNull();
  });
});

describe("validateShiftAssignment", () => {
  it("returns null when all checks pass", async () => {
    // Batch 1: checkOverlap, checkAvailability, checkTimeOff, checkAvailabilityException (parallel)
    mockDb.select.mockReturnValueOnce(chainableMock([])); // overlap: no shifts
    mockDb.select.mockReturnValueOnce(chainableMock([])); // availability: no record
    mockDb.select.mockReturnValueOnce(chainableMock([])); // timeOff: no records
    mockDb.select.mockReturnValueOnce(chainableMock([])); // availabilityException: no records
    // Batch 2: checkMaxWeeklyHours, checkMinRestPeriod, checkIncompatibility (parallel)
    mockDb.select.mockReturnValueOnce(chainableMock([{ max_weekly_hours: 40 }])); // max hours: employee
    mockGetEmployeeWeekShifts.mockResolvedValueOnce([]);
    mockDb.select.mockReturnValueOnce(chainableMock([])); // rest: no nearby shifts
    mockDb.select.mockReturnValueOnce(chainableMock([])); // incompat: no rows

    const result = await validateShiftAssignment({
      employeeId: "emp1",
      organizationId: "org1",
      scheduleId: "sch1",
      locationId: "loc1",
      roleId: "role1",
      date: "2025-01-06",
      startTime: "08:00",
      endTime: "14:00",
      weekStart: "2025-01-06",
    });
    expect(result).toBeNull();
  });

  it("short-circuits on first batch failure", async () => {
    // Batch 1 runs in parallel: overlap (conflict), availability (pass), timeOff (pass), exception (pass)
    mockDb.select.mockReturnValueOnce(
      chainableMock([
        { id: "s1", start_time: "08:00", end_time: "14:00", status: "active" },
      ])
    );
    mockDb.select.mockReturnValueOnce(chainableMock([]));
    mockDb.select.mockReturnValueOnce(chainableMock([]));
    mockDb.select.mockReturnValueOnce(chainableMock([])); // exception: no records

    const result = await validateShiftAssignment({
      employeeId: "emp1",
      organizationId: "org1",
      scheduleId: "sch1",
      locationId: "loc1",
      roleId: "role1",
      date: "2025-01-06",
      startTime: "10:00",
      endTime: "16:00",
      weekStart: "2025-01-06",
    });
    expect(result).not.toBeNull();
    expect(result!.type).toBe("overlap");
    // Only batch 1 (4 calls) should have been made
    expect(mockDb.select).toHaveBeenCalledTimes(4);
  });
});
