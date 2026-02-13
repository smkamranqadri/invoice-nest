import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { customer } from "./customer";
import { organization, user } from "./auth";

export const invoice = pgTable(
  "invoice",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    customerId: text("customer_id")
      .notNull()
      .references(() => customer.id, { onDelete: "restrict" }),
    invoiceNumber: text("invoice_number").notNull(),
    status: text("status").notNull().default("draft"),
    issueDate: date("issue_date", { mode: "string" }).notNull(),
    dueDate: date("due_date", { mode: "string" }).notNull(),
    notes: text("notes"),
    terms: text("terms"),
    subtotalCents: integer("subtotal_cents").notNull().default(0),
    discountType: text("discount_type").notNull().default("none"),
    discountRateHundredths: integer("discount_rate_hundredths")
      .notNull()
      .default(0),
    discountAmountCents: integer("discount_amount_cents").notNull().default(0),
    discountCents: integer("discount_cents").notNull().default(0),
    taxRateHundredths: integer("tax_rate_hundredths").notNull().default(0),
    taxCents: integer("tax_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull().default(0),
    amountPaidCents: integer("amount_paid_cents").notNull().default(0),
    amountDueCents: integer("amount_due_cents").notNull().default(0),
    hasPaymentHistory: boolean("has_payment_history").notNull().default(false),
    sentAt: timestamp("sent_at"),
    voidedAt: timestamp("voided_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("invoice_organizationId_invoiceNumber_uidx").on(
      table.organizationId,
      table.invoiceNumber,
    ),
    index("invoice_organizationId_idx").on(table.organizationId),
    index("invoice_organizationId_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("invoice_organizationId_dueDate_idx").on(
      table.organizationId,
      table.dueDate,
    ),
    index("invoice_customerId_idx").on(table.customerId),
    index("invoice_updatedAt_idx").on(table.updatedAt),
  ],
);

export const invoiceLineItem = pgTable(
  "invoice_line_item",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoice.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    description: text("description").notNull(),
    quantityHundredths: integer("quantity_hundredths").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("invoiceLineItem_invoiceId_idx").on(table.invoiceId),
    index("invoiceLineItem_organizationId_invoiceId_idx").on(
      table.organizationId,
      table.invoiceId,
    ),
    uniqueIndex("invoiceLineItem_invoiceId_position_uidx").on(
      table.invoiceId,
      table.position,
    ),
  ],
);

export const invoiceSequence = pgTable(
  "invoice_sequence",
  {
    organizationId: text("organization_id")
      .primaryKey()
      .references(() => organization.id, { onDelete: "cascade" }),
    currentValue: integer("current_value").notNull().default(0),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("invoiceSequence_currentValue_idx").on(table.currentValue)],
);

export const invoicePayment = pgTable(
  "invoice_payment",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoice.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(),
    paymentDate: date("payment_date", { mode: "string" }).notNull(),
    method: text("method").notNull(),
    methodDetail: text("method_detail"),
    notes: text("notes"),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("invoicePayment_invoiceId_idx").on(table.invoiceId),
    index("invoicePayment_organizationId_invoiceId_idx").on(
      table.organizationId,
      table.invoiceId,
    ),
    index("invoicePayment_organizationId_paymentDate_idx").on(
      table.organizationId,
      table.paymentDate,
    ),
    index("invoicePayment_createdByUserId_idx").on(table.createdByUserId),
  ],
);

export const invoicePaymentAudit = pgTable(
  "invoice_payment_audit",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoice.id, { onDelete: "cascade" }),
    paymentId: text("payment_id").notNull(),
    action: text("action").notNull(),
    reason: text("reason").notNull(),
    beforeStateJson: text("before_state_json"),
    afterStateJson: text("after_state_json"),
    actorUserId: text("actor_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("invoicePaymentAudit_organizationId_invoiceId_idx").on(
      table.organizationId,
      table.invoiceId,
    ),
    index("invoicePaymentAudit_paymentId_idx").on(table.paymentId),
    index("invoicePaymentAudit_actorUserId_idx").on(table.actorUserId),
  ],
);

export const invoiceRelations = relations(invoice, ({ one, many }) => ({
  organization: one(organization, {
    fields: [invoice.organizationId],
    references: [organization.id],
  }),
  customer: one(customer, {
    fields: [invoice.customerId],
    references: [customer.id],
  }),
  lineItems: many(invoiceLineItem),
  payments: many(invoicePayment),
  paymentAudits: many(invoicePaymentAudit),
}));

export const invoiceLineItemRelations = relations(
  invoiceLineItem,
  ({ one }) => ({
    organization: one(organization, {
      fields: [invoiceLineItem.organizationId],
      references: [organization.id],
    }),
    invoice: one(invoice, {
      fields: [invoiceLineItem.invoiceId],
      references: [invoice.id],
    }),
  }),
);

export const invoiceSequenceRelations = relations(invoiceSequence, ({ one }) => ({
  organization: one(organization, {
    fields: [invoiceSequence.organizationId],
    references: [organization.id],
  }),
}));

export const invoicePaymentRelations = relations(invoicePayment, ({ one }) => ({
  organization: one(organization, {
    fields: [invoicePayment.organizationId],
    references: [organization.id],
  }),
  invoice: one(invoice, {
    fields: [invoicePayment.invoiceId],
    references: [invoice.id],
  }),
  createdByUser: one(user, {
    fields: [invoicePayment.createdByUserId],
    references: [user.id],
  }),
}));

export const invoicePaymentAuditRelations = relations(
  invoicePaymentAudit,
  ({ one }) => ({
    organization: one(organization, {
      fields: [invoicePaymentAudit.organizationId],
      references: [organization.id],
    }),
    invoice: one(invoice, {
      fields: [invoicePaymentAudit.invoiceId],
      references: [invoice.id],
    }),
    actorUser: one(user, {
      fields: [invoicePaymentAudit.actorUserId],
      references: [user.id],
    }),
  }),
);
