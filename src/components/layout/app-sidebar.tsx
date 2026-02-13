"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  UserPlus,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarUserMenu } from "@/components/layout/sidebar-user-menu";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, ownerOnly: false },
  { title: "Customers", href: "/customers", icon: Users, ownerOnly: false },
  { title: "Invoices", href: "/invoices", icon: FileText, ownerOnly: false },
  { title: "Members", href: "/members", icon: UserPlus, ownerOnly: true },
  { title: "Settings", href: "/settings", icon: Settings, ownerOnly: true },
];

interface AppSidebarProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  activeOrganization?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  userRole?: string;
}

export function AppSidebar({ user, activeOrganization, userRole }: AppSidebarProps) {
  const pathname = usePathname();
  const isOwner = userRole === "owner";

  const visibleNavItems = navItems.filter(
    (item) => !item.ownerOnly || isOwner
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <WorkspaceSwitcher activeOrganization={activeOrganization ?? null} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarUserMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
