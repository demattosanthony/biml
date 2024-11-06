CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "facility" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ifc_model" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"facility_id" uuid NOT NULL,
	"description" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ifc_model" ADD CONSTRAINT "ifc_model_facility_id_facility_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facility"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
