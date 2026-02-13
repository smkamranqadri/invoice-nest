CREATE TABLE "customer" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customer_organizationId_idx" ON "customer" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "customer_organizationId_name_idx" ON "customer" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "customer_organizationId_email_idx" ON "customer" USING btree ("organization_id","email");