import { describe, it, expect } from "vitest";
import { getWeekStart, shiftMinutesInWeek } from "@/lib/schedules";

describe("shiftMinutesInWeek", () => {
  // Week 2025-01-06 (Mon) - 2025-01-12 (Sun)
  const weekStart = "2025-01-06";

  it("returns full duration for daytime shift within week", () => {
    // Mon 08:00-14:00 = 6h = 360 mins
    expect(shiftMinutesInWeek("2025-01-06", "08:00", "14:00", weekStart)).toBe(360);
  });

  it("counts only hours in week for night shift crossing into next week", () => {
    // Sun 22:00 - Mon 06:00: only 22:00-24:00 = 2h = 120 mins in this week
    expect(shiftMinutesInWeek("2025-01-12", "22:00", "06:00", weekStart)).toBe(120);
  });

  it("counts full duration when night shift is entirely within week", () => {
    // Sat 22:00 - Sun 06:00, both days in week: 8h = 480 mins
    const prevWeek = "2024-12-30"; // Mon 30 Dec - Sun 5 Jan (includes Sat 4 and Sun 5)
    expect(shiftMinutesInWeek("2025-01-04", "22:00", "06:00", prevWeek)).toBe(480);
  });

  it("returns 0 for shift entirely outside week", () => {
    // Mon next week 08:00-14:00
    expect(shiftMinutesInWeek("2025-01-13", "08:00", "14:00", weekStart)).toBe(0);
  });
});

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
