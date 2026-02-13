import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  // If user has no active organization, allow /create-workspace to render without sidebar
  if (!session.session.activeOrganizationId) {
    return <>{children}</>;
  }

  // Fetch the active organization details for display
  const activeOrg = await auth.api.getFullOrganization({
    query: { organizationId: session.session.activeOrganizationId },
    headers: await headers(),
  });

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
        activeOrganization={
          activeOrg
            ? {
                id: activeOrg.id,
                name: activeOrg.name,
                slug: activeOrg.slug,
              }
            : null
        }
      />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
