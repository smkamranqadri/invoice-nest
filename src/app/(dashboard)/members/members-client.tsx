"use client";

import { useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { MemberList } from "@/components/workspace/member-list";
import { InviteMemberDialog } from "@/components/workspace/invite-member-dialog";
import { PendingInvitations } from "@/components/workspace/pending-invitations";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";

interface Member {
  id: string;
  userId: string;
  role: string;
  createdAt: Date;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

interface MembersPageClientProps {
  organizationId: string;
  organizationName: string;
  initialMembers: Member[];
}

export function MembersPageClient({
  organizationId,
  organizationName,
  initialMembers,
}: MembersPageClientProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshMembers = useCallback(async () => {
    const { data } = await authClient.organization.getFullOrganization({
      query: { organizationId },
    });

    if (data?.members) {
      setMembers(
        data.members.map((m) => ({
          id: m.id,
          userId: m.userId,
          role: m.role,
          createdAt: m.createdAt,
          user: {
            name: m.user.name,
            email: m.user.email,
            image: m.user.image,
          },
        }))
      );
    }
  }, [organizationId]);

  function handleInvited() {
    setRefreshKey((k) => k + 1);
  }

  function handleMemberChanged() {
    refreshMembers();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            Members
          </h2>
          <p className="text-muted-foreground">
            {members.length} member{members.length !== 1 ? "s" : ""} in{" "}
            {organizationName}
          </p>
        </div>
        <InviteMemberDialog onInvited={handleInvited} />
      </div>

      <MemberList
        members={members}
        organizationName={organizationName}
        onMemberChanged={handleMemberChanged}
      />

      <Separator />

      <PendingInvitations
        organizationId={organizationId}
        refreshKey={refreshKey}
      />
    </div>
  );
}
