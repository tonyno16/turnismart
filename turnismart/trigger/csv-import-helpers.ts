/** Helpers for CSV import - pure functions for unit testing */

export const COLUMN_ALIASES: Record<string, string[]> = {
  first_name: ["nome", "first_name", "firstname"],
  last_name: ["cognome", "last_name", "lastname", "surname"],
  email: ["email", "e-mail"],
  phone: ["telefono", "phone", "cellulare"],
  role: ["mansione", "ruolo", "role"],
  contract_type: ["contratto", "contract", "tipo_contratto"],
  weekly_hours: ["ore_settimanali", "ore", "weekly_hours", "hours"],
};

export const CONTRACT_MAP: Record<string, string> = {
  full_time: "full_time",
  "full-time": "full_time",
  fulltime: "full_time",
  part_time: "part_time",
  "part-time": "part_time",
  parttime: "part_time",
  on_call: "on_call",
  oncall: "on_call",
  seasonal: "seasonal",
};

export function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

export function autoMapColumns(headers: string[]): Record<string, number> {
  const mapped: Record<string, number> = {};
  const normalized = headers.map(normalizeHeader);
  for (const [target, aliases] of Object.entries(COLUMN_ALIASES)) {
    const idx = normalized.findIndex((h) =>
      aliases.some((a) => h.includes(a) || a.includes(h))
    );
    if (idx >= 0) mapped[target] = idx;
  }
  return mapped;
}

export function validateEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e || "").trim());
}

export function validatePhone(p: string): boolean {
  const digits = (p || "").replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}
