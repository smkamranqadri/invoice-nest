import type { InvoicePersistedStatus } from "@/lib/domain/invoice-status";

export interface InvoicePaymentAmountInput {
  amountCents: number;
}

export interface InvoicePaymentBalanceResult {
  amountPaidCents: number;
  amountDueCents: number;
  hasPaymentHistory: boolean;
  isOverpaid: boolean;
}

function sumPaymentCents(payments: InvoicePaymentAmountInput[]): number {
  return payments.reduce((sum, payment) => sum + payment.amountCents, 0);
}

export function recomputeInvoicePaymentBalance(
  totalCents: number,
  payments: InvoicePaymentAmountInput[],
): InvoicePaymentBalanceResult {
  const rawPaidCents = sumPaymentCents(payments);
  const amountPaidCents = Math.max(0, rawPaidCents);
  const amountDueCents = Math.max(0, totalCents - amountPaidCents);

  return {
    amountPaidCents,
    amountDueCents,
    hasPaymentHistory: payments.length > 0,
    isOverpaid: rawPaidCents > totalCents,
  };
}

export function derivePersistedStatusAfterPaymentMutation(
  currentStatus: InvoicePersistedStatus,
  amountDueCents: number,
): InvoicePersistedStatus {
  if (currentStatus === "void") {
    return "void";
  }

  if (amountDueCents === 0) {
    return "paid";
  }

  return "sent";
}
