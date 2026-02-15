import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const mockGetRequiredOrganization = vi.fn();
  const mockGetRequiredSession = vi.fn();
  const mockRequireOwnerRole = vi.fn();

  const selectQueue: unknown[][] = [];
  const selectWhereMock = vi.fn(async () => selectQueue.shift() ?? []);
  const selectFromMock = vi.fn(() => ({
    where: selectWhereMock,
  }));
  const selectMock = vi.fn(() => ({
    from: selectFromMock,
  }));

  const transactionMock = vi.fn();

  const dbMock = {
    select: selectMock,
    transaction: transactionMock,
  };

  return {
    mockGetRequiredOrganization,
    mockGetRequiredSession,
    mockRequireOwnerRole,
    selectQueue,
    transactionMock,
    dbMock,
  };
});

vi.mock("@/lib/db", () => ({
  db: mocks.dbMock,
}));

vi.mock("@/lib/queries/workspace", () => ({
  getRequiredOrganization: mocks.mockGetRequiredOrganization,
  getRequiredSession: mocks.mockGetRequiredSession,
}));

vi.mock("@/lib/queries/members", () => ({
  requireOwnerRole: mocks.mockRequireOwnerRole,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  createInvoicePayment,
  updateInvoicePayment,
} from "@/lib/actions/payment";

function queueSelectResult(rows: unknown[]) {
  mocks.selectQueue.push(rows);
}

function buildPaymentInput(amount: number) {
  return {
    amount,
    paymentDate: "2026-02-15",
    method: "cash" as const,
    methodDetail: "",
    notes: "",
  };
}

describe("payment action hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.selectQueue.length = 0;

    mocks.mockGetRequiredOrganization.mockResolvedValue({
      organizationId: "org_a",
    });
    mocks.mockGetRequiredSession.mockResolvedValue({
      user: { id: "user_1" },
    });
    mocks.mockRequireOwnerRole.mockResolvedValue(undefined);
  });

  it("rejects overpayment during create path with no persisted mutation", async () => {
    queueSelectResult([
      {
        id: "inv_1",
        customerId: "cust_1",
        status: "sent",
        totalCents: 1000,
        sentAt: null,
      },
    ]);
    queueSelectResult([{ amountCents: 900 }]);

    const result = await createInvoicePayment("inv_1", buildPaymentInput(2));

    expect(result).toEqual({
      error: "Payment amount cannot exceed the remaining balance",
    });
    expect(mocks.transactionMock).not.toHaveBeenCalled();
  });

  it("rejects overpayment during update path with no persisted mutation", async () => {
    queueSelectResult([
      {
        id: "inv_1",
        customerId: "cust_1",
        status: "sent",
        totalCents: 1000,
        sentAt: null,
      },
    ]);
    queueSelectResult([
      {
        id: "pay_1",
        amountCents: 400,
        paymentDate: "2026-02-14",
        method: "cash",
        methodDetail: null,
        notes: null,
        createdByUserId: "user_1",
        createdAt: new Date("2026-02-14T00:00:00.000Z"),
        updatedAt: new Date("2026-02-14T00:00:00.000Z"),
      },
    ]);
    queueSelectResult([
      { id: "pay_1", amountCents: 400 },
      { id: "pay_2", amountCents: 700 },
    ]);

    const result = await updateInvoicePayment("inv_1", "pay_1", {
      ...buildPaymentInput(5),
      reason: "Correction",
    });

    expect(result).toEqual({
      error: "Payment amount cannot exceed the remaining balance",
    });
    expect(mocks.transactionMock).not.toHaveBeenCalled();
  });

  it("accepts exact remaining-balance payment and settles invoice state", async () => {
    queueSelectResult([
      {
        id: "inv_1",
        customerId: "cust_1",
        status: "sent",
        totalCents: 1000,
        sentAt: new Date("2026-02-14T00:00:00.000Z"),
      },
    ]);
    queueSelectResult([{ amountCents: 900 }]);

    const insertedPayment = {
      id: "pay_new",
      invoiceId: "inv_1",
      amountCents: 100,
      paymentDate: "2026-02-15",
      method: "cash",
      methodDetail: null,
      notes: null,
      createdByUserId: "user_1",
      createdAt: new Date("2026-02-15T00:00:00.000Z"),
    };

    const invoiceUpdatePayloads: Array<Record<string, unknown>> = [];
    let insertCallCount = 0;
    const tx = {
      insert: vi.fn(() => {
        insertCallCount += 1;
        if (insertCallCount === 1) {
          return {
            values: vi.fn(() => ({
              returning: vi.fn(async () => [insertedPayment]),
            })),
          };
        }
        return {
          values: vi.fn(async () => undefined),
        };
      }),
      update: vi.fn(() => ({
        set: vi.fn((values: Record<string, unknown>) => {
          invoiceUpdatePayloads.push(values);
          return {
            where: vi.fn(async () => undefined),
          };
        }),
      })),
    };

    mocks.transactionMock.mockImplementationOnce(
      async (callback: (txClient: typeof tx) => Promise<unknown>) =>
        callback(tx),
    );

    const result = await createInvoicePayment("inv_1", buildPaymentInput(1));

    expect(result).toEqual({
      data: insertedPayment,
    });
    expect(mocks.transactionMock).toHaveBeenCalledTimes(1);
    expect(invoiceUpdatePayloads[0]).toMatchObject({
      status: "paid",
      amountPaidCents: 1000,
      amountDueCents: 0,
      hasPaymentHistory: true,
    });
  });
});
