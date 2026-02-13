CREATE TABLE IF NOT EXISTS "location_role_shift_times" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"shift_period" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "location_role_shift_times" ADD CONSTRAINT "location_role_shift_times_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "location_role_shift_times" ADD CONSTRAINT "location_role_shift_times_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE UNIQUE INDEX IF NOT EXISTS "loc_role_shift_times_loc_role_period_unique" ON "location_role_shift_times" USING btree ("location_id","role_id","shift_period");
