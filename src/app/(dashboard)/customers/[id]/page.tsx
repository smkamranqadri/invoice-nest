import { notFound } from "next/navigation";
import {
  getOrganizationTimeZone,
  getRequiredOrganization,
} from "@/lib/queries/workspace";
import { getCustomerDetailWithInvoices } from "@/lib/queries/customer";
import { CustomerDetail } from "@/components/customers/customer-detail";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await getRequiredOrganization();
  const timeZone = await getOrganizationTimeZone(organizationId);
  const customer = await getCustomerDetailWithInvoices(
    organizationId,
    id,
    timeZone,
  );

  if (!customer) {
    notFound();
  }

  return (
    <CustomerDetail
      customer={customer}
      outstandingBalanceCents={customer.outstandingBalanceCents}
      invoices={customer.invoices}
    />
  );
}
