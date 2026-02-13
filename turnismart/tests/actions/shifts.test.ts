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

const mockValidateShiftAssignment = vi.hoisted(() => vi.fn());
const mockRequireOrganization = vi.hoisted(() => vi.fn().mockResolvedValue({
  user: { id: "user-1", role: "owner" },
  organization: { id: "org-1", name: "Test" },
}));

vi.mock("@/lib/db", () => ({ db: mockDb }));
vi.mock("@/drizzle/schema", () => ({
  schedules: { id: "id", organization_id: "organization_id", week_start_date: "week_start_date" },
  shifts: { schedule_id: "schedule_id", organization_id: "organization_id", location_id: "location_id", employee_id: "employee_id", role_id: "role_id" },
  employees: {},
  employeeRoles: {},
  locations: {},
  roles: {},
}));
vi.mock("@/lib/auth", () => ({
  requireOrganization: mockRequireOrganization,
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("@/lib/schedules", () => ({
  getWeekSchedule: vi.fn(),
  getWeekStart: vi.fn(),
  getPeriodTimesForRole: vi.fn().mockResolvedValue({
    start: "08:00",
    end: "14:00",
  }),
}));
vi.mock("@/lib/notifications", () => ({
  dispatchSchedulePublishedNotifications: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/schedule-validation", () => ({
  validateShiftAssignment: mockValidateShiftAssignment,
}));

import { createShift } from "@/app/actions/shifts";

beforeEach(() => {
  vi.clearAllMocks();
  // Reset the requireOrganization mock for each test
  mockRequireOrganization.mockResolvedValue({
    user: { id: "user-1", role: "owner" },
    organization: { id: "org-1", name: "Test" },
  });
});

describe("createShift", () => {
  it("returns { ok: true } when no conflict", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([{ id: "sch1", organization_id: "org-1", week_start_date: "2025-01-06" }])
    );
    mockValidateShiftAssignment.mockResolvedValueOnce(null);
    mockDb.insert.mockReturnValueOnce(chainableMock());

    const result = await createShift("sch1", "loc1", "role1", "2025-01-06", "morning", "emp1");
    expect(result).toEqual({ ok: true });
    expect(mockValidateShiftAssignment).toHaveBeenCalledOnce();
  });

  it("returns { ok: false, conflict } on validation failure", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([{ id: "sch1", organization_id: "org-1", week_start_date: "2025-01-06" }])
    );
    const conflict = { type: "overlap", message: "Overlapping shift" };
    mockValidateShiftAssignment.mockResolvedValueOnce(conflict);

    const result = await createShift("sch1", "loc1", "role1", "2025-01-06", "morning", "emp1");
    expect(result).toEqual({ ok: false, conflict });
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("skips validation when force=true", async () => {
    mockDb.select.mockReturnValueOnce(
      chainableMock([{ id: "sch1", organization_id: "org-1", week_start_date: "2025-01-06" }])
    );
    mockDb.insert.mockReturnValueOnce(chainableMock());

    const result = await createShift("sch1", "loc1", "role1", "2025-01-06", "morning", "emp1", true);
    expect(result).toEqual({ ok: true });
    expect(mockValidateShiftAssignment).not.toHaveBeenCalled();
  });
});
