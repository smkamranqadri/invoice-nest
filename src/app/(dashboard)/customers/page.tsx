import { getRequiredOrganization } from "@/lib/queries/workspace";
import { getCustomers } from "@/lib/queries/customer";
import { CustomersClient } from "./customers-client";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const { organizationId } = await getRequiredOrganization();

  const status = (params.status as "active" | "inactive" | "all") ?? "all";
  const customers = await getCustomers(organizationId, {
    search: params.search,
    status,
  });

  return (
    <CustomersClient
      customers={customers}
      initialSearch={params.search ?? ""}
    />
  );
}
