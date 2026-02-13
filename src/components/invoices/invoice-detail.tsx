"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  sendInvoice,
  updateSentInvoiceDueDate,
  voidInvoice,
} from "@/lib/actions/invoice";
import type { InvoiceDetailRecord } from "@/lib/queries/invoice";
import type { CreateInvoiceDraftInput } from "@/lib/validations/invoice";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InvoiceDetailProps {
  invoice: InvoiceDetailRecord;
  customers: {
    id: string;
    name: string;
  }[];
  canVoid: boolean;
}

function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function toInvoiceFormData(invoice: InvoiceDetailRecord): CreateInvoiceDraftInput {
  return {
    customerId: invoice.customerId,
    dueDate: invoice.dueDate,
    notes: invoice.notes ?? "",
    terms: invoice.terms ?? "",
    discountType: invoice.discountType,
    discountRate: invoice.discountRateHundredths / 100,
    discountAmount: invoice.discountAmountCents / 100,
    taxRate: invoice.taxRateHundredths / 100,
    lineItems: invoice.lineItems.map((lineItem) => ({
      description: lineItem.description,
      quantity: lineItem.quantityHundredths / 100,
      unitPrice: lineItem.unitPriceCents / 100,
    })),
  };
}

export function InvoiceDetail({ invoice, customers, canVoid }: InvoiceDetailProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [dueDate, setDueDate] = useState(invoice.dueDate);
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    startTransition(async () => {
      const result = await sendInvoice(invoice.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Invoice marked as sent");
      router.refresh();
    });
  }

  function handleVoid() {
    startTransition(async () => {
      const result = await voidInvoice(invoice.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Invoice voided");
      router.refresh();
    });
  }

  function handleDueDateSave() {
    startTransition(async () => {
      const result = await updateSentInvoiceDueDate(invoice.id, { dueDate });
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Due date updated");
      router.refresh();
    });
  }

  const canVoidThisInvoice =
    canVoid && (invoice.status === "draft" || invoice.status === "sent");

  return (
    <div className="space-y-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Invoices
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{invoice.invoiceNumber}</h1>
          <div className="flex items-center gap-2">
            <InvoiceStatusBadge status={invoice.displayStatus} />
            <span className="text-sm text-muted-foreground">
              Customer: {invoice.customerName}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {invoice.status === "draft" && (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit Draft
              </Button>
              <Button size="sm" onClick={handleSend} disabled={isPending}>
                Mark Sent
              </Button>
            </>
          )}

          {invoice.status === "sent" && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="w-[170px]"
                disabled={isPending}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDueDateSave}
                disabled={isPending}
              >
                Save Due Date
              </Button>
            </div>
          )}

          {canVoidThisInvoice && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleVoid}
              disabled={isPending}
            >
              Void Invoice
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((lineItem) => (
                  <TableRow key={lineItem.id}>
                    <TableCell>{lineItem.description}</TableCell>
                    <TableCell className="text-right">
                      {(lineItem.quantityHundredths / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrencyFromCents(lineItem.unitPriceCents)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrencyFromCents(lineItem.lineTotalCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Totals</CardTitle>
            <CardDescription>
              Issued {formatDate(invoice.issueDate)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrencyFromCents(invoice.subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>-{formatCurrencyFromCents(invoice.discountCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrencyFromCents(invoice.taxCents)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrencyFromCents(invoice.totalCents)}</span>
            </div>
            <div className="pt-3 text-xs text-muted-foreground space-y-1">
              <p>Due: {formatDate(invoice.dueDate)}</p>
              <p>Updated: {formatDate(invoice.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {(invoice.notes || invoice.terms) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes & Terms</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Notes</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {invoice.notes || "No notes"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Terms</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {invoice.terms || "No terms"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment History</CardTitle>
          <CardDescription>Phase 4 will add payment records here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No payments yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Payment events will appear here in Phase 4.
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Invoice Draft</DialogTitle>
            <DialogDescription>
              Update draft fields and line items before sending.
            </DialogDescription>
          </DialogHeader>
          <InvoiceForm
            mode="edit"
            invoiceId={invoice.id}
            customers={customers}
            initialData={toInvoiceFormData(invoice)}
            submitLabel="Save Draft"
            onSuccess={() => {
              setEditOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
