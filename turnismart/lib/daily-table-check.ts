import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

/**
 * Check if the daily_staffing_overrides table exists.
 * Cached in-memory so only one probe per process lifetime.
 * After running migration 0023 this will always return true.
 */
let _exists: boolean | null = null;

export async function dailyTableExists(): Promise<boolean> {
  if (_exists !== null) return _exists;
  try {
    await db.execute(sql`SELECT 1 FROM daily_staffing_overrides LIMIT 0`);
    _exists = true;
  } catch {
    _exists = false;
  }
  return _exists;
}
