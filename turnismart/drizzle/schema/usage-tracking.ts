import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const usageTracking = pgTable(
  "usage_tracking",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    month: text("month").notNull(), // yyyy-MM
    locations_count: integer("locations_count").default(0).notNull(),
    employees_count: integer("employees_count").default(0).notNull(),
    ai_generations_count: integer("ai_generations_count").default(0).notNull(),
    reports_generated_count: integer("reports_generated_count").default(0).notNull(),
    whatsapp_messages_sent: integer("whatsapp_messages_sent").default(0).notNull(),
    email_messages_sent: integer("email_messages_sent").default(0).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [unique("usage_tracking_org_month_unique").on(t.organization_id, t.month)]
);
