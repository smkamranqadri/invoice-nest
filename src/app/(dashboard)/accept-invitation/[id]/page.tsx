import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AcceptInvitationClient } from "./accept-invitation-client";

interface AcceptInvitationPageProps {
  params: Promise<{ id: string }>;
}

export default async function AcceptInvitationPage({
  params,
}: AcceptInvitationPageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    // Redirect to sign-up with return URL so they come back after registration
    redirect(`/sign-up?callbackUrl=/accept-invitation/${id}`);
  }

  // Fetch invitation details
  const invitation = await auth.api.getInvitation({
    query: { id },
    headers: await headers(),
  });

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">Invalid Invitation</h1>
          <p className="text-muted-foreground">
            This invitation link is invalid or has expired.
          </p>
          <a
            href="/dashboard"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <AcceptInvitationClient
        invitationId={id}
        organizationName={invitation.organizationName}
        organizationId={invitation.organizationId}
        inviterEmail={invitation.inviterEmail}
      />
    </div>
  );
}
