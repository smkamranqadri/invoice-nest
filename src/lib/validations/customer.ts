import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required").max(100),
  email: z.string().email().max(255).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
});

export const updateCustomerSchema = createCustomerSchema;

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
