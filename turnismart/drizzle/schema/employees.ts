import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  numeric,
  date,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { locations } from "./locations";
import { users } from "./users";

export const contractTypes = ["full_time", "part_time", "on_call", "seasonal"] as const;
export type ContractType = (typeof contractTypes)[number];

export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  contract_type: text("contract_type", { enum: contractTypes })
    .default("full_time")
    .notNull(),
  weekly_hours: integer("weekly_hours").default(40).notNull(),
  max_weekly_hours: integer("max_weekly_hours").default(48).notNull(),
  hourly_rate: numeric("hourly_rate", { precision: 8, scale: 2 }).default("0").notNull(),
  overtime_rate: numeric("overtime_rate", { precision: 8, scale: 2 }),
  holiday_rate: numeric("holiday_rate", { precision: 8, scale: 2 }),
  preferred_location_id: uuid("preferred_location_id").references(() => locations.id, {
    onDelete: "set null",
  }),
  is_active: boolean("is_active").default(true).notNull(),
  hired_at: date("hired_at"),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
