import {
  and,
  asc,
  desc,
  eq,
  gte,
  lte,
  lt,
  type SQL,
} from "drizzle-orm";

import { db } from "@/lib/db";
import { customer, invoice, invoicePayment } from "@/lib/db/schema";
import {
  deriveInvoiceDisplayStatus,
  type InvoiceDisplayStatus,
  type InvoicePersistedStatus,
} from "@/lib/domain/invoice-status";
import type { ExportQueryInput } from "@/lib/validations/export";
import { getTodayIsoDateInTimeZone } from "@/lib/domain/date";

function getInvoiceStatusConditions(
  organizationId: string,
  status: ExportQueryInput["status"],
  timeZone: string,
): SQL[] {
  const conditions: SQL[] = [eq(invoice.organizationId, organizationId)];
  const todayIso = getTodayIsoDateInTimeZone(timeZone);

  if (!status || status === "all") {
    return conditions;
  }

  if (status === "overdue") {
    conditions.push(eq(invoice.status, "sent"), lt(invoice.dueDate, todayIso));
    return conditions;
  }

  if (status === "sent") {
    conditions.push(eq(invoice.status, "sent"), gte(invoice.dueDate, todayIso));
    return conditions;
  }

  conditions.push(eq(invoice.status, status));
  return conditions;
}

export interface InvoiceExportRow {
  invoiceNumber: string;
  customerName: string;
  persistedStatus: InvoicePersistedStatus;
  displayStatus: InvoiceDisplayStatus;
  issueDate: string;
  dueDate: string;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  amountPaidCents: number;
  amountDueCents: number;
  updatedAt: Date;
}

