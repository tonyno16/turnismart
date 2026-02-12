import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const userRoles = [
  "owner",
  "manager",
  "employee",
  "accountant",
  "admin",
] as const;
export type UserRole = (typeof userRoles)[number];

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // Matches Supabase auth.users.id
  organization_id: uuid("organization_id").references(
    () => organizations.id,
    { onDelete: "set null" }
  ),
  email: text("email").notNull().unique(),
  full_name: text("full_name"),
  phone: text("phone"),
  avatar_url: text("avatar_url"),
  role: text("role", { enum: userRoles }).notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
