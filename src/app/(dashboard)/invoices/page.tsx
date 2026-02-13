import { InvoicesClient } from "./invoices-client";
import { getRequiredOrganization, getOrganizationTimeZone } from "@/lib/queries/workspace";
import { getInvoices } from "@/lib/queries/invoice";
import { invoiceFilterStatusSchema } from "@/lib/validations/invoice";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const { organizationId } = await getRequiredOrganization();
  const timeZone = await getOrganizationTimeZone(organizationId);

  const parsedStatus = invoiceFilterStatusSchema.safeParse(params.status ?? "all");
  const status = parsedStatus.success ? parsedStatus.data : "all";

  const invoices = await getInvoices(organizationId, {
    status,
    from: params.from,
    to: params.to,
    timeZone,
  });

  return <InvoicesClient invoices={invoices} />;
}
