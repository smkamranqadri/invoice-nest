import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isValidTimeZone } from "@/lib/domain/date";

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

function extractTimeZone(metadata: unknown): string | null {
  if (!metadata) return null;

  if (typeof metadata === "string") {
    try {
      return extractTimeZone(JSON.parse(metadata));
    } catch {
      return null;
    }
  }

  if (typeof metadata === "object") {
    const timezone =
      (metadata as Record<string, unknown>).timezone ??
      (metadata as Record<string, unknown>).timeZone;

    if (typeof timezone === "string" && isValidTimeZone(timezone)) {
      return timezone;
    }
  }

  return null;
}

export async function getOrganizationTimeZone(organizationId: string) {
  const organization = await getFullOrganization(organizationId);
  if (!organization) {
    return "UTC";
  }

  const timeZone = extractTimeZone(
    (organization as { metadata?: unknown }).metadata,
  );
  return timeZone ?? "UTC";
}
