-- Add hourly_rate to employee_roles for per-role pay. If null, use employees.hourly_rate.
ALTER TABLE "employee_roles" ADD COLUMN IF NOT EXISTS "hourly_rate" numeric(8, 2);
