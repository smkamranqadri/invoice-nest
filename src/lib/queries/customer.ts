import { db } from "@/lib/db";
import { customer } from "@/lib/db/schema";
import { eq, and, or, ilike, desc, type SQL } from "drizzle-orm";
import { getCustomerInvoiceSummary } from "./invoice";

export async function getCustomers(
  organizationId: string,
  options?: { search?: string; status?: "active" | "inactive" | "all" },
) {
  const conditions: SQL[] = [eq(customer.organizationId, organizationId)];

  if (options?.status === "active") {
    conditions.push(eq(customer.isActive, true));
  } else if (options?.status === "inactive") {
    conditions.push(eq(customer.isActive, false));
  }

  if (options?.search) {
    const searchPattern = `%${options.search}%`;
    conditions.push(
      or(
        ilike(customer.name, searchPattern),
        ilike(customer.email, searchPattern),
      )!,
    );
  }

  return db
    .select()
    .from(customer)
    .where(and(...conditions))
    .orderBy(desc(customer.createdAt));
}

export async function getCustomerById(
  organizationId: string,
  customerId: string,
) {
  const [result] = await db
    .select()
    .from(customer)
    .where(
      and(eq(customer.id, customerId), eq(customer.organizationId, organizationId)),
    );

  return result ?? null;
}

export async function getCustomerDetailWithInvoices(
  organizationId: string,
  customerId: string,
  timeZone = "UTC",
) {
  const foundCustomer = await getCustomerById(organizationId, customerId);
  if (!foundCustomer) {
    return null;
  }

  const invoiceSummary = await getCustomerInvoiceSummary(
    organizationId,
    customerId,
    timeZone,
  );

  return {
    ...foundCustomer,
    outstandingBalanceCents: invoiceSummary.outstandingBalanceCents,
    invoices: invoiceSummary.invoices,
  };
}
