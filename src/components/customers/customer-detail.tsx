"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

import { toggleCustomerStatus } from "@/lib/actions/customer";
import { CustomerStatusBadge } from "@/components/customers/customer-status-badge";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { CustomerForm } from "@/components/customers/customer-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CustomerDetailProps {
  customer: {
    id: string;
    organizationId: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  outstandingBalanceCents: number;
  invoices: {
    id: string;
    invoiceNumber: string;
    displayStatus:
      | "draft"
      | "sent"
      | "partially_paid"
      | "overdue"
      | "paid"
      | "void";
    dueDate: string;
    totalCents: number;
    amountDueCents: number;
    updatedAt: Date;
  }[];
}

function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CustomerDetail({
  customer,
  outstandingBalanceCents,
  invoices,
}: CustomerDetailProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggleStatus() {
    startTransition(async () => {
      const result = await toggleCustomerStatus(customer.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        customer.isActive ? "Customer deactivated" : "Customer reactivated"
      );
    });
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Customers
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {customer.name}
          </h1>
          <CustomerStatusBadge isActive={customer.isActive} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant={customer.isActive ? "destructive" : "default"}
            size="sm"
            onClick={handleToggleStatus}
            disabled={isPending}
          >
            {customer.isActive ? "Deactivate" : "Reactivate"}
          </Button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {customer.email || "No email"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">
                  {customer.phone || "No phone"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {customer.address || "No address"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Added on</p>
                <p className="text-sm text-muted-foreground">
                  {customer.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrencyFromCents(outstandingBalanceCents)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {invoices.length === 0
                ? "No invoices yet"
                : `${invoices.length} invoice${invoices.length === 1 ? "" : "s"} linked`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice History</CardTitle>
          <CardDescription>
            Invoices associated with this customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No invoices yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Invoices for this customer will appear here once created.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <InvoiceStatusBadge status={invoice.displayStatus} />
                    <p className="text-sm font-semibold">
                      {formatCurrencyFromCents(invoice.amountDueCents)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer details below.
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            initialData={{
              id: customer.id,
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              address: customer.address,
            }}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
