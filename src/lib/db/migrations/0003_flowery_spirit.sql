CREATE TABLE "invoice_payment" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"payment_date" date NOT NULL,
	"method" text NOT NULL,
	"method_detail" text,
	"notes" text,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_payment_audit" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"payment_id" text NOT NULL,
	"action" text NOT NULL,
	"reason" text NOT NULL,
	"before_state_json" text,
	"after_state_json" text,
	"actor_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoice" ADD COLUMN "amount_paid_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "invoice" ADD COLUMN "amount_due_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "invoice" ADD COLUMN "has_payment_history" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "invoice"
SET
	"amount_paid_cents" = 0,
	"amount_due_cents" = "total_cents",
	"has_payment_history" = false;--> statement-breakpoint
ALTER TABLE "invoice_payment" ADD CONSTRAINT "invoice_payment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment" ADD CONSTRAINT "invoice_payment_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment" ADD CONSTRAINT "invoice_payment_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment_audit" ADD CONSTRAINT "invoice_payment_audit_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment_audit" ADD CONSTRAINT "invoice_payment_audit_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment_audit" ADD CONSTRAINT "invoice_payment_audit_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoicePayment_invoiceId_idx" ON "invoice_payment" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoicePayment_organizationId_invoiceId_idx" ON "invoice_payment" USING btree ("organization_id","invoice_id");--> statement-breakpoint
CREATE INDEX "invoicePayment_organizationId_paymentDate_idx" ON "invoice_payment" USING btree ("organization_id","payment_date");--> statement-breakpoint
CREATE INDEX "invoicePayment_createdByUserId_idx" ON "invoice_payment" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "invoicePaymentAudit_organizationId_invoiceId_idx" ON "invoice_payment_audit" USING btree ("organization_id","invoice_id");--> statement-breakpoint
CREATE INDEX "invoicePaymentAudit_paymentId_idx" ON "invoice_payment_audit" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "invoicePaymentAudit_actorUserId_idx" ON "invoice_payment_audit" USING btree ("actor_user_id");
