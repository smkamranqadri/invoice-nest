"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";

import { db } from "@/lib/db";
import { customer, invoice, invoiceLineItem, invoiceSequence } from "@/lib/db/schema";
import {
  createInvoiceDraftSchema,
  invoiceListFilterSchema,
  updateInvoiceDraftSchema,
  updateSentInvoiceDueDateSchema,
  type InvoiceListFilterInput,
} from "@/lib/validations/invoice";
import { calculateInvoiceTotals } from "@/lib/domain/invoice-totals";
import {
  assertTransition,
  type InvoicePersistedStatus,
} from "@/lib/domain/invoice-status";
import {
  getActiveInvoiceCustomers,
  getInvoiceById as getInvoiceByIdQuery,
  getInvoices as getInvoicesQuery,
} from "@/lib/queries/invoice";
import {
  getOrganizationTimeZone,
  getRequiredOrganization,
} from "@/lib/queries/workspace";
import { requireOwnerRole } from "@/lib/queries/members";
import { getTodayIsoDateInTimeZone } from "@/lib/domain/date";

function revalidateInvoicePaths(invoiceId: string, customerId: string) {
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
}

async function ensureActiveCustomer(
  organizationId: string,
  customerId: string,
  allowInactiveIfCustomerId?: string,
) {
  const [existingCustomer] = await db
    .select({
      id: customer.id,
      isActive: customer.isActive,
    })
    .from(customer)
    .where(and(eq(customer.organizationId, organizationId), eq(customer.id, customerId)));

  if (!existingCustomer) {
    return { error: "Customer not found" as const };
  }

  if (!existingCustomer.isActive) {
    if (allowInactiveIfCustomerId && allowInactiveIfCustomerId === customerId) {
      return { data: existingCustomer };
    }
    return { error: "Cannot create invoice for an inactive customer" as const };
  }

  return { data: existingCustomer };
}

export async function createInvoiceDraft(input: unknown) {
  const { organizationId } = await getRequiredOrganization();
  const parsed = createInvoiceDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid invoice data" };
  }

  const customerCheck = await ensureActiveCustomer(
    organizationId,
    parsed.data.customerId,
  );
  if (customerCheck.error) {
    return { error: customerCheck.error };
  }

  const timeZone = await getOrganizationTimeZone(organizationId);
  const issueDate = getTodayIsoDateInTimeZone(timeZone);
  const totals = calculateInvoiceTotals(parsed.data);
  const invoiceId = createId();

  try {
    const createdInvoice = await db.transaction(async (tx) => {
      const [sequence] = await tx
        .insert(invoiceSequence)
        .values({
          organizationId,
          currentValue: 1,
        })
        .onConflictDoUpdate({
          target: invoiceSequence.organizationId,
          set: {
            currentValue: sql`${invoiceSequence.currentValue} + 1`,
          },
        })
        .returning({
          currentValue: invoiceSequence.currentValue,
        });

      const invoiceNumber = `INV-${String(sequence.currentValue).padStart(4, "0")}`;

      const [created] = await tx
        .insert(invoice)
        .values({
          id: invoiceId,
          organizationId,
          customerId: parsed.data.customerId,
          invoiceNumber,
          status: "draft",
          issueDate,
          dueDate: parsed.data.dueDate,
          notes: parsed.data.notes || null,
          terms: parsed.data.terms || null,
          subtotalCents: totals.subtotalCents,
          discountType: parsed.data.discountType,
          discountRateHundredths: totals.discountRateHundredths,
          discountAmountCents: totals.discountAmountCents,
          discountCents: totals.discountCents,
          taxRateHundredths: totals.taxRateHundredths,
          taxCents: totals.taxCents,
          totalCents: totals.totalCents,
        })
        .returning({
          id: invoice.id,
          customerId: invoice.customerId,
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
        });

      await tx.insert(invoiceLineItem).values(
        totals.lineItems.map((lineItem) => ({
          id: createId(),
          organizationId,
          invoiceId,
          position: lineItem.position,
          description: lineItem.description,
          quantityHundredths: lineItem.quantityHundredths,
          unitPriceCents: lineItem.unitPriceCents,
          lineTotalCents: lineItem.lineTotalCents,
        })),
      );

      return created;
    });

    revalidateInvoicePaths(createdInvoice.id, createdInvoice.customerId);
    return {
      data: {
        id: createdInvoice.id,
        customerId: createdInvoice.customerId,
        invoiceNumber: createdInvoice.invoiceNumber,
        status: createdInvoice.status,
      },
    };
  } catch {
    return { error: "Failed to create invoice draft" };
  }
}

