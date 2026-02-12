import { pgTable, boolean, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { employees } from "./employees";
import { roles } from "./roles";

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
    is_primary: boolean("is_primary").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [unique("employee_roles_emp_role_unique").on(t.employee_id, t.role_id)]
);
