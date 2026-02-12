-- Add priority column (1=primary, 2=second, 3=third), migrate from is_primary, drop is_primary
ALTER TABLE "employee_roles" ADD COLUMN IF NOT EXISTS "priority" integer;--> statement-breakpoint
UPDATE "employee_roles" er SET priority = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY "is_primary" DESC, created_at) AS rn
  FROM "employee_roles"
) sub
WHERE er.id = sub.id AND sub.rn <= 3;--> statement-breakpoint
UPDATE "employee_roles" SET priority = 1 WHERE priority IS NULL;--> statement-breakpoint
ALTER TABLE "employee_roles" ALTER COLUMN "priority" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "employee_roles" ALTER COLUMN "priority" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "employee_roles" ADD CONSTRAINT "employee_roles_priority_check" CHECK (priority >= 1 AND priority <= 3);--> statement-breakpoint
ALTER TABLE "employee_roles" DROP COLUMN IF EXISTS "is_primary";
