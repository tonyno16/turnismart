import { pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

export const accountantClientStatuses = ["pending", "active"] as const;
export type AccountantClientStatus = (typeof accountantClientStatuses)[number];

export const accountantClients = pgTable(
  "accountant_clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountant_user_id: uuid("accountant_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    status: text("status", { enum: accountantClientStatuses })
      .default("pending")
      .notNull(),
    invited_at: timestamp("invited_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    accepted_at: timestamp("accepted_at", { withTimezone: true }),
  },
  (t) => [
    unique("accountant_clients_user_org_unique").on(
      t.accountant_user_id,
      t.organization_id
    ),
  ]
);
