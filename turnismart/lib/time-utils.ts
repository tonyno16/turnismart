/** Parse "HH:MM" to total minutes since midnight */
export function parseTimeMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Duration in minutes between two "HH:MM" times (handles overnight) */
export function timeRangeMinutes(start: string, end: string): number {
  const s = parseTimeMinutes(start);
  const e = parseTimeMinutes(end);
  return e >= s ? e - s : 1440 - s + e;
}
