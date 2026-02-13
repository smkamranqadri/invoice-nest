import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function requireOwnerRole() {
  const member = await auth.api.getActiveMember({
    headers: await headers(),
  });
  if (!member || member.role !== "owner") {
    throw new Error("Forbidden: owner role required");
  }
  return member;
}

export async function getWorkspaceMembers(organizationId: string) {
  const org = await auth.api.getFullOrganization({
    query: { organizationId },
    headers: await headers(),
  });
  return org;
}
