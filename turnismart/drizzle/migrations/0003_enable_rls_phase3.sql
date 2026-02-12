-- RLS for Phase 3 tables: locations, roles, staffing_requirements, organization_settings, employees, employee_roles

ALTER TABLE "locations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "staffing_requirements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employee_roles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locations_select_org" ON "locations" FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "locations_insert_org" ON "locations" FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "locations_update_org" ON "locations" FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "roles_select_org" ON "roles" FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "roles_insert_org" ON "roles" FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "roles_update_org" ON "roles" FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "staffing_select_org" ON "staffing_requirements" FOR SELECT TO authenticated
  USING (location_id IN (SELECT id FROM public.locations WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)));

CREATE POLICY "staffing_insert_org" ON "staffing_requirements" FOR INSERT TO authenticated
  WITH CHECK (location_id IN (SELECT id FROM public.locations WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)));

CREATE POLICY "staffing_update_org" ON "staffing_requirements" FOR UPDATE TO authenticated
  USING (location_id IN (SELECT id FROM public.locations WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)));

CREATE POLICY "org_settings_select" ON "organization_settings" FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "org_settings_insert" ON "organization_settings" FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "org_settings_update" ON "organization_settings" FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "employees_select_org" ON "employees" FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "employees_insert_org" ON "employees" FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "employees_update_org" ON "employees" FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "employee_roles_select" ON "employee_roles" FOR SELECT TO authenticated
  USING (employee_id IN (SELECT id FROM public.employees WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)));

CREATE POLICY "employee_roles_insert" ON "employee_roles" FOR INSERT TO authenticated
  WITH CHECK (employee_id IN (SELECT id FROM public.employees WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)));

CREATE POLICY "employee_roles_update" ON "employee_roles" FOR UPDATE TO authenticated
  USING (employee_id IN (SELECT id FROM public.employees WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)));
