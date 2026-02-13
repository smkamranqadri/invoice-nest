export type InvoiceDiscountType = "none" | "percentage" | "fixed";

export interface InvoiceTotalsInputLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceTotalsInput {
  lineItems: InvoiceTotalsInputLineItem[];
  discountType: InvoiceDiscountType;
  discountRate?: number;
  discountAmount?: number;
  taxRate?: number;
}

export interface ComputedInvoiceLineItem {
  position: number;
  description: string;
  quantityHundredths: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface InvoiceTotalsResult {
  subtotalCents: number;
  discountRateHundredths: number;
  discountAmountCents: number;
  discountCents: number;
  taxRateHundredths: number;
  taxCents: number;
  totalCents: number;
  lineItems: ComputedInvoiceLineItem[];
}

function roundHalfUpDiv(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }
  return Math.floor((numerator + denominator / 2) / denominator);
}

function toCents(value: number): number {
  return Math.round(value * 100);
}

function toHundredths(value: number): number {
  return Math.round(value * 100);
}

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function calculateInvoiceTotals(input: InvoiceTotalsInput): InvoiceTotalsResult {
  const normalizedItems = input.lineItems.map((lineItem, index) => {
    const quantityHundredths = toHundredths(lineItem.quantity);
    const unitPriceCents = toCents(lineItem.unitPrice);
    const lineTotalCents = roundHalfUpDiv(
      quantityHundredths * unitPriceCents,
      100,
    );

    return {
      position: index + 1,
      description: lineItem.description.trim(),
      quantityHundredths,
      unitPriceCents,
      lineTotalCents,
    };
  });

  const subtotalCents = normalizedItems.reduce(
    (sum, lineItem) => sum + lineItem.lineTotalCents,
    0,
  );

  const discountRateHundredths =
    input.discountType === "percentage"
      ? toHundredths(input.discountRate ?? 0)
      : 0;
  const discountAmountCents =
    input.discountType === "fixed" ? toCents(input.discountAmount ?? 0) : 0;

  let discountCents = 0;
  if (input.discountType === "percentage") {
    discountCents = roundHalfUpDiv(
      subtotalCents * discountRateHundredths,
      10000,
    );
  } else if (input.discountType === "fixed") {
    discountCents = discountAmountCents;
  }

  discountCents = clamp(0, discountCents, subtotalCents);

  const taxableSubtotalCents = subtotalCents - discountCents;
  const taxRateHundredths = toHundredths(input.taxRate ?? 0);
  const taxCents = roundHalfUpDiv(
    taxableSubtotalCents * taxRateHundredths,
    10000,
  );
  const totalCents = taxableSubtotalCents + taxCents;

  return {
    subtotalCents,
    discountRateHundredths,
    discountAmountCents,
    discountCents,
    taxRateHundredths,
    taxCents,
    totalCents,
    lineItems: normalizedItems,
  };
}
