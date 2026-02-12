CREATE TABLE "schedule_generation_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"schedule_id" uuid,
	"week_start_date" date NOT NULL,
	"location_ids" text[],
	"mode" text DEFAULT 'full',
	"options" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"current_step" text,
	"trigger_run_id" text,
	"result_summary" jsonb,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "schedule_generation_jobs" ADD CONSTRAINT "schedule_generation_jobs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_generation_jobs" ADD CONSTRAINT "schedule_generation_jobs_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE set null ON UPDATE no action;