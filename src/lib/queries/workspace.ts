import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { parseWorkspaceSettingsMetadata } from "@/lib/workspace/settings";
import { resolveWorkspaceTimeZone } from "@/lib/workspace/timezone";

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

export async function getWorkspaceSettings(organizationId: string) {
  const organization = await getFullOrganization(organizationId);
  if (!organization) {
    return null;
  }

  const metadata = (organization as { metadata?: unknown }).metadata;
  const parsedMetadata = parseWorkspaceSettingsMetadata(metadata);

  return {
    name: organization.name,
    slug: organization.slug,
    logoUrl: typeof organization.logo === "string" ? organization.logo : "",
    metadata,
    settings: parsedMetadata,
  };
}

export async function getOrganizationTimeZone(organizationId: string) {
  const workspace = await getWorkspaceSettings(organizationId);
  return resolveWorkspaceTimeZone(organizationId, workspace);
}
