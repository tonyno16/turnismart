import { describe, it, expect } from "vitest";
import { getWeekStart } from "@/lib/schedules";

describe("getWeekStart", () => {
  it("returns Monday for a Wednesday date", () => {
    // 2025-01-08 is a Wednesday
    expect(getWeekStart("2025-01-08")).toBe("2025-01-06");
  });

  it("returns same day for a Monday date", () => {
    // 2025-01-06 is a Monday
    expect(getWeekStart("2025-01-06")).toBe("2025-01-06");
  });

  it("returns previous Monday for a Sunday date", () => {
    // 2025-01-12 is a Sunday
    expect(getWeekStart("2025-01-12")).toBe("2025-01-06");
  });

  it("returns Monday for a Saturday date", () => {
    // 2025-01-11 is a Saturday
    expect(getWeekStart("2025-01-11")).toBe("2025-01-06");
  });

  it("handles month boundary correctly", () => {
    // 2025-02-01 is a Saturday → Monday is 2025-01-27
    expect(getWeekStart("2025-02-01")).toBe("2025-01-27");
  });

  it("handles year boundary correctly", () => {
    // 2025-01-01 is a Wednesday → Monday is 2024-12-30
    expect(getWeekStart("2025-01-01")).toBe("2024-12-30");
  });
});
