import { getTodayIsoDateInTimeZone } from "./date";

export const INVOICE_PERSISTED_STATUSES = [
  "draft",
  "sent",
  "paid",
  "void",
] as const;

export type InvoicePersistedStatus = (typeof INVOICE_PERSISTED_STATUSES)[number];
export type InvoiceDisplayStatus =
  | InvoicePersistedStatus
  | "overdue"
  | "partially_paid";

const TRANSITIONS: Record<InvoicePersistedStatus, InvoicePersistedStatus[]> = {
  draft: ["sent", "void"],
  sent: ["void"],
  paid: [],
  void: [],
};

export function canTransitionInvoiceStatus(
  from: InvoicePersistedStatus,
  to: InvoicePersistedStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(
  from: InvoicePersistedStatus,
  to: InvoicePersistedStatus,
): { ok: true } | { ok: false; error: string } {
  if (from === to) {
    return { ok: false, error: "Invoice is already in that status" };
  }

  if (!canTransitionInvoiceStatus(from, to)) {
    return {
      ok: false,
      error: `Cannot transition invoice from ${from} to ${to}`,
    };
  }

  return { ok: true };
}

export function deriveInvoiceDisplayStatus(
  status: InvoicePersistedStatus,
  dueDateIso: string,
  timeZone: string,
  amountPaidCents = 0,
  amountDueCents = 0,
): InvoiceDisplayStatus {
  if (status !== "sent") {
    return status;
  }

  const today = getTodayIsoDateInTimeZone(timeZone);
  if (dueDateIso < today) {
    return "overdue";
  }

  if (amountPaidCents > 0 && amountDueCents > 0) {
    return "partially_paid";
  }

  return "sent";
}

export function canEditInvoiceDraftFields(status: InvoicePersistedStatus): boolean {
  return status === "draft";
}

export function canEditInvoiceDueDate(status: InvoicePersistedStatus): boolean {
  return status === "draft" || status === "sent" || status === "paid";
}

export function canEditInvoiceNonFinancial(status: InvoicePersistedStatus): boolean {
  return status === "sent" || status === "paid";
}
