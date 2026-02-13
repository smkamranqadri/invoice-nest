import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { InvoiceForm } from "@/components/invoices/invoice-form";
import { getRequiredOrganization } from "@/lib/queries/workspace";
import { getActiveInvoiceCustomers } from "@/lib/queries/invoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewInvoicePage() {
  const { organizationId } = await getRequiredOrganization();
  const customers = await getActiveInvoiceCustomers(organizationId);

  return (
    <div className="space-y-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Invoices
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Invoice</h1>
        <p className="text-muted-foreground">
          Build a draft invoice with line items, discount, tax, and terms.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Draft</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active customers are available. Add or reactivate a customer
              before creating an invoice.
            </p>
          ) : (
            <InvoiceForm
              customers={customers.map((customer) => ({
                id: customer.id,
                name: customer.name,
              }))}
              mode="create"
              redirectToInvoiceOnCreate
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
