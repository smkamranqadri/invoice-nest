import { AlertTriangle, CircleDollarSign, Wallet } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEFAULT_WORKSPACE_CURRENCY } from "@/lib/workspace/settings";

interface DashboardMetricCardsProps {
  outstandingCents: number;
  overdueCount: number;
  revenueCents: number;
  currency?: string;
  periodLabel: string;
}

function formatCurrency(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

export function DashboardMetricCards({
  outstandingCents,
  overdueCount,
  revenueCents,
  currency = DEFAULT_WORKSPACE_CURRENCY,
  periodLabel,
}: DashboardMetricCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardDescription>Total Outstanding</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(outstandingCents, currency)}
            </CardTitle>
          </div>
          <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Remaining balance across sent invoices.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardDescription>Overdue Invoices</CardDescription>
            <CardTitle className="text-2xl">{overdueCount}</CardTitle>
          </div>
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Sent invoices past due date with unpaid balance.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardDescription>Revenue ({periodLabel})</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(revenueCents, currency)}
            </CardTitle>
          </div>
          <Wallet className="h-5 w-5 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Payments recorded in the selected period.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
