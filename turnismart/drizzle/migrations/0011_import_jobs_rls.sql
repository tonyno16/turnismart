-- RLS for import_jobs
ALTER TABLE "import_jobs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_jobs_select_org" ON "import_jobs" FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "import_jobs_insert_org" ON "import_jobs" FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "import_jobs_update_org" ON "import_jobs" FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));
