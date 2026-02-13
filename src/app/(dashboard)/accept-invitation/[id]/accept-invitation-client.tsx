"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AcceptInvitationClientProps {
  invitationId: string;
  organizationName: string;
  organizationId: string;
  inviterEmail: string;
}

export function AcceptInvitationClient({
  invitationId,
  organizationName,
  organizationId,
  inviterEmail,
}: AcceptInvitationClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setLoading(true);
    setError(null);

    const { error: acceptError } =
      await authClient.organization.acceptInvitation({
        invitationId,
      });

    if (acceptError) {
      setLoading(false);
      const message = acceptError.message || "Failed to accept invitation";
      if (message.toLowerCase().includes("already a member")) {
        setError("You are already a member of this workspace.");
      } else {
        setError(message);
      }
      return;
    }

    // Set the new organization as active
    await authClient.organization.setActive({
      organizationId,
    });

    toast.success(`Joined ${organizationName}!`);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Workspace Invitation</CardTitle>
        <CardDescription>
          You have been invited to join a workspace
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Workspace</p>
          <p className="text-lg font-semibold">{organizationName}</p>
          <p className="text-sm text-muted-foreground">
            Invited by {inviterEmail}
          </p>
        </div>

        {error ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">{error}</p>
            <a
              href="/dashboard"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Go to Dashboard
            </a>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={handleAccept}
            disabled={loading}
          >
            {loading ? "Accepting..." : `Join ${organizationName}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
