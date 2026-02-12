import { pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { employees } from "./employees";

export const employeeIncompatibilities = pgTable(
  "employee_incompatibilities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    employee_a_id: uuid("employee_a_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    employee_b_id: uuid("employee_b_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    reason: text("reason"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique("employee_incompatibilities_ab_unique").on(
      t.employee_a_id,
      t.employee_b_id
    ),
  ]
);
