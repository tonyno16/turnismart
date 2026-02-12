-- Down migration for: 0003_majestic_shockwave

ALTER TABLE "employee_time_off" DROP CONSTRAINT IF EXISTS "employee_time_off_approved_by_user_id_users_id_fk";
ALTER TABLE "employee_time_off" DROP CONSTRAINT IF EXISTS "employee_time_off_employee_id_employees_id_fk";
ALTER TABLE "employee_incompatibilities" DROP CONSTRAINT IF EXISTS "employee_incompatibilities_employee_b_id_employees_id_fk";
ALTER TABLE "employee_incompatibilities" DROP CONSTRAINT IF EXISTS "employee_incompatibilities_employee_a_id_employees_id_fk";
ALTER TABLE "employee_incompatibilities" DROP CONSTRAINT IF EXISTS "employee_incompatibilities_organization_id_organizations_id_fk";
ALTER TABLE "employee_availability" DROP CONSTRAINT IF EXISTS "employee_availability_employee_id_employees_id_fk";

DROP TABLE IF EXISTS "employee_time_off";
DROP TABLE IF EXISTS "employee_incompatibilities";
DROP TABLE IF EXISTS "employee_availability";
