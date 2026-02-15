import { describe, expect, it } from "vitest";

import {
  assertTransition,
  canTransitionInvoiceStatus,
  deriveInvoiceDisplayStatus,
  INVOICE_PERSISTED_STATUSES,
  type InvoicePersistedStatus,
} from "@/lib/domain/invoice-status";

const ALLOWED_TRANSITIONS: Record<InvoicePersistedStatus, InvoicePersistedStatus[]> = {
  draft: ["sent", "void"],
  sent: ["void"],
  paid: [],
  void: [],
};

describe("invoice transition matrix", () => {
  for (const fromStatus of INVOICE_PERSISTED_STATUSES) {
    for (const toStatus of INVOICE_PERSISTED_STATUSES) {
      it(`handles transition ${fromStatus} -> ${toStatus}`, () => {
        if (fromStatus === toStatus) {
          expect(canTransitionInvoiceStatus(fromStatus, toStatus)).toBe(false);
          expect(assertTransition(fromStatus, toStatus)).toEqual({
            ok: false,
            error: "Invoice is already in that status",
          });
          return;
        }

        const isAllowed = ALLOWED_TRANSITIONS[fromStatus].includes(toStatus);
        expect(canTransitionInvoiceStatus(fromStatus, toStatus)).toBe(isAllowed);

        if (isAllowed) {
          expect(assertTransition(fromStatus, toStatus)).toEqual({ ok: true });
          return;
        }

        expect(assertTransition(fromStatus, toStatus)).toEqual({
          ok: false,
          error: `Cannot transition invoice from ${fromStatus} to ${toStatus}`,
        });
      });
    }
  }
});

describe("deriveInvoiceDisplayStatus", () => {
  it("returns partially_paid when invoice is sent with positive paid and due balance", () => {
    const status = deriveInvoiceDisplayStatus(
      "sent",
      "2999-12-31",
      "UTC",
      100,
      900,
    );

    expect(status).toBe("partially_paid");
  });

  it("returns overdue when sent invoice due date is in the past", () => {
    const status = deriveInvoiceDisplayStatus(
      "sent",
      "2000-01-01",
      "UTC",
      0,
      1000,
    );

    expect(status).toBe("overdue");
  });
});
