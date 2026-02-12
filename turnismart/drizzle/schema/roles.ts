import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const roles = pgTable(
  "roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").default("#3B82F6"),
    icon: text("icon"),
    is_active: boolean("is_active").default(true).notNull(),
    sort_order: integer("sort_order").default(0).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [unique("roles_org_name_unique").on(t.organization_id, t.name)]
);
