"use client";

import * as React from "react";
import { Building2, ChevronsUpDown, Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface WorkspaceSwitcherProps {
  activeOrganization: Organization | null;
}

export function WorkspaceSwitcher({
  activeOrganization,
}: WorkspaceSwitcherProps) {
  const { isMobile } = useSidebar();
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Fetch user's organizations on mount
  React.useEffect(() => {
    async function fetchOrgs() {
      const { data } = await authClient.organization.list();
      if (data) {
        setOrganizations(data);
      }
    }
    fetchOrgs();
  }, []);

  // Save active organization to localStorage whenever it changes
  React.useEffect(() => {
    if (activeOrganization?.id) {
      localStorage.setItem("lastActiveOrgId", activeOrganization.id);
    }
  }, [activeOrganization?.id]);

  async function handleSwitchOrg(orgId: string) {
    if (orgId === activeOrganization?.id) return;
    setIsLoading(true);
    await authClient.organization.setActive({ organizationId: orgId });
    // Save to localStorage for sign-in restoration
    localStorage.setItem("lastActiveOrgId", orgId);
    // Reload the page to pick up the new active org in server components
    window.location.reload();
  }

  const hasMultipleOrgs = organizations.length > 1;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {hasMultipleOrgs ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeOrganization?.name ?? "Select workspace"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {activeOrganization?.slug ?? ""}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="start"
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Workspaces
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleSwitchOrg(org.id)}
                  disabled={isLoading}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Building2 className="size-4 shrink-0" />
                  </div>
                  <span className="truncate">{org.name}</span>
                  {org.id === activeOrganization?.id && (
                    <Check className="ml-auto size-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <SidebarMenuButton size="lg" className="cursor-default">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Building2 className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {activeOrganization?.name ?? "InvoiceNest"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {activeOrganization?.slug ?? ""}
              </span>
            </div>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
