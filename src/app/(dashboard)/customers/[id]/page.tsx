import { notFound } from "next/navigation";
import { getRequiredOrganization } from "@/lib/queries/workspace";
import { getCustomerById } from "@/lib/queries/customer";
import { CustomerDetail } from "@/components/customers/customer-detail";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await getRequiredOrganization();
  const customer = await getCustomerById(organizationId, id);

  if (!customer) {
    notFound();
  }

  return <CustomerDetail customer={customer} />;
}
