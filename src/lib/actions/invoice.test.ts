import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const mockGetRequiredOrganization = vi.fn();
  const mockGetOrganizationTimeZone = vi.fn();
  const mockGetInvoiceByIdQuery = vi.fn();

  const selectWhereMock = vi.fn();
  const selectFromMock = vi.fn(() => ({
    where: selectWhereMock,
  }));
  const selectMock = vi.fn(() => ({
    from: selectFromMock,
  }));

  const updateReturningMock = vi.fn();
  const updateWhereMock = vi.fn(() => ({
    returning: updateReturningMock,
  }));
  const updateSetMock = vi.fn(() => ({
    where: updateWhereMock,
  }));
  const updateMock = vi.fn(() => ({
    set: updateSetMock,
  }));

  const dbMock = {
    select: selectMock,
    update: updateMock,
  };

  return {
    mockGetRequiredOrganization,
    mockGetOrganizationTimeZone,
    mockGetInvoiceByIdQuery,
    selectWhereMock,
    updateReturningMock,
    updateMock,
    dbMock,
  };
});

vi.mock("@/lib/db", () => ({
  db: mocks.dbMock,
}));

vi.mock("@/lib/queries/workspace", () => ({
  getRequiredOrganization: mocks.mockGetRequiredOrganization,
  getOrganizationTimeZone: mocks.mockGetOrganizationTimeZone,
}));

vi.mock("@/lib/queries/invoice", () => ({
  getInvoiceById: mocks.mockGetInvoiceByIdQuery,
  getInvoices: vi.fn(),
  getActiveInvoiceCustomers: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/queries/members", () => ({
  requireOwnerRole: vi.fn(),
}));

import { getInvoiceById, sendInvoice } from "@/lib/actions/invoice";

describe("invoice action hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockGetRequiredOrganization.mockResolvedValue({
      organizationId: "org_a",
    });
    mocks.mockGetOrganizationTimeZone.mockResolvedValue("UTC");
    mocks.updateReturningMock.mockResolvedValue([]);
  });

  it("keeps read queries scoped to the active organization", async () => {
    mocks.mockGetInvoiceByIdQuery.mockResolvedValue({ id: "inv_1" });

    const result = await getInvoiceById("inv_1");

    expect(mocks.mockGetInvoiceByIdQuery).toHaveBeenCalledWith(
      "org_a",
      "inv_1",
      "UTC",
    );
    expect(result).toEqual({
      data: { id: "inv_1" },
    });
  });

  it("rejects cross-organization mutation attempts with explicit not-found error", async () => {
    mocks.selectWhereMock.mockResolvedValueOnce([]);

    const result = await sendInvoice("inv_foreign");

    expect(result).toEqual({
      error: "Invoice not found",
    });
    expect(mocks.updateMock).not.toHaveBeenCalled();
  });
});
