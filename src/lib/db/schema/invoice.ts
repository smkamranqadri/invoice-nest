import { relations } from "drizzle-orm";
import {
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { customer } from "./customer";
import { organization } from "./auth";

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
