import { pgTable, integer, numeric, timestamp, uuid, unique, index } from "drizzle-orm/pg-core";
import { employees } from "./employees";
import { roles } from "./roles";

/** Priority 1 = primary role, 2 = second, 3 = third. Max 3 roles per employee. */
export const employeeRoles = pgTable(
  "employee_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employee_id: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    role_id: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    priority: integer("priority").default(1).notNull(), // 1..3
    /** Paga oraria per questa mansione. Se null, usa employees.hourly_rate */
    hourly_rate: numeric("hourly_rate", { precision: 8, scale: 2 }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique("employee_roles_emp_role_unique").on(t.employee_id, t.role_id),
    index("idx_employee_roles_employee").on(t.employee_id),
  ]
);
