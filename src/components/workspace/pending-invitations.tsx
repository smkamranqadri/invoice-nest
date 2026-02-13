"use client";

import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Check, X } from "lucide-react";

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
}

interface PendingInvitationsProps {
  organizationId: string;
  refreshKey?: number;
}

export function PendingInvitations({
  organizationId,
  refreshKey,
}: PendingInvitationsProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    const { data } = await authClient.organization.getFullOrganization({
      query: { organizationId },
    });

    if (data?.invitations) {
      const pending = data.invitations.filter(
        (inv: Invitation) => inv.status === "pending"
      );
      setInvitations(pending);
    }
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations, refreshKey]);

  async function handleCopyLink(invitationId: string) {
    const link = `${window.location.origin}/accept-invitation/${invitationId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(invitationId);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }

  async function handleCancel(invitationId: string) {
    const { error } = await authClient.organization.cancelInvitation({
      invitationId,
    });

    if (error) {
      toast.error(error.message || "Failed to cancel invitation");
      return;
    }

    toast.success("Invitation cancelled");
    fetchInvitations();
  }

  function getTimeRemaining(expiresAt: Date) {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    if (diffMs <= 0) return "expired";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `expires in ${days} day${days > 1 ? "s" : ""}`;
    }
    return `expires in ${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>
          Invitations that have not yet been accepted
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No pending invitations
          </p>
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{invitation.email}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{invitation.role}</Badge>
                    <Badge variant="outline">pending</Badge>
                    <span className="text-xs text-muted-foreground">
                      {getTimeRemaining(invitation.expiresAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyLink(invitation.id)}
                    title="Copy invitation link"
                  >
                    {copiedId === invitation.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCancel(invitation.id)}
                    title="Cancel invitation"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
