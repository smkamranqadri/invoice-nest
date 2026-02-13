import { z } from "zod";

function hasAtMostTwoDecimals(value: number): boolean {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-8;
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime());
}

const decimalNumber = z
  .number()
  .finite()
  .refine(hasAtMostTwoDecimals, "Must have at most 2 decimal places");

const reasonSchema = z
  .string()
  .trim()
  .min(3, "Reason must be at least 3 characters")
  .max(1000, "Reason must be at most 1000 characters");

export const paymentMethodSchema = z.enum([
  "cash",
  "bank_transfer",
  "card",
  "check",
  "other",
]);

const paymentBaseSchema = z
  .object({
    amount: decimalNumber.gt(0, "Payment amount must be greater than 0"),
    paymentDate: z
      .string()
      .refine(isIsoDate, "Payment date must be in YYYY-MM-DD format"),
    method: paymentMethodSchema,
    methodDetail: z.string().max(500).optional().or(z.literal("")),
    notes: z.string().max(5000).optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (value.method === "other" && !value.methodDetail?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["methodDetail"],
        message: "Method detail is required when method is 'other'",
      });
    }
  });

export const createInvoicePaymentSchema = paymentBaseSchema;

export const updateInvoicePaymentSchema = paymentBaseSchema.extend({
  reason: reasonSchema,
});

export const deleteInvoicePaymentSchema = z.object({
  reason: reasonSchema,
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type CreateInvoicePaymentInput = z.infer<typeof createInvoicePaymentSchema>;
export type CreateInvoicePaymentFormInput = z.input<typeof createInvoicePaymentSchema>;
export type UpdateInvoicePaymentInput = z.infer<typeof updateInvoicePaymentSchema>;
export type DeleteInvoicePaymentInput = z.infer<typeof deleteInvoicePaymentSchema>;
