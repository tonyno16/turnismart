import { addDays, parseISO } from "date-fns";

function parseTimeMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Minutes of a shift that fall within the given week (Mon 00:00 - Sun 24:00).
 * For night shifts crossing midnight, only counts hours inside the week.
 * Safe for client-side (no db/Node deps). */
export function shiftMinutesInWeek(
  date: string,
  startTime: string,
  endTime: string,
  weekStart: string
): number {
  const weekStartDate = parseISO(weekStart);
  const weekEndTs = addDays(weekStartDate, 7).getTime();
  const weekStartTs = weekStartDate.getTime();

  const shiftStartDate = parseISO(date);
  const startM = parseTimeMinutes(startTime);
  const endM = parseTimeMinutes(endTime);
  const crossMidnight = endM <= startM;

  const shiftStartTs = shiftStartDate.getTime() + startM * 60_000;
  const shiftEndTs = crossMidnight
    ? addDays(shiftStartDate, 1).getTime() + endM * 60_000
    : shiftStartDate.getTime() + endM * 60_000;

  const overlapStart = Math.max(shiftStartTs, weekStartTs);
  const overlapEnd = Math.min(shiftEndTs, weekEndTs);
  return Math.max(0, Math.floor((overlapEnd - overlapStart) / 60_000));
}
