-- Down migration for: 0000_tidy_risque
-- Reverses the initial Phase 2 schema (organizations, users, invitations, accountant_clients).
-- WARNING: This will permanently delete all data in these tables.

-- ==========================================
-- REVERSE FOREIGN KEY CONSTRAINTS
-- ==========================================

ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_organization_id_organizations_id_fk";
ALTER TABLE "invitations" DROP CONSTRAINT IF EXISTS "invitations_invited_by_user_id_users_id_fk";
ALTER TABLE "invitations" DROP CONSTRAINT IF EXISTS "invitations_organization_id_organizations_id_fk";
ALTER TABLE "accountant_clients" DROP CONSTRAINT IF EXISTS "accountant_clients_organization_id_organizations_id_fk";
ALTER TABLE "accountant_clients" DROP CONSTRAINT IF EXISTS "accountant_clients_accountant_user_id_users_id_fk";

-- ==========================================
-- REVERSE TABLE OPERATIONS
-- ==========================================

DROP TABLE IF EXISTS "users";
DROP TABLE IF EXISTS "invitations";
DROP TABLE IF EXISTS "accountant_clients";
DROP TABLE IF EXISTS "organizations";
