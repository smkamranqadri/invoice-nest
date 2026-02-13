import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardRecentInvoice } from "@/lib/queries/dashboard";
import { DEFAULT_WORKSPACE_CURRENCY } from "@/lib/workspace/settings";

interface DashboardRecentInvoicesProps {
  invoices: DashboardRecentInvoice[];
  currency?: string;
}

function formatCurrency(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DashboardRecentInvoices({
  invoices,
  currency = DEFAULT_WORKSPACE_CURRENCY,
}: DashboardRecentInvoicesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
        <CardDescription>Latest invoice activity in this workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No invoices yet. Create your first invoice to populate dashboard activity.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Due</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.displayStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(invoice.totalCents, currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(invoice.amountDueCents, currency)}
                  </TableCell>
                  <TableCell className="text-right">{formatDate(invoice.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
