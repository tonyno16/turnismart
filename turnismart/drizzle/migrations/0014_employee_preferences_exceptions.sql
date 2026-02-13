-- Add period_preference to employees (morning | evening | null)
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "period_preference" text;--> statement-breakpoint
-- Create employee_availability_exceptions for date-range exclusions
CREATE TABLE IF NOT EXISTS "employee_availability_exceptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "employee_id" uuid NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "day_of_week" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "employee_availability_exceptions" ADD CONSTRAINT "employee_availability_exceptions_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
