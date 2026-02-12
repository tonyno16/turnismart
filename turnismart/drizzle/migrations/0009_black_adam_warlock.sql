CREATE TABLE "usage_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"month" text NOT NULL,
	"locations_count" integer DEFAULT 0 NOT NULL,
	"employees_count" integer DEFAULT 0 NOT NULL,
	"ai_generations_count" integer DEFAULT 0 NOT NULL,
	"reports_generated_count" integer DEFAULT 0 NOT NULL,
	"whatsapp_messages_sent" integer DEFAULT 0 NOT NULL,
	"email_messages_sent" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usage_tracking_org_month_unique" UNIQUE("organization_id","month")
);
--> statement-breakpoint
ALTER TABLE "usage_tracking" ADD CONSTRAINT "usage_tracking_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;