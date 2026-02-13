import { redirect } from "next/navigation";
import {
  getRequiredOrganization,
  getFullOrganization,
} from "@/lib/queries/workspace";
import { requireOwnerRole } from "@/lib/queries/members";
import { MembersPageClient } from "./members-client";

export default async function MembersPage() {
  const { organizationId } = await getRequiredOrganization();

  // Only owners can access the members page (AUTH-09)
  try {
    await requireOwnerRole();
  } catch {
    redirect("/dashboard");
  }

  const organization = await getFullOrganization(organizationId);

  if (!organization) {
    redirect("/dashboard");
  }

  return (
    <MembersPageClient
      organizationId={organizationId}
      organizationName={organization.name}
      initialMembers={organization.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        createdAt: m.createdAt,
        user: {
          name: m.user.name,
          email: m.user.email,
          image: m.user.image,
        },
      }))}
    />
  );
}
