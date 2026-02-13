"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";

import { db } from "@/lib/db";
import {
  invoice,
  invoicePayment,
  invoicePaymentAudit,
} from "@/lib/db/schema";
import {
  recomputeInvoicePaymentBalance,
  derivePersistedStatusAfterPaymentMutation,
} from "@/lib/domain/invoice-payments";
import type { InvoicePersistedStatus } from "@/lib/domain/invoice-status";
import { requireOwnerRole } from "@/lib/queries/members";
import { getRequiredOrganization, getRequiredSession } from "@/lib/queries/workspace";
import {
  createInvoicePaymentSchema,
  deleteInvoicePaymentSchema,
  updateInvoicePaymentSchema,
} from "@/lib/validations/payment";

function toCents(value: number): number {
  return Math.round(value * 100);
}

function revalidateInvoicePaths(invoiceId: string, customerId: string) {
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
}

async function getInvoiceForPayment(organizationId: string, invoiceId: string) {
  const [record] = await db
    .select({
      id: invoice.id,
      customerId: invoice.customerId,
      status: invoice.status,
      totalCents: invoice.totalCents,
      sentAt: invoice.sentAt,
    })
    .from(invoice)
    .where(and(eq(invoice.organizationId, organizationId), eq(invoice.id, invoiceId)));

  return record;
}

export async function createInvoicePayment(invoiceId: string, input: unknown) {
  const { organizationId } = await getRequiredOrganization();
  const session = await getRequiredSession();
  const parsed = createInvoicePaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid payment data" };
  }

  const targetInvoice = await getInvoiceForPayment(organizationId, invoiceId);
  if (!targetInvoice) {
    return { error: "Invoice not found" };
  }

  if (targetInvoice.status === "void") {
    return { error: "Cannot record payments for void invoices" };
  }

  const amountCents = toCents(parsed.data.amount);

  const currentPayments = await db
    .select({
      amountCents: invoicePayment.amountCents,
    })
    .from(invoicePayment)
    .where(
      and(
        eq(invoicePayment.organizationId, organizationId),
        eq(invoicePayment.invoiceId, invoiceId),
      ),
    );

  const projectedBalance = recomputeInvoicePaymentBalance(targetInvoice.totalCents, [
    ...currentPayments,
    { amountCents },
  ]);

  if (projectedBalance.isOverpaid) {
    return { error: "Payment amount cannot exceed the remaining balance" };
  }

  const normalizedStatus: InvoicePersistedStatus =
    targetInvoice.status === "draft"
      ? "sent"
      : (targetInvoice.status as InvoicePersistedStatus);
  const nextStatus = derivePersistedStatusAfterPaymentMutation(
    normalizedStatus,
    projectedBalance.amountDueCents,
  );

  const paymentId = createId();
  const actorUserId = session.user.id;

  const paymentValues = {
    id: paymentId,
    organizationId,
    invoiceId,
    amountCents,
    paymentDate: parsed.data.paymentDate,
    method: parsed.data.method,
    methodDetail: parsed.data.methodDetail?.trim() || null,
    notes: parsed.data.notes?.trim() || null,
    createdByUserId: actorUserId,
  };

  try {
    const created = await db.transaction(async (tx) => {
      if (targetInvoice.status === "draft") {
        await tx
          .update(invoice)
          .set({
            status: "sent",
            sentAt: targetInvoice.sentAt ?? new Date(),
          })
          .where(
            and(eq(invoice.organizationId, organizationId), eq(invoice.id, invoiceId)),
          );
      }

      const [insertedPayment] = await tx
        .insert(invoicePayment)
        .values(paymentValues)
        .returning({
          id: invoicePayment.id,
          invoiceId: invoicePayment.invoiceId,
          amountCents: invoicePayment.amountCents,
          paymentDate: invoicePayment.paymentDate,
          method: invoicePayment.method,
          methodDetail: invoicePayment.methodDetail,
          notes: invoicePayment.notes,
          createdByUserId: invoicePayment.createdByUserId,
          createdAt: invoicePayment.createdAt,
        });

      await tx
        .update(invoice)
        .set({
          status: nextStatus,
          amountPaidCents: projectedBalance.amountPaidCents,
          amountDueCents: projectedBalance.amountDueCents,
          hasPaymentHistory: projectedBalance.hasPaymentHistory,
          sentAt:
            targetInvoice.status === "draft"
              ? targetInvoice.sentAt ?? new Date()
              : targetInvoice.sentAt,
        })
        .where(and(eq(invoice.organizationId, organizationId), eq(invoice.id, invoiceId)));

      await tx.insert(invoicePaymentAudit).values({
        id: createId(),
        organizationId,
        invoiceId,
        paymentId,
        action: "create",
        reason: "Payment created",
        beforeStateJson: null,
        afterStateJson: JSON.stringify(insertedPayment),
        actorUserId,
      });

      return insertedPayment;
    });

    revalidateInvoicePaths(invoiceId, targetInvoice.customerId);
    return { data: created };
  } catch {
    return { error: "Failed to record payment" };
  }
}

