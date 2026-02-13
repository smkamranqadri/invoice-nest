import { z } from "zod";

const PERSISTED_STATUSES = ["draft", "sent", "paid", "void"] as const;
const FILTER_STATUSES = [
  "all",
  "draft",
  "sent",
  "overdue",
  "paid",
  "void",
] as const;
const DISCOUNT_TYPES = ["none", "percentage", "fixed"] as const;

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

export const invoiceLineItemSchema = z.object({
  description: z.string().min(1, "Description is required").max(500),
  quantity: decimalNumber.gt(0, "Quantity must be greater than 0"),
  unitPrice: decimalNumber.gt(0, "Unit price must be greater than 0"),
});

const invoiceBaseSchema = z
  .object({
    customerId: z.string().min(1, "Customer is required"),
    dueDate: z
      .string()
      .refine(isIsoDate, "Due date must be in YYYY-MM-DD format"),
    notes: z.string().max(5000).optional().or(z.literal("")),
    terms: z.string().max(5000).optional().or(z.literal("")),
    discountType: z.enum(DISCOUNT_TYPES).default("none"),
    discountRate: decimalNumber.min(0).max(100).optional(),
    discountAmount: decimalNumber.min(0).optional(),
    taxRate: decimalNumber.min(0).max(100).default(0),
    lineItems: z.array(invoiceLineItemSchema).min(1, "At least one line item is required"),
  })
  .superRefine((value, ctx) => {
    if (value.discountType === "percentage" && value.discountRate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountRate"],
        message: "Discount rate is required for percentage discount",
      });
    }

    if (value.discountType === "fixed" && value.discountAmount === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountAmount"],
        message: "Discount amount is required for fixed discount",
      });
    }
  });

export const createInvoiceDraftSchema = invoiceBaseSchema;
export const updateInvoiceDraftSchema = invoiceBaseSchema;

export const updateSentInvoiceDueDateSchema = z.object({
  dueDate: z
    .string()
    .refine(isIsoDate, "Due date must be in YYYY-MM-DD format"),
});

export const invoiceListFilterSchema = z.object({
  status: z.enum(FILTER_STATUSES).optional(),
  from: z.string().refine(isIsoDate, "From date must be YYYY-MM-DD").optional(),
  to: z.string().refine(isIsoDate, "To date must be YYYY-MM-DD").optional(),
});

export const persistedInvoiceStatusSchema = z.enum(PERSISTED_STATUSES);
export const invoiceDiscountTypeSchema = z.enum(DISCOUNT_TYPES);
export const invoiceFilterStatusSchema = z.enum(FILTER_STATUSES);

export type CreateInvoiceDraftInput = z.infer<typeof createInvoiceDraftSchema>;
export type CreateInvoiceDraftFormInput = z.input<typeof createInvoiceDraftSchema>;
export type UpdateInvoiceDraftInput = z.infer<typeof updateInvoiceDraftSchema>;
export type UpdateSentInvoiceDueDateInput = z.infer<
  typeof updateSentInvoiceDueDateSchema
>;
export type InvoiceListFilterInput = z.infer<typeof invoiceListFilterSchema>;
export type InvoicePersistedStatus = z.infer<typeof persistedInvoiceStatusSchema>;
export type InvoiceFilterStatus = z.infer<typeof invoiceFilterStatusSchema>;
export type InvoiceDiscountType = z.infer<typeof invoiceDiscountTypeSchema>;
