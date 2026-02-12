import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  unique,
} from "drizzle-orm/pg-core";

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sector: text("sector"),
    logo_url: text("logo_url"),
    phone: text("phone"),
    email: text("email"),
    stripe_customer_id: text("stripe_customer_id"),
    trial_ends_at: timestamp("trial_ends_at", { withTimezone: true }),
    onboarding_completed: boolean("onboarding_completed").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique("organizations_slug_unique").on(t.slug),
    unique("organizations_stripe_customer_id_unique").on(t.stripe_customer_id),
  ]
);