export async function updateInvoicePayment(
  invoiceId: string,
  paymentId: string,
  input: unknown,
) {
  try {
    await requireOwnerRole();
  } catch {
    return { error: "Only owners can edit payments" };
  }

  const { organizationId } = await getRequiredOrganization();
  const session = await getRequiredSession();
  const parsed = updateInvoicePaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid payment update data" };
  }

  const targetInvoice = await getInvoiceForPayment(organizationId, invoiceId);
  if (!targetInvoice) {
    return { error: "Invoice not found" };
  }

  if (targetInvoice.status === "void") {
    return { error: "Cannot edit payments for void invoices" };
  }

  const [existingPayment] = await db
    .select({
      id: invoicePayment.id,
      amountCents: invoicePayment.amountCents,
      paymentDate: invoicePayment.paymentDate,
      method: invoicePayment.method,
      methodDetail: invoicePayment.methodDetail,
      notes: invoicePayment.notes,
      createdByUserId: invoicePayment.createdByUserId,
      createdAt: invoicePayment.createdAt,
      updatedAt: invoicePayment.updatedAt,
    })
    .from(invoicePayment)
    .where(
      and(
        eq(invoicePayment.organizationId, organizationId),
        eq(invoicePayment.invoiceId, invoiceId),
        eq(invoicePayment.id, paymentId),
      ),
    );

  if (!existingPayment) {
    return { error: "Payment not found" };
  }

  const updatedAmountCents = toCents(parsed.data.amount);
  const remainingPayments = await db
    .select({
      id: invoicePayment.id,
      amountCents: invoicePayment.amountCents,
    })
    .from(invoicePayment)
    .where(
      and(
        eq(invoicePayment.organizationId, organizationId),
        eq(invoicePayment.invoiceId, invoiceId),
      ),
    );

  const recomputeInput = remainingPayments.map((payment) => ({
    amountCents:
      payment.id === existingPayment.id ? updatedAmountCents : payment.amountCents,
  }));

  const projectedBalance = recomputeInvoicePaymentBalance(
    targetInvoice.totalCents,
    recomputeInput,
  );

  if (projectedBalance.isOverpaid) {
    return { error: "Payment amount cannot exceed the remaining balance" };
  }

  const nextStatus = derivePersistedStatusAfterPaymentMutation(
    targetInvoice.status as InvoicePersistedStatus,
    projectedBalance.amountDueCents,
  );

  const actorUserId = session.user.id;

  try {
    const result = await db.transaction(async (tx) => {
      const [updatedPayment] = await tx
        .update(invoicePayment)
        .set({
          amountCents: updatedAmountCents,
          paymentDate: parsed.data.paymentDate,
          method: parsed.data.method,
          methodDetail: parsed.data.methodDetail?.trim() || null,
          notes: parsed.data.notes?.trim() || null,
        })
        .where(
          and(
            eq(invoicePayment.organizationId, organizationId),
            eq(invoicePayment.invoiceId, invoiceId),
            eq(invoicePayment.id, paymentId),
          ),
        )
        .returning({
          id: invoicePayment.id,
          amountCents: invoicePayment.amountCents,
          paymentDate: invoicePayment.paymentDate,
          method: invoicePayment.method,
          methodDetail: invoicePayment.methodDetail,
          notes: invoicePayment.notes,
          createdByUserId: invoicePayment.createdByUserId,
          createdAt: invoicePayment.createdAt,
          updatedAt: invoicePayment.updatedAt,
        });

      await tx
        .update(invoice)
        .set({
          status: nextStatus,
          amountPaidCents: projectedBalance.amountPaidCents,
          amountDueCents: projectedBalance.amountDueCents,
          hasPaymentHistory: projectedBalance.hasPaymentHistory,
        })
        .where(and(eq(invoice.organizationId, organizationId), eq(invoice.id, invoiceId)));

      await tx.insert(invoicePaymentAudit).values({
        id: createId(),
        organizationId,
        invoiceId,
        paymentId,
        action: "update",
        reason: parsed.data.reason.trim(),
        beforeStateJson: JSON.stringify(existingPayment),
        afterStateJson: JSON.stringify(updatedPayment),
        actorUserId,
      });

      return updatedPayment;
    });

    revalidateInvoicePaths(invoiceId, targetInvoice.customerId);
    return { data: result };
  } catch {
    return { error: "Failed to update payment" };
  }
}