export async function updateInvoiceDraft(invoiceId: string, input: unknown) {
  const { organizationId } = await getRequiredOrganization();
  const parsed = updateInvoiceDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid invoice data" };
  }

  const [existingInvoice] = await db
    .select({
      id: invoice.id,
      status: invoice.status,
      customerId: invoice.customerId,
    })
    .from(invoice)
    .where(and(eq(invoice.organizationId, organizationId), eq(invoice.id, invoiceId)));

  if (!existingInvoice) {
    return { error: "Invoice not found" };
  }

  if (existingInvoice.status !== "draft") {
    return { error: "Only draft invoices can be fully edited" };
  }

  const customerCheck = await ensureActiveCustomer(
    organizationId,
    parsed.data.customerId,
    existingInvoice.customerId,
  );
  if (customerCheck.error) {
    return { error: customerCheck.error };
  }

  const totals = calculateInvoiceTotals(parsed.data);

  try {
    const updatedInvoice = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(invoice)
        .set({
          customerId: parsed.data.customerId,
          dueDate: parsed.data.dueDate,
          notes: parsed.data.notes || null,
          terms: parsed.data.terms || null,
          subtotalCents: totals.subtotalCents,
          discountType: parsed.data.discountType,
          discountRateHundredths: totals.discountRateHundredths,
          discountAmountCents: totals.discountAmountCents,
          discountCents: totals.discountCents,
          taxRateHundredths: totals.taxRateHundredths,
          taxCents: totals.taxCents,
          totalCents: totals.totalCents,
        })
        .where(and(eq(invoice.organizationId, organizationId), eq(invoice.id, invoiceId)))
        .returning({
          id: invoice.id,
          customerId: invoice.customerId,
          status: invoice.status,
        });

      await tx
        .delete(invoiceLineItem)
        .where(
          and(
            eq(invoiceLineItem.organizationId, organizationId),
            eq(invoiceLineItem.invoiceId, invoiceId),
          ),
        );

      await tx.insert(invoiceLineItem).values(
        totals.lineItems.map((lineItem) => ({
          id: createId(),
          organizationId,
          invoiceId,
          position: lineItem.position,
          description: lineItem.description,
          quantityHundredths: lineItem.quantityHundredths,
          unitPriceCents: lineItem.unitPriceCents,
          lineTotalCents: lineItem.lineTotalCents,
        })),
      );

      return updated;
    });

    if (!updatedInvoice) {
      return { error: "Invoice not found" };
    }

    revalidateInvoicePaths(updatedInvoice.id, updatedInvoice.customerId);
    return { data: updatedInvoice };
  } catch {
    return { error: "Failed to update invoice draft" };
  }
}

