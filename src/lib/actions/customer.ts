"use server";

import { db } from "@/lib/db";
import { customer } from "@/lib/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getRequiredOrganization } from "@/lib/queries/workspace";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "@/lib/validations/customer";

export async function createCustomer(input: unknown) {
  const { organizationId } = await getRequiredOrganization();

  const parsed = createCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid customer data" };
  }

  const [newCustomer] = await db
    .insert(customer)
    .values({
      id: createId(),
      organizationId,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
    })
    .returning();

  revalidatePath("/customers");
  return { data: newCustomer };
}

export async function updateCustomer(customerId: string, input: unknown) {
  const { organizationId } = await getRequiredOrganization();

  const parsed = updateCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid customer data" };
  }

  const [updated] = await db
    .update(customer)
    .set({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
    })
    .where(
      and(eq(customer.id, customerId), eq(customer.organizationId, organizationId)),
    )
    .returning();

  if (!updated) {
    return { error: "Customer not found" };
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { data: updated };
}

export async function toggleCustomerStatus(customerId: string) {
  const { organizationId } = await getRequiredOrganization();

  const [existing] = await db
    .select({ isActive: customer.isActive })
    .from(customer)
    .where(
      and(eq(customer.id, customerId), eq(customer.organizationId, organizationId)),
    );

  if (!existing) {
    return { error: "Customer not found" };
  }

  const [updated] = await db
    .update(customer)
    .set({ isActive: !existing.isActive })
    .where(
      and(eq(customer.id, customerId), eq(customer.organizationId, organizationId)),
    )
    .returning();

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { data: updated };
}
