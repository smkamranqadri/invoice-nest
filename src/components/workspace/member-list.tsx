"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Shield, User, Trash2 } from "lucide-react";

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

interface MemberListProps {
  members: Member[];
  organizationName: string;
  onMemberChanged?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MemberList({
  members,
  organizationName,
  onMemberChanged,
}: MemberListProps) {
  const { data: session } = useSession();
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null);
  const [removing, setRemoving] = useState(false);

  const currentUserId = session?.user?.id;
  const ownerCount = members.filter((m) => m.role === "owner").length;

  async function handleRoleChange(memberId: string, newRole: string) {
    const { error } = await authClient.organization.updateMemberRole({
      memberId,
      role: newRole as "owner" | "member",
    });

    if (error) {
      toast.error(error.message || "Failed to update role");
      return;
    }

    toast.success("Role updated");
    onMemberChanged?.();
  }

  async function handleRemove() {
    if (!confirmRemove) return;

    setRemoving(true);
    const { error } = await authClient.organization.removeMember({
      memberIdOrEmail: confirmRemove.id,
    });

    setRemoving(false);

    if (error) {
      toast.error(error.message || "Failed to remove member");
      return;
    }

    toast.success("Member removed");
    setConfirmRemove(null);
    onMemberChanged?.();
  }

  function canRemove(member: Member): boolean {
    // Cannot remove yourself
    if (member.userId === currentUserId) return false;
    // Cannot remove last owner
    if (member.role === "owner" && ownerCount <= 1) return false;
    return true;
  }

  function canChangeRole(member: Member): boolean {
    // Cannot change your own role
    if (member.userId === currentUserId) return false;
    // Cannot demote last owner
    if (member.role === "owner" && ownerCount <= 1) return false;
    return true;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(member.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {member.user.name}
                      {member.userId === currentUserId && (
                        <span className="ml-1 text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={member.role === "owner" ? "default" : "secondary"}
                >
                  {member.role}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(member.createdAt)}
              </TableCell>
              <TableCell>
                {member.userId !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canChangeRole(member) && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleRoleChange(
                              member.id,
                              member.role === "owner" ? "member" : "owner"
                            )
                          }
                        >
                          {member.role === "owner" ? (
                            <>
                              <User className="mr-2 h-4 w-4" />
                              Change to Member
                            </>
                          ) : (
                            <>
                              <Shield className="mr-2 h-4 w-4" />
                              Change to Owner
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      {canRemove(member) && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setConfirmRemove(member)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove from workspace
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!confirmRemove}
        onOpenChange={(open) => !open && setConfirmRemove(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong>{confirmRemove?.user.name}</strong> from{" "}
              <strong>{organizationName}</strong>? They will lose access to all
              workspace data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmRemove(null)}
              disabled={removing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={removing}
            >
              {removing ? "Removing..." : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
