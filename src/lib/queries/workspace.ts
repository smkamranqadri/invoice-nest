import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getRequiredSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/sign-in");
  }
  return session;
}

export async function getRequiredOrganization() {
  const session = await getRequiredSession();
  if (!session.session.activeOrganizationId) {
    redirect("/create-workspace");
  }
  return {
    session,
    organizationId: session.session.activeOrganizationId,
  };
}

export async function getFullOrganization(organizationId: string) {
  return auth.api.getFullOrganization({
    query: { organizationId },
    headers: await headers(),
  });
}
