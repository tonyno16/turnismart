import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateScheduleWithAI = vi.hoisted(() => vi.fn());
const mockCollectConstraints = vi.hoisted(() => vi.fn());
const mockSaveGeneratedShifts = vi.hoisted(() => vi.fn());
const mockFillUncoveredSlots = vi.hoisted(() => vi.fn());
const mockRequireOrganization = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    user: { id: "user-1", role: "owner" },
    organization: { id: "org-1", name: "Test" },
  })
);
const mockGetWeekSchedule = vi.hoisted(() => vi.fn());
const mockCheckQuota = vi.hoisted(() => vi.fn());
const mockIncrementUsage = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ requireOrganization: mockRequireOrganization }));
vi.mock("@/lib/schedules", () => ({
  getWeekSchedule: mockGetWeekSchedule,
}));
vi.mock("@/lib/usage", () => ({
  checkQuota: mockCheckQuota,
  incrementUsage: mockIncrementUsage,
}));
vi.mock("@/lib/ai-schedule", () => ({
  collectSchedulingConstraints: mockCollectConstraints,
  generateScheduleWithAI: mockGenerateScheduleWithAI,
  saveGeneratedShifts: mockSaveGeneratedShifts,
  fillUncoveredSlots: mockFillUncoveredSlots,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { generateScheduleWithAIAction } from "@/app/actions/ai-schedule";

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckQuota.mockResolvedValue({ allowed: true });
  mockFillUncoveredSlots.mockResolvedValue({ filled: 0, errors: [] });
  mockGetWeekSchedule.mockResolvedValue({
    schedule: { id: "sch1", organization_id: "org-1", week_start_date: "2025-01-06" },
  });
  mockCollectConstraints.mockResolvedValue({
    locations: [{ id: "loc1", name: "Sede 1", requirements: [{ dayOfWeek: 0, period: "morning", roleId: "role1", roleName: "Commesso", required: 1 }] }],
    employees: [
      { id: "emp-uuid-1", name: "Giuseppe Napoli", roleIds: ["role1"], weeklyHours: 40, maxHours: 48, availability: [], incompatibleWith: [], timeOffDates: [], exceptionDates: [] },
    ],
  });
});

describe("generateScheduleWithAIAction", () => {
  it("resolves employee names to UUIDs when AI returns names", async () => {
    mockGenerateScheduleWithAI.mockResolvedValue([
      { employeeId: "giuseppe napoli", locationId: "loc1", roleId: "role1", dayOfWeek: 0, period: "morning" },
    ]);
    mockSaveGeneratedShifts.mockResolvedValue({ saved: 1, skipped: 0, errors: [] });

    const result = await generateScheduleWithAIAction("2025-01-06");

    expect(result.ok).toBe(true);
    expect(mockSaveGeneratedShifts).toHaveBeenCalledWith(
      "org-1",
      "sch1",
      "2025-01-06",
      expect.arrayContaining([
        expect.objectContaining({ employeeId: "emp-uuid-1" }),
      ])
    );
  });

  it("keeps UUID when AI returns valid UUID", async () => {
    mockGenerateScheduleWithAI.mockResolvedValue([
      { employeeId: "emp-uuid-1", locationId: "loc1", roleId: "role1", dayOfWeek: 0, period: "morning" },
    ]);
    mockSaveGeneratedShifts.mockResolvedValue({ saved: 1, skipped: 0, errors: [] });

    await generateScheduleWithAIAction("2025-01-06");

    expect(mockSaveGeneratedShifts).toHaveBeenCalledWith(
      "org-1",
      "sch1",
      "2025-01-06",
      expect.arrayContaining([
        expect.objectContaining({ employeeId: "emp-uuid-1" }),
      ])
    );
  });

  it("returns error when no employees", async () => {
    mockCollectConstraints.mockResolvedValueOnce({
      locations: [{ id: "loc1", name: "Sede 1", requirements: [{ dayOfWeek: 0, period: "morning", roleId: "role1", roleName: "Commesso", required: 1 }] }],
      employees: [],
    });

    const result = await generateScheduleWithAIAction("2025-01-06");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Nessun dipendente");
    expect(mockGenerateScheduleWithAI).not.toHaveBeenCalled();
  });

  it("returns error when no staffing requirements", async () => {
    mockCollectConstraints.mockResolvedValueOnce({
      locations: [{ id: "loc1", name: "Sede 1", requirements: [] }],
      employees: [{ id: "emp1", name: "Mario Rossi", roleIds: ["role1"] }],
    });

    const result = await generateScheduleWithAIAction("2025-01-06");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Nessun fabbisogno");
    expect(mockGenerateScheduleWithAI).not.toHaveBeenCalled();
  });

  it("returns error when quota exceeded", async () => {
    mockCheckQuota.mockResolvedValueOnce({ allowed: false, message: "Limite raggiunto" });

    const result = await generateScheduleWithAIAction("2025-01-06");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Limite");
    expect(mockCollectConstraints).not.toHaveBeenCalled();
  });

  it("returns saved/skipped/errors from saveGeneratedShifts and fillUncoveredSlots", async () => {
    mockGenerateScheduleWithAI.mockResolvedValue([
      { employeeId: "emp-uuid-1", locationId: "loc1", roleId: "role1", dayOfWeek: 0, period: "morning" },
      { employeeId: "emp2", locationId: "loc1", roleId: "role1", dayOfWeek: 1, period: "morning" },
    ]);
    mockSaveGeneratedShifts.mockResolvedValue({
      saved: 1,
      skipped: 1,
      errors: ["emp2 @ 2025-01-07 morning: Sovrapposizione"],
    });
    mockFillUncoveredSlots.mockResolvedValue({ filled: 3, errors: [] });

    const result = await generateScheduleWithAIAction("2025-01-06");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.saved).toBe(4);
      expect(result.skipped).toBe(1);
      expect(result.errors).toContain("emp2 @ 2025-01-07 morning: Sovrapposizione");
    }
  });
});
