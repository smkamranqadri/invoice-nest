import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { InvoiceDetail } from "@/components/invoices/invoice-detail";
import {
  getActiveInvoiceCustomers,
  getInvoiceById,
} from "@/lib/queries/invoice";
import {
  getOrganizationTimeZone,
  getRequiredOrganization,
} from "@/lib/queries/workspace";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await getRequiredOrganization();
  const timeZone = await getOrganizationTimeZone(organizationId);
  const invoice = await getInvoiceById(organizationId, id, timeZone);

  if (!invoice) {
    notFound();
  }

  const customers = await getActiveInvoiceCustomers(organizationId);
  if (!customers.find((customer) => customer.id === invoice.customerId)) {
    customers.unshift({
      id: invoice.customerId,
      name: `${invoice.customerName} (inactive)`,
      isActive: false,
    });
  }

  const activeMember = await auth.api.getActiveMember({
    headers: await headers(),
  });

  return (
    <InvoiceDetail
      invoice={invoice}
      customers={customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
      }))}
      canVoid={activeMember?.role === "owner"}
    />
  );
}