export async function deleteInvoicePayment(
  invoiceId: string,
  paymentId: string,
  input: unknown,
) {
  try {
    await requireOwnerRole();
  } catch {
    return { error: "Only owners can delete payments" };
  }

  const { organizationId } = await getRequiredOrganization();
  const session = await getRequiredSession();
  const parsed = deleteInvoicePaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid delete request" };
  }

  const targetInvoice = await getInvoiceForPayment(organizationId, invoiceId);
  if (!targetInvoice) {
    return { error: "Invoice not found" };
  }

  if (targetInvoice.status === "void") {
    return { error: "Cannot delete payments for void invoices" };
  }

  const [existingPayment] = await db
    .select({
      id: invoicePayment.id,
      amountCents: invoicePayment.amountCents,
      paymentDate: invoicePayment.paymentDate,
      method: invoicePayment.method,
      methodDetail: invoicePayment.methodDetail,
      notes: invoicePayment.notes,
      createdByUserId: invoicePayment.createdByUserId,
      createdAt: invoicePayment.createdAt,
      updatedAt: invoicePayment.updatedAt,
    })
    .from(invoicePayment)
    .where(
      and(
        eq(invoicePayment.organizationId, organizationId),
        eq(invoicePayment.invoiceId, invoiceId),
        eq(invoicePayment.id, paymentId),
      ),
    );

  if (!existingPayment) {
    return { error: "Payment not found" };
  }

  const actorUserId = session.user.id;

  try {
    await db.transaction(async (tx) => {
      await tx.insert(invoicePaymentAudit).values({
        id: createId(),
        organizationId,
        invoiceId,
        paymentId,
        action: "delete",
        reason: parsed.data.reason.trim(),
        beforeStateJson: JSON.stringify(existingPayment),
        afterStateJson: null,
        actorUserId,
      });

      await tx
        .delete(invoicePayment)
        .where(
          and(
            eq(invoicePayment.organizationId, organizationId),
            eq(invoicePayment.invoiceId, invoiceId),
            eq(invoicePayment.id, paymentId),
          ),
        );

      const remainingPayments = await tx
        .select({ amountCents: invoicePayment.amountCents })
        .from(invoicePayment)
        .where(
          and(
            eq(invoicePayment.organizationId, organizationId),
            eq(invoicePayment.invoiceId, invoiceId),
          ),
        );

      const balance = recomputeInvoicePaymentBalance(
        targetInvoice.totalCents,
        remainingPayments,
      );
      const nextStatus = derivePersistedStatusAfterPaymentMutation(
        targetInvoice.status as InvoicePersistedStatus,
        balance.amountDueCents,
      );

      await tx
        .update(invoice)
        .set({
          status: nextStatus,
          amountPaidCents: balance.amountPaidCents,
          amountDueCents: balance.amountDueCents,
          hasPaymentHistory: balance.hasPaymentHistory,
        })
        .where(and(eq(invoice.organizationId, organizationId), eq(invoice.id, invoiceId)));
    });

    revalidateInvoicePaths(invoiceId, targetInvoice.customerId);
    return { data: { id: paymentId } };
  } catch {
    return { error: "Failed to delete payment" };
  }
}