export interface PaymentExportRow {
  invoiceNumber: string;
  customerName: string;
  invoiceDisplayStatus: InvoiceDisplayStatus;
  paymentDate: string;
  amountCents: number;
  method: string;
  methodDetail: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface CombinedExportRow {
  invoiceNumber: string;
  customerName: string;
  invoiceDisplayStatus: InvoiceDisplayStatus;
  invoiceTotalCents: number;
  invoiceAmountDueCents: number;
  paymentDate: string | null;
  paymentAmountCents: number | null;
  paymentMethod: string | null;
  paymentNotes: string | null;
}

export async function getInvoiceExportRows(
  organizationId: string,
  filters: ExportQueryInput,
  timeZone: string,
): Promise<InvoiceExportRow[]> {
  const conditions = getInvoiceStatusConditions(organizationId, filters.status, timeZone);

  if (filters.from) {
    conditions.push(gte(invoice.dueDate, filters.from));
  }

  if (filters.to) {
    conditions.push(lte(invoice.dueDate, filters.to));
  }

  const rows = await db
    .select({
      invoiceNumber: invoice.invoiceNumber,
      customerName: customer.name,
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      subtotalCents: invoice.subtotalCents,
      discountCents: invoice.discountCents,
      taxCents: invoice.taxCents,
      totalCents: invoice.totalCents,
      amountPaidCents: invoice.amountPaidCents,
      amountDueCents: invoice.amountDueCents,
      updatedAt: invoice.updatedAt,
    })
    .from(invoice)
    .innerJoin(customer, eq(invoice.customerId, customer.id))
    .where(and(...conditions))
    .orderBy(desc(invoice.updatedAt));

  return rows.map((row) => ({
    invoiceNumber: row.invoiceNumber,
    customerName: row.customerName,
    persistedStatus: row.status as InvoicePersistedStatus,
    displayStatus: deriveInvoiceDisplayStatus(
      row.status as InvoicePersistedStatus,
      row.dueDate,
      timeZone,
      row.amountPaidCents,
      row.amountDueCents,
    ),
    issueDate: row.issueDate,
    dueDate: row.dueDate,
    subtotalCents: row.subtotalCents,
    discountCents: row.discountCents,
    taxCents: row.taxCents,
    totalCents: row.totalCents,
    amountPaidCents: row.amountPaidCents,
    amountDueCents: row.amountDueCents,
    updatedAt: row.updatedAt,
  }));
}

export async function getPaymentExportRows(
  organizationId: string,
  filters: ExportQueryInput,
  timeZone: string,
): Promise<PaymentExportRow[]> {
  const invoiceConditions = getInvoiceStatusConditions(
    organizationId,
    filters.status,
    timeZone,
  ).slice(1);
  const paymentConditions: SQL[] = [
    eq(invoicePayment.organizationId, organizationId),
    eq(invoice.organizationId, organizationId),
    ...invoiceConditions,
  ];

  if (filters.from) {
    paymentConditions.push(gte(invoicePayment.paymentDate, filters.from));
  }

  if (filters.to) {
    paymentConditions.push(lte(invoicePayment.paymentDate, filters.to));
  }

  const rows = await db
    .select({
      invoiceNumber: invoice.invoiceNumber,
      customerName: customer.name,
      invoiceStatus: invoice.status,
      dueDate: invoice.dueDate,
      invoiceAmountPaidCents: invoice.amountPaidCents,
      invoiceAmountDueCents: invoice.amountDueCents,
      paymentDate: invoicePayment.paymentDate,
      amountCents: invoicePayment.amountCents,
      method: invoicePayment.method,
      methodDetail: invoicePayment.methodDetail,
      notes: invoicePayment.notes,
      createdAt: invoicePayment.createdAt,
    })
    .from(invoicePayment)
    .innerJoin(invoice, eq(invoicePayment.invoiceId, invoice.id))
    .innerJoin(customer, eq(invoice.customerId, customer.id))
    .where(and(...paymentConditions))
    .orderBy(desc(invoicePayment.paymentDate), desc(invoicePayment.createdAt));

  return rows.map((row) => ({
    invoiceNumber: row.invoiceNumber,
    customerName: row.customerName,
    invoiceDisplayStatus: deriveInvoiceDisplayStatus(
      row.invoiceStatus as InvoicePersistedStatus,
      row.dueDate,
      timeZone,
      row.invoiceAmountPaidCents,
      row.invoiceAmountDueCents,
    ),
    paymentDate: row.paymentDate,
    amountCents: row.amountCents,
    method: row.method,
    methodDetail: row.methodDetail,
    notes: row.notes,
    createdAt: row.createdAt,
  }));
}

export async function getCombinedExportRows(
  organizationId: string,
  filters: ExportQueryInput,
  timeZone: string,
): Promise<CombinedExportRow[]> {
  const conditions = getInvoiceStatusConditions(organizationId, filters.status, timeZone);

  if (filters.from) {
    conditions.push(gte(invoice.dueDate, filters.from));
  }

  if (filters.to) {
    conditions.push(lte(invoice.dueDate, filters.to));
  }

  const rows = await db
    .select({
      invoiceNumber: invoice.invoiceNumber,
      customerName: customer.name,
      invoiceStatus: invoice.status,
      dueDate: invoice.dueDate,
      amountPaidCents: invoice.amountPaidCents,
      amountDueCents: invoice.amountDueCents,
      totalCents: invoice.totalCents,
      paymentDate: invoicePayment.paymentDate,
      paymentAmountCents: invoicePayment.amountCents,
      paymentMethod: invoicePayment.method,
      paymentNotes: invoicePayment.notes,
    })
    .from(invoice)
    .innerJoin(customer, eq(invoice.customerId, customer.id))
    .leftJoin(invoicePayment, eq(invoice.id, invoicePayment.invoiceId))
    .where(and(...conditions))
    .orderBy(desc(invoice.updatedAt), asc(invoicePayment.paymentDate));

  return rows.map((row) => ({
    invoiceNumber: row.invoiceNumber,
    customerName: row.customerName,
    invoiceDisplayStatus: deriveInvoiceDisplayStatus(
      row.invoiceStatus as InvoicePersistedStatus,
      row.dueDate,
      timeZone,
      row.amountPaidCents,
      row.amountDueCents,
    ),
    invoiceTotalCents: row.totalCents,
    invoiceAmountDueCents: row.amountDueCents,
    paymentDate: row.paymentDate,
    paymentAmountCents: row.paymentAmountCents,
    paymentMethod: row.paymentMethod,
    paymentNotes: row.paymentNotes,
  }));
}
