import { describe, it, expect } from "vitest";
import {
  normalizeHeader,
  autoMapColumns,
  validateEmail,
  validatePhone,
} from "@/trigger/csv-import-helpers";

describe("normalizeHeader", () => {
  it("lowercases and replaces spaces with underscore", () => {
    expect(normalizeHeader("First Name")).toBe("first_name");
  });

  it("trims whitespace", () => {
    expect(normalizeHeader("  email  ")).toBe("email");
  });

  it("handles multiple spaces", () => {
    expect(normalizeHeader("ore  settimanali")).toBe("ore_settimanali");
  });
});

describe("autoMapColumns", () => {
  it("maps italian headers to standard fields", () => {
    const headers = ["nome", "cognome", "email", "telefono", "mansione", "ore_settimanali", "contratto"];
    const map = autoMapColumns(headers);
    expect(map.first_name).toBeDefined();
    expect(map.last_name).toBeDefined();
    expect(map.email).toBe(2);
    expect(map.phone).toBe(3);
    expect(map.role).toBe(4);
    expect(map.weekly_hours).toBe(5);
    expect(map.contract_type).toBe(6);
  });

  it("maps english headers", () => {
    const headers = ["first_name", "last_name", "email"];
    const map = autoMapColumns(headers);
    expect(map.first_name).toBe(0);
    expect(map.last_name).toBe(1);
    expect(map.email).toBe(2);
  });

  it("returns empty map when no matches", () => {
    const headers = ["col_a", "col_b"];
    const map = autoMapColumns(headers);
    expect(Object.keys(map)).toHaveLength(0);
  });
});

describe("validateEmail", () => {
  it("accepts valid emails", () => {
    expect(validateEmail("mario@example.com")).toBe(true);
    expect(validateEmail("user.name+tag@domain.co.uk")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("no-at-sign")).toBe(false);
    expect(validateEmail("@nodomain.com")).toBe(false);
    expect(validateEmail("missing@.com")).toBe(false);
  });
});

describe("validatePhone", () => {
  it("accepts phones with 9-15 digits", () => {
    expect(validatePhone("3331234567")).toBe(true);
    expect(validatePhone("+39 333 123 4567")).toBe(true);
    expect(validatePhone("333-123-4567")).toBe(true);
  });

  it("rejects too short", () => {
    expect(validatePhone("12345678")).toBe(false);
  });

  it("rejects too long", () => {
    expect(validatePhone("1234567890123456")).toBe(false);
  });

  it("rejects empty string (no digits)", () => {
    expect(validatePhone("")).toBe(false);
  });
});
