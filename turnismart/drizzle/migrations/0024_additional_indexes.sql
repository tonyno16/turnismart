-- Additional performance indexes: locations and roles by organization_id
-- These tables are queried with WHERE organization_id = ? on almost every page load

CREATE INDEX IF NOT EXISTS idx_locations_organization ON locations (organization_id);
CREATE INDEX IF NOT EXISTS idx_roles_organization ON roles (organization_id);
