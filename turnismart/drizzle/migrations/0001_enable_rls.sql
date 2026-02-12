-- Enable RLS on all app tables for multi-tenant isolation.
-- Policies scope data by organization_id via the current user's row in public.users.

ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accountant_clients" ENABLE ROW LEVEL SECURITY;

-- Organizations: user can access if they belong to that org
CREATE POLICY "organizations_select_own"
  ON "organizations" FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)
  );

CREATE POLICY "organizations_update_own"
  ON "organizations" FOR UPDATE
  TO authenticated
  USING (
    id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)
  );

CREATE POLICY "organizations_insert_own"
  ON "organizations" FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users: can read self and users in same organization
CREATE POLICY "users_select_self_or_org"
  ON "users" FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)
  );

CREATE POLICY "users_update_own"
  ON "users" FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_insert_service"
  ON "users" FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Invitations: org members can manage invitations for their org
CREATE POLICY "invitations_select_org"
  ON "invitations" FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)
  );

CREATE POLICY "invitations_insert_org"
  ON "invitations" FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)
  );

CREATE POLICY "invitations_update_org"
  ON "invitations" FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)
  );

-- Accountant clients: accountant sees their clients; org sees link to accountant
CREATE POLICY "accountant_clients_select"
  ON "accountant_clients" FOR SELECT
  TO authenticated
  USING (
    accountant_user_id = auth.uid()
    OR organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)
  );

CREATE POLICY "accountant_clients_insert"
  ON "accountant_clients" FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "accountant_clients_update"
  ON "accountant_clients" FOR UPDATE
  TO authenticated
  USING (accountant_user_id = auth.uid() OR organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));
