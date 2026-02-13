import { z } from "zod";

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime());
}

export const exportDatasetSchema = z.enum(["invoices", "payments", "combined"]);

export const exportQuerySchema = z.object({
  dataset: exportDatasetSchema.default("invoices"),
  status: z.enum(["all", "draft", "sent", "overdue", "paid", "void"]).optional(),
  from: z.string().refine(isIsoDate, "From date must be YYYY-MM-DD").optional(),
  to: z.string().refine(isIsoDate, "To date must be YYYY-MM-DD").optional(),
});

export type ExportDataset = z.infer<typeof exportDatasetSchema>;
export type ExportQueryInput = z.infer<typeof exportQuerySchema>;