export async function updateSentInvoiceDueDate(
  invoiceId: string,
  input: unknown,
) {
  const { organizationId } = await getRequiredOrganization();
  const parsed = updateSentInvoiceDueDateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid due date" };
  }

  const [existingInvoice] = await db
    .select({
      id: invoice.id,
      status: invoice.status,
      customerId: invoice.customerId,
    })
    .from(invoice)
    .where(and(eq(invoice.organizationId, organizationId), eq(invoice.id, invoiceId)));

  if (!existingInvoice) {
    return { error: "Invoice not found" };
  }

  if (existingInvoice.status !== "sent") {
    return { error: "Only sent invoices can update due date here" };
  }

  const [updated] = await db
    .update(invoice)
    .set({
      dueDate: parsed.data.dueDate,
    })
    .where(and(eq(invoice.organizationId, organizationId), eq(invoice.id, invoiceId)))
    .returning({
      id: invoice.id,
      customerId: invoice.customerId,
      dueDate: invoice.dueDate,
    });

  if (!updated) {
    return { error: "Invoice not found" };
  }

  revalidateInvoicePaths(updated.id, updated.customerId);
  return { data: updated };
}

export async function sendInvoice(invoiceId: string) {
  const { organizationId } = await getRequiredOrganization();

  const [existingInvoice] = await db
    .select({
      id: invoice.id,
      status: invoice.status,
      customerId: invoice.customerId,
    })
    .from(invoice)
    .where(and(eq(invoice.organizationId, organizationId), eq(invoice.id, invoiceId)));

  if (!existingInvoice) {
    return { error: "Invoice not found" };
  }

  const transition = assertTransition(
    existingInvoice.status as InvoicePersistedStatus,
    "sent",
  );
  if (!transition.ok) {
    return { error: transition.error };
  }

  const [updated] = await db
    .update(invoice)
    .set({
      status: "sent",
      sentAt: new Date(),
    })
    .where(and(eq(invoice.organizationId, organizationId), eq(invoice.id, invoiceId)))
    .returning({
      id: invoice.id,
      customerId: invoice.customerId,
      status: invoice.status,
    });

  if (!updated) {
    return { error: "Invoice not found" };
  }

  revalidateInvoicePaths(updated.id, updated.customerId);
  return { data: updated };
}

export async function voidInvoice(invoiceId: string) {
  try {
    await requireOwnerRole();
  } catch {
    return { error: "Only owners can void invoices" };
  }

  const { organizationId } = await getRequiredOrganization();

  const [existingInvoice] = await db
    .select({
      id: invoice.id,
      status: invoice.status,
      customerId: invoice.customerId,
    })
    .from(invoice)
    .where(and(eq(invoice.organizationId, organizationId), eq(invoice.id, invoiceId)));

  if (!existingInvoice) {
    return { error: "Invoice not found" };
  }

  const transition = assertTransition(
    existingInvoice.status as InvoicePersistedStatus,
    "void",
  );
  if (!transition.ok) {
    return { error: transition.error };
  }

  const [updated] = await db
    .update(invoice)
    .set({
      status: "void",
      voidedAt: new Date(),
    })
    .where(and(eq(invoice.organizationId, organizationId), eq(invoice.id, invoiceId)))
    .returning({
      id: invoice.id,
      customerId: invoice.customerId,
      status: invoice.status,
    });

  if (!updated) {
    return { error: "Invoice not found" };
  }

  revalidateInvoicePaths(updated.id, updated.customerId);
  return { data: updated };
}

export async function getInvoiceById(invoiceId: string) {
  const { organizationId } = await getRequiredOrganization();
  const timeZone = await getOrganizationTimeZone(organizationId);

  return {
    data: await getInvoiceByIdQuery(organizationId, invoiceId, timeZone),
  };
}

export async function getInvoices(input?: unknown) {
  const { organizationId } = await getRequiredOrganization();
  const parsed = invoiceListFilterSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return { error: "Invalid invoice filters" };
  }

  const filters = parsed.data as InvoiceListFilterInput;
  const timeZone = await getOrganizationTimeZone(organizationId);

  return {
    data: await getInvoicesQuery(organizationId, {
      ...filters,
      timeZone,
    }),
  };
}

export async function getInvoiceCustomers() {
  const { organizationId } = await getRequiredOrganization();
  return {
    data: await getActiveInvoiceCustomers(organizationId),
  };
}
