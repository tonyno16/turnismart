-- Down migration for: 0002_small_shadowcat
-- Reverses Phase 3 schema: locations, roles, staffing_requirements, organization_settings, employees, employee_roles

ALTER TABLE "staffing_requirements" DROP CONSTRAINT IF EXISTS "staffing_requirements_role_id_roles_id_fk";
ALTER TABLE "staffing_requirements" DROP CONSTRAINT IF EXISTS "staffing_requirements_location_id_locations_id_fk";
ALTER TABLE "roles" DROP CONSTRAINT IF EXISTS "roles_organization_id_organizations_id_fk";
ALTER TABLE "organization_settings" DROP CONSTRAINT IF EXISTS "organization_settings_organization_id_organizations_id_fk";
ALTER TABLE "locations" DROP CONSTRAINT IF EXISTS "locations_organization_id_organizations_id_fk";
ALTER TABLE "employees" DROP CONSTRAINT IF EXISTS "employees_preferred_location_id_locations_id_fk";
ALTER TABLE "employees" DROP CONSTRAINT IF EXISTS "employees_user_id_users_id_fk";
ALTER TABLE "employees" DROP CONSTRAINT IF EXISTS "employees_organization_id_organizations_id_fk";
ALTER TABLE "employee_roles" DROP CONSTRAINT IF EXISTS "employee_roles_role_id_roles_id_fk";
ALTER TABLE "employee_roles" DROP CONSTRAINT IF EXISTS "employee_roles_employee_id_employees_id_fk";

DROP TABLE IF EXISTS "staffing_requirements";
DROP TABLE IF EXISTS "employee_roles";
DROP TABLE IF EXISTS "employees";
DROP TABLE IF EXISTS "organization_settings";
DROP TABLE IF EXISTS "roles";
DROP TABLE IF EXISTS "locations";
