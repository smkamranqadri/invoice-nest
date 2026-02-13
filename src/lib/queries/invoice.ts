import { and, asc, desc, eq, gte, lte, lt, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  customer,
  invoice,
  invoiceLineItem,
  invoicePayment,
  invoicePaymentAudit,
  user,
} from "@/lib/db/schema";
import type { InvoiceFilterStatus } from "@/lib/validations/invoice";
import { getTodayIsoDateInTimeZone } from "@/lib/domain/date";
import {
  deriveInvoiceDisplayStatus,
  type InvoiceDisplayStatus,
  type InvoicePersistedStatus,
} from "@/lib/domain/invoice-status";

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  status: InvoicePersistedStatus;
  displayStatus: InvoiceDisplayStatus;
  dueDate: string;
  totalCents: number;
  amountPaidCents: number;
  amountDueCents: number;
  hasPaymentHistory: boolean;
  updatedAt: Date;
  createdAt: Date;
}

export interface InvoiceDetailLineItem {
  id: string;
  position: number;
  description: string;
  quantityHundredths: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface InvoiceDetailRecord {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerIsActive: boolean;
  invoiceNumber: string;
  status: InvoicePersistedStatus;
  displayStatus: InvoiceDisplayStatus;
  issueDate: string;
  dueDate: string;
  notes: string | null;
  terms: string | null;
  discountType: "none" | "percentage" | "fixed";
  discountRateHundredths: number;
  discountAmountCents: number;
  subtotalCents: number;
  discountCents: number;
  taxRateHundredths: number;
  taxCents: number;
  totalCents: number;
  amountPaidCents: number;
  amountDueCents: number;
  hasPaymentHistory: boolean;
  sentAt: Date | null;
  voidedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lineItems: InvoiceDetailLineItem[];
  payments: InvoicePaymentRecord[];
  paymentAudits: InvoicePaymentAuditRecord[];
}

export interface InvoicePaymentRecord {
  id: string;
  amountCents: number;
  paymentDate: string;
  method: string;
  methodDetail: string | null;
  notes: string | null;
  createdByUserId: string;
  createdByUserName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoicePaymentAuditRecord {
  id: string;
  paymentId: string;
  action: "create" | "update" | "delete";
  reason: string;
  beforeStateJson: string | null;
  afterStateJson: string | null;
  actorUserId: string;
  actorUserName: string | null;
  createdAt: Date;
}

export interface InvoiceListOptions {
  status?: InvoiceFilterStatus;
  from?: string;
  to?: string;
  timeZone?: string;
}

export async function getInvoices(
  organizationId: string,
  options: InvoiceListOptions = {},
) {
  const timeZone = options.timeZone ?? "UTC";
  const todayIso = getTodayIsoDateInTimeZone(timeZone);

  const conditions: SQL[] = [eq(invoice.organizationId, organizationId)];

  if (options.status && options.status !== "all") {
    if (options.status === "overdue") {
      conditions.push(eq(invoice.status, "sent"), lt(invoice.dueDate, todayIso));
    } else if (options.status === "sent") {
      conditions.push(
        eq(invoice.status, "sent"),
        gte(invoice.dueDate, todayIso),
      );
    } else {
      conditions.push(eq(invoice.status, options.status));
    }
  }

  if (options.from) {
    conditions.push(gte(invoice.dueDate, options.from));
  }

  if (options.to) {
    conditions.push(lte(invoice.dueDate, options.to));
  }

  const rows = await db
    .select({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: customer.name,
      status: invoice.status,
      dueDate: invoice.dueDate,
      totalCents: invoice.totalCents,
      amountPaidCents: invoice.amountPaidCents,
      amountDueCents: invoice.amountDueCents,
      hasPaymentHistory: invoice.hasPaymentHistory,
      updatedAt: invoice.updatedAt,
      createdAt: invoice.createdAt,
    })
    .from(invoice)
    .innerJoin(customer, eq(invoice.customerId, customer.id))
    .where(and(...conditions))
    .orderBy(desc(invoice.updatedAt));

  return rows.map((row) => ({
    ...row,
    status: row.status as InvoicePersistedStatus,
    displayStatus: deriveInvoiceDisplayStatus(
      row.status as InvoicePersistedStatus,
      row.dueDate,
      timeZone,
      row.amountPaidCents,
      row.amountDueCents,
    ),
  })) satisfies InvoiceListItem[];
}

export async function getInvoiceById(
  organizationId: string,
  invoiceId: string,
  timeZone = "UTC",
) {
  const [row] = await db
    .select({
      id: invoice.id,
      organizationId: invoice.organizationId,
      customerId: invoice.customerId,
      customerName: customer.name,
      customerIsActive: customer.isActive,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      notes: invoice.notes,
      terms: invoice.terms,
      discountType: invoice.discountType,
      discountRateHundredths: invoice.discountRateHundredths,
      discountAmountCents: invoice.discountAmountCents,
      subtotalCents: invoice.subtotalCents,
      discountCents: invoice.discountCents,
      taxRateHundredths: invoice.taxRateHundredths,
      taxCents: invoice.taxCents,
      totalCents: invoice.totalCents,
      amountPaidCents: invoice.amountPaidCents,
      amountDueCents: invoice.amountDueCents,
      hasPaymentHistory: invoice.hasPaymentHistory,
      sentAt: invoice.sentAt,
      voidedAt: invoice.voidedAt,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    })
    .from(invoice)
    .innerJoin(customer, eq(invoice.customerId, customer.id))
    .where(and(eq(invoice.organizationId, organizationId), eq(invoice.id, invoiceId)));

  if (!row) {
    return null;
  }

  const lineItems = await db
    .select({
      id: invoiceLineItem.id,
      position: invoiceLineItem.position,
      description: invoiceLineItem.description,
      quantityHundredths: invoiceLineItem.quantityHundredths,
      unitPriceCents: invoiceLineItem.unitPriceCents,
      lineTotalCents: invoiceLineItem.lineTotalCents,
    })
    .from(invoiceLineItem)
    .where(
      and(
        eq(invoiceLineItem.organizationId, organizationId),
        eq(invoiceLineItem.invoiceId, invoiceId),
      ),
    )
    .orderBy(invoiceLineItem.position);

  const payments = await db
    .select({
      id: invoicePayment.id,
      amountCents: invoicePayment.amountCents,
      paymentDate: invoicePayment.paymentDate,
      method: invoicePayment.method,
      methodDetail: invoicePayment.methodDetail,
      notes: invoicePayment.notes,
      createdByUserId: invoicePayment.createdByUserId,
      createdByUserName: user.name,
      createdAt: invoicePayment.createdAt,
      updatedAt: invoicePayment.updatedAt,
    })
    .from(invoicePayment)
    .leftJoin(user, eq(invoicePayment.createdByUserId, user.id))
    .where(
      and(
        eq(invoicePayment.organizationId, organizationId),
        eq(invoicePayment.invoiceId, invoiceId),
      ),
    )
    .orderBy(desc(invoicePayment.paymentDate), desc(invoicePayment.createdAt));

  const paymentAudits = await db
    .select({
      id: invoicePaymentAudit.id,
      paymentId: invoicePaymentAudit.paymentId,
      action: invoicePaymentAudit.action,
      reason: invoicePaymentAudit.reason,
      beforeStateJson: invoicePaymentAudit.beforeStateJson,
      afterStateJson: invoicePaymentAudit.afterStateJson,
      actorUserId: invoicePaymentAudit.actorUserId,
      actorUserName: user.name,
      createdAt: invoicePaymentAudit.createdAt,
    })
    .from(invoicePaymentAudit)
    .leftJoin(user, eq(invoicePaymentAudit.actorUserId, user.id))
    .where(
      and(
        eq(invoicePaymentAudit.organizationId, organizationId),
        eq(invoicePaymentAudit.invoiceId, invoiceId),
      ),
    )
    .orderBy(desc(invoicePaymentAudit.createdAt), asc(invoicePaymentAudit.id));

  return {
    ...row,
    status: row.status as InvoicePersistedStatus,
    displayStatus: deriveInvoiceDisplayStatus(
      row.status as InvoicePersistedStatus,
      row.dueDate,
      timeZone,
      row.amountPaidCents,
      row.amountDueCents,
    ),
    discountType: row.discountType as "none" | "percentage" | "fixed",
    lineItems,
    payments,
    paymentAudits: paymentAudits.map((audit) => ({
      ...audit,
      action: audit.action as "create" | "update" | "delete",
    })),
  } satisfies InvoiceDetailRecord;
}

export async function getActiveInvoiceCustomers(organizationId: string) {
  return db
    .select({
      id: customer.id,
      name: customer.name,
      isActive: customer.isActive,
    })
    .from(customer)
    .where(
      and(eq(customer.organizationId, organizationId), eq(customer.isActive, true)),
    )
    .orderBy(customer.name);
}

export async function getCustomerInvoiceSummary(
  organizationId: string,
  customerId: string,
  timeZone = "UTC",
) {
  const rows = await db
    .select({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      dueDate: invoice.dueDate,
      totalCents: invoice.totalCents,
      amountPaidCents: invoice.amountPaidCents,
      amountDueCents: invoice.amountDueCents,
      updatedAt: invoice.updatedAt,
      createdAt: invoice.createdAt,
    })
    .from(invoice)
    .where(
      and(eq(invoice.organizationId, organizationId), eq(invoice.customerId, customerId)),
    )
    .orderBy(desc(invoice.updatedAt));

  const invoices = rows.map((row) => ({
    ...row,
    status: row.status as InvoicePersistedStatus,
    displayStatus: deriveInvoiceDisplayStatus(
      row.status as InvoicePersistedStatus,
      row.dueDate,
      timeZone,
      row.amountPaidCents,
      row.amountDueCents,
    ),
  }));

  const outstandingBalanceCents = invoices.reduce((sum, current) => {
    if (current.status !== "sent") {
      return sum;
    }

    if (current.amountDueCents > 0) {
      return sum + current.amountDueCents;
    }
    return sum;
  }, 0);

  return {
    outstandingBalanceCents,
    invoices,
  };
}
