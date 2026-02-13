import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";

export const customer = pgTable(
  "customer",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("customer_organizationId_idx").on(table.organizationId),
    index("customer_organizationId_name_idx").on(
      table.organizationId,
      table.name,
    ),
    index("customer_organizationId_email_idx").on(
      table.organizationId,
      table.email,
    ),
  ],
);

export const customerRelations = relations(customer, ({ one }) => ({
  organization: one(organization, {
    fields: [customer.organizationId],
    references: [organization.id],
  }),
  // invoices relation will be added in Phase 3
}));
