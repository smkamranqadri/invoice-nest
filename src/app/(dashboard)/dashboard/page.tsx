import Link from "next/link";
import { FileText, Users } from "lucide-react";

import { DashboardMetricCards } from "@/components/dashboard/dashboard-metric-cards";
import { DashboardRecentInvoices } from "@/components/dashboard/dashboard-recent-invoices";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DASHBOARD_PERIODS,
  getDashboardSnapshot,
  parseDashboardPeriod,
} from "@/lib/queries/dashboard";
import {
  getOrganizationTimeZone,
  getRequiredOrganization,
  getWorkspaceSettings,
} from "@/lib/queries/workspace";
import { cn } from "@/lib/utils";
import { DEFAULT_WORKSPACE_CURRENCY } from "@/lib/workspace/settings";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const { session, organizationId } = await getRequiredOrganization();

  const period = parseDashboardPeriod(params.period);
  const timeZone = await getOrganizationTimeZone(organizationId);

  const [dashboardSnapshot, workspace] = await Promise.all([
    getDashboardSnapshot(organizationId, { period, timeZone }),
    getWorkspaceSettings(organizationId),
  ]);

  const currency = workspace?.settings.currency ?? DEFAULT_WORKSPACE_CURRENCY;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {workspace?.name ? `${workspace.name} Dashboard` : "Workspace Dashboard"}
          </h2>
          <p className="text-muted-foreground">
            Hello, {session.user.name}! Here is your financial overview for this workspace.
          </p>
        </div>

        <div className="inline-flex rounded-md border p-1">
          {DASHBOARD_PERIODS.map((periodOption) => (
            <Link
              key={periodOption}
              href={
                periodOption === "month"
                  ? "/dashboard"
                  : `/dashboard?period=${periodOption}`
              }
              className={cn(
                "rounded-sm px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                dashboardSnapshot.period === periodOption
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {periodOption}
            </Link>
          ))}
        </div>
      </div>

      <DashboardMetricCards
        outstandingCents={dashboardSnapshot.outstandingCents}
        overdueCount={dashboardSnapshot.overdueCount}
        revenueCents={dashboardSnapshot.revenueCents}
        currency={currency}
        periodLabel={dashboardSnapshot.periodRange.label}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Go straight to the most common billing flows.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/invoices/new">
                <FileText className="mr-2 h-4 w-4" />
                Create Invoice
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/customers">
                <Users className="mr-2 h-4 w-4" />
                Manage Customers
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/invoices">Open Invoice List</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Period Window</CardTitle>
            <CardDescription>Revenue aggregation range</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">From:</span> {dashboardSnapshot.periodRange.from}
            </p>
            <p>
              <span className="text-muted-foreground">To:</span> {dashboardSnapshot.periodRange.to}
            </p>
          </CardContent>
        </Card>
      </div>

      <DashboardRecentInvoices
        invoices={dashboardSnapshot.recentInvoices}
        currency={currency}
      />
    </div>
  );
}
