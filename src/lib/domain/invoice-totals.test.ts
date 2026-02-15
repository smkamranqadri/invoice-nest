import { describe, expect, it } from "vitest";

import { calculateInvoiceTotals } from "@/lib/domain/invoice-totals";

describe("calculateInvoiceTotals", () => {
  it("applies integer-cents half-up rounding for quantity and unit price boundaries", () => {
    const result = calculateInvoiceTotals({
      lineItems: [
        {
          description: "Boundary line",
          quantity: 1.239,
          unitPrice: 0.106,
        },
      ],
      discountType: "none",
      taxRate: 0,
    });

    expect(result.lineItems[0].quantityHundredths).toBe(124);
    expect(result.lineItems[0].unitPriceCents).toBe(11);
    expect(result.lineItems[0].lineTotalCents).toBe(14);
    expect(result.totalCents).toBe(14);
  });

  it("clamps fixed discount to subtotal so totals never go negative", () => {
    const result = calculateInvoiceTotals({
      lineItems: [
        {
          description: "Service",
          quantity: 1,
          unitPrice: 50,
        },
      ],
      discountType: "fixed",
      discountAmount: 9999,
      taxRate: 10,
    });

    expect(result.subtotalCents).toBe(5000);
    expect(result.discountCents).toBe(5000);
    expect(result.taxCents).toBe(0);
    expect(result.totalCents).toBe(0);
  });

  it("applies percentage discount before tax with deterministic rounding", () => {
    const result = calculateInvoiceTotals({
      lineItems: [
        {
          description: "Consulting block",
          quantity: 2,
          unitPrice: 49.99,
        },
      ],
      discountType: "percentage",
      discountRate: 12.5,
      taxRate: 8.25,
    });

    expect(result.subtotalCents).toBe(9998);
    expect(result.discountRateHundredths).toBe(1250);
    expect(result.discountCents).toBe(1250);
    expect(result.taxRateHundredths).toBe(825);
    expect(result.taxCents).toBe(722);
    expect(result.totalCents).toBe(9470);
  });

  it("rounds tax half-up on fractional-cent tax amounts", () => {
    const result = calculateInvoiceTotals({
      lineItems: [
        {
          description: "Tiny item",
          quantity: 1,
          unitPrice: 0.01,
        },
      ],
      discountType: "none",
      taxRate: 50,
    });

    expect(result.subtotalCents).toBe(1);
    expect(result.taxCents).toBe(1);
    expect(result.totalCents).toBe(2);
  });
});
