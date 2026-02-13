import { describe, it, expect, vi, beforeEach } from "vitest";

function chainableMock(resolvedValue: unknown = []) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "from", "where", "limit", "orderBy", "innerJoin", "values"];
  for (const method of methods) {
    (chain as Record<string, unknown>)[method] = vi.fn().mockReturnValue(chain);
  }
  (chain as { then: (resolve: (v: unknown) => void) => void }).then = (
    resolve: (v: unknown) => void
  ) => resolve(resolvedValue);
  return chain;
}

const mockDb = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
}));

const mockValidateShiftAssignment = vi.hoisted(() => vi.fn());

vi.mock("openai", () => ({
  default: class MockOpenAI {},
}));
vi.mock("@/lib/db", () => ({ db: mockDb }));
vi.mock("@/lib/schedule-validation", () => ({
  validateShiftAssignment: mockValidateShiftAssignment,
}));
vi.mock("@/lib/schedules", () => ({
  getPeriodTimesForOrganization: vi.fn().mockResolvedValue({
    morning: { start: "08:00", end: "14:00" },
    evening: { start: "14:00", end: "23:00" },
  }),
  getRoleShiftTimesOverrides: vi.fn().mockResolvedValue(new Map()),
  getLocationRoleShiftTimesOverrides: vi.fn().mockResolvedValue(new Map()),
  getStaffingCoverage: vi.fn().mockResolvedValue([
    { locationId: "loc1", roleId: "role1", dayOfWeek: 0, shiftPeriod: "morning", required: 2, assigned: 0 },
    { locationId: "loc1", roleId: "role1", dayOfWeek: 1, shiftPeriod: "evening", required: 2, assigned: 0 },
  ]),
}));

import { saveGeneratedShifts, generateScheduleWithAI } from "@/lib/ai-schedule";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("saveGeneratedShifts", () => {
  const weekStart = "2025-01-06";
  const orgId = "org1";
  const scheduleId = "sch1";

  it("saves valid shifts and skips invalid ones with conflict message", async () => {
    mockValidateShiftAssignment
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ type: "overlap", message: "Sovrapposizione" })
      .mockResolvedValueOnce(null);

    mockDb.insert.mockReturnValue(chainableMock());

    const shifts = [
      { employeeId: "emp1", locationId: "loc1", roleId: "role1", dayOfWeek: 0, period: "morning" },
      { employeeId: "emp2", locationId: "loc1", roleId: "role1", dayOfWeek: 0, period: "morning" },
      { employeeId: "emp3", locationId: "loc1", roleId: "role1", dayOfWeek: 1, period: "evening" },
    ];

    const result = await saveGeneratedShifts(orgId, scheduleId, weekStart, shifts);

    expect(result.saved).toBe(2);
    expect(result.skipped).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("emp2");
    expect(result.errors[0]).toContain("Sovrapposizione");
  });

  it("skips shift when validation returns past_date", async () => {
    mockValidateShiftAssignment.mockResolvedValueOnce({
      type: "past_date",
      message: "Non è possibile creare turni nei giorni passati",
    });

    const shifts = [
      { employeeId: "emp1", locationId: "loc1", roleId: "role1", dayOfWeek: 0, period: "morning" },
    ];

    const result = await saveGeneratedShifts(orgId, scheduleId, weekStart, shifts);

    expect(result.saved).toBe(0);
    expect(result.skipped).toBe(1);
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("reports db insert errors", async () => {
    mockValidateShiftAssignment.mockResolvedValue(null);
    const insertChain = {
      values: vi.fn().mockRejectedValue(new Error("Unique constraint")),
    };
    mockDb.insert.mockReturnValue(insertChain);

    const shifts = [
      { employeeId: "emp1", locationId: "loc1", roleId: "role1", dayOfWeek: 0, period: "morning" },
    ];

    const result = await saveGeneratedShifts(orgId, scheduleId, weekStart, shifts);

    expect(result.saved).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.errors[0]).toContain("Unique constraint");
  });

  it("uses correct date for dayOfWeek", async () => {
    mockValidateShiftAssignment.mockResolvedValue(null);
    mockDb.insert.mockReturnValue(chainableMock());

    await saveGeneratedShifts(orgId, scheduleId, "2025-01-06", [
      { employeeId: "emp1", locationId: "loc1", roleId: "role1", dayOfWeek: 0, period: "morning" },
    ]);

    expect(mockValidateShiftAssignment).toHaveBeenCalledWith(
      expect.objectContaining({ date: "2025-01-06", startTime: "08:00", endTime: "14:00" })
    );
  });
});

