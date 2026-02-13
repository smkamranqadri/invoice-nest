"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, CopyPlus, Download, FileText, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  cloneInvoiceToDraft,
  sendInvoice,
  updateInvoiceNonFinancial,
  voidInvoice,
} from "@/lib/actions/invoice";
import {
  createInvoicePayment,
  deleteInvoicePayment,
  updateInvoicePayment,
} from "@/lib/actions/payment";
import type {
  InvoiceDetailRecord,
  InvoicePaymentRecord,
} from "@/lib/queries/invoice";
import type { CreateInvoiceDraftInput } from "@/lib/validations/invoice";
import type { PaymentMethod } from "@/lib/validations/payment";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  canManagePaymentCorrections: boolean;
}

interface PaymentFormState {
  amount: string;
  paymentDate: string;
  method: PaymentMethod;
  methodDetail: string;
  notes: string;
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

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
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

function paymentMethodLabel(method: string) {
  switch (method) {
    case "bank_transfer":
      return "Bank transfer";
    case "cash":
      return "Cash";
    case "card":
      return "Card";
    case "check":
      return "Check";
    case "other":
      return "Other";
    default:
      return method;
  }
}

function defaultPaymentFormState(amountDueCents: number): PaymentFormState {
  return {
    amount: amountDueCents > 0 ? (amountDueCents / 100).toFixed(2) : "0.01",
    paymentDate: getTodayIsoDate(),
    method: "bank_transfer",
    methodDetail: "",
    notes: "",
  };
}

function paymentToFormState(payment: InvoicePaymentRecord): PaymentFormState {
  return {
    amount: (payment.amountCents / 100).toFixed(2),
    paymentDate: payment.paymentDate,
    method: payment.method as PaymentMethod,
    methodDetail: payment.methodDetail ?? "",
    notes: payment.notes ?? "",
  };
}

export function InvoiceDetail({
  invoice,
  customers,
  canVoid,
  canManagePaymentCorrections,
}: InvoiceDetailProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [isEditDraftSubmitting, setIsEditDraftSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [nonFinancialDueDate, setNonFinancialDueDate] = useState(invoice.dueDate);
  const [nonFinancialNotes, setNonFinancialNotes] = useState(invoice.notes ?? "");
  const [nonFinancialTerms, setNonFinancialTerms] = useState(invoice.terms ?? "");

  const [recordForm, setRecordForm] = useState<PaymentFormState>(
    defaultPaymentFormState(invoice.amountDueCents),
  );
  const [editForm, setEditForm] = useState<PaymentFormState>(
    defaultPaymentFormState(invoice.amountDueCents),
  );
  const [editReason, setEditReason] = useState("");
  const [deleteReason, setDeleteReason] = useState("");

  const canVoidThisInvoice =
    canVoid && (invoice.status === "draft" || invoice.status === "sent");
  const canRecordPayments = invoice.status !== "void" && invoice.amountDueCents > 0;
  const canEditNonFinancial = invoice.status === "sent" || invoice.status === "paid";
  const canEditDraft = invoice.status === "draft" && !invoice.hasPaymentHistory;
  const canCloneInvoice = invoice.status !== "void";

  const editingPayment = useMemo(
    () => invoice.payments.find((payment) => payment.id === editingPaymentId) ?? null,
    [invoice.payments, editingPaymentId],
  );
  const deletingPayment = useMemo(
    () => invoice.payments.find((payment) => payment.id === deletePaymentId) ?? null,
    [invoice.payments, deletePaymentId],
  );
  const correctionAudits = useMemo(
    () => invoice.paymentAudits.filter((audit) => audit.action !== "create"),
    [invoice.paymentAudits],
  );

  function withParsedAmount(
    amount: string,
    fn: (amountNumber: number) => Promise<void>,
  ) {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    void fn(parsedAmount);
  }

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

  function handleClone() {
    startTransition(async () => {
      const result = await cloneInvoiceToDraft(invoice.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Invoice cloned as draft");
      router.push(`/invoices/${result.data!.id}`);
      router.refresh();
    });
  }

  function handleSaveNonFinancial() {
    startTransition(async () => {
      const result = await updateInvoiceNonFinancial(invoice.id, {
        dueDate: nonFinancialDueDate,
        notes: nonFinancialNotes,
        terms: nonFinancialTerms,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Invoice details updated");
      router.refresh();
    });
  }

  function handleRecordPayment() {
    withParsedAmount(recordForm.amount, async (parsedAmount) => {
      startTransition(async () => {
        const result = await createInvoicePayment(invoice.id, {
          amount: parsedAmount,
          paymentDate: recordForm.paymentDate,
          method: recordForm.method,
          methodDetail: recordForm.methodDetail,
          notes: recordForm.notes,
        });
        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success("Payment recorded");
        setRecordPaymentOpen(false);
        setRecordForm(defaultPaymentFormState(invoice.amountDueCents));
        router.refresh();
      });
    });
  }

  function openEditPayment(payment: InvoicePaymentRecord) {
    setEditForm(paymentToFormState(payment));
    setEditReason("");
    setEditingPaymentId(payment.id);
  }

  function handleUpdatePayment() {
    if (!editingPayment) {
      return;
    }
    if (!editReason.trim()) {
      toast.error("Reason is required");
      return;
    }

    withParsedAmount(editForm.amount, async (parsedAmount) => {
      startTransition(async () => {
        const result = await updateInvoicePayment(invoice.id, editingPayment.id, {
          amount: parsedAmount,
          paymentDate: editForm.paymentDate,
          method: editForm.method,
          methodDetail: editForm.methodDetail,
          notes: editForm.notes,
          reason: editReason,
        });
        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success("Payment updated");
        setEditingPaymentId(null);
        setEditReason("");
        router.refresh();
      });
    });
  }

  function handleDeletePayment() {
    if (!deletingPayment) {
      return;
    }
    if (!deleteReason.trim()) {
      toast.error("Reason is required");
      return;
    }

    startTransition(async () => {
      const result = await deleteInvoicePayment(invoice.id, deletingPayment.id, {
        reason: deleteReason,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Payment deleted");
      setDeletePaymentId(null);
      setDeleteReason("");
      router.refresh();
    });
  }

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
          {canEditDraft && (
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

          {canRecordPayments && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRecordPaymentOpen(true)}
              disabled={isPending}
            >
              Record Payment
            </Button>
          )}

          <Button variant="outline" size="sm" asChild>
            <a href={`/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
              <Download className="mr-1.5 h-4 w-4" />
              Download PDF
            </a>
          </Button>

          {canCloneInvoice && (
            <Button variant="outline" size="sm" onClick={handleClone} disabled={isPending}>
              <CopyPlus className="mr-1.5 h-4 w-4" />
              Clone as Draft
            </Button>
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
            <CardDescription>Issued {formatDate(invoice.issueDate)}</CardDescription>
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span>{formatCurrencyFromCents(invoice.amountPaidCents)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Remaining</span>
              <span>{formatCurrencyFromCents(invoice.amountDueCents)}</span>
            </div>
            <div className="pt-3 text-xs text-muted-foreground space-y-1">
              <p>Due: {formatDate(invoice.dueDate)}</p>
              <p>Updated: {formatDate(invoice.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {canEditNonFinancial && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Due Date, Notes & Terms</CardTitle>
            <CardDescription>
              Financial fields are locked after payment activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">Due Date</p>
                <Input
                  type="date"
                  value={nonFinancialDueDate}
                  onChange={(event) => setNonFinancialDueDate(event.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <p className="text-sm font-medium">Notes</p>
                <Textarea
                  rows={3}
                  value={nonFinancialNotes}
                  onChange={(event) => setNonFinancialNotes(event.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Terms</p>
              <Textarea
                rows={3}
                value={nonFinancialTerms}
                onChange={(event) => setNonFinancialTerms(event.target.value)}
                disabled={isPending}
              />
            </div>
            <Button variant="outline" onClick={handleSaveNonFinancial} disabled={isPending}>
              Save Invoice Details
            </Button>
          </CardContent>
        </Card>
      )}

      {!canEditNonFinancial && (invoice.notes || invoice.terms) && (
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
          <CardDescription>
            {invoice.payments.length} payment
            {invoice.payments.length === 1 ? "" : "s"} recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoice.payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No payments yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Record a payment to update balance and status.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {canManagePaymentCorrections && <TableHead className="w-[180px]" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>
                      {paymentMethodLabel(payment.method)}
                      {payment.methodDetail ? ` (${payment.methodDetail})` : ""}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {payment.notes || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrencyFromCents(payment.amountCents)}
                    </TableCell>
                    {canManagePaymentCorrections && (
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditPayment(payment)}
                          disabled={isPending}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeleteReason("");
                            setDeletePaymentId(payment.id);
                          }}
                          disabled={isPending}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {canManagePaymentCorrections && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Correction Log</CardTitle>
            <CardDescription>Owner-visible payment audit history.</CardDescription>
          </CardHeader>
          <CardContent>
            {correctionAudits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No audit entries yet.</p>
            ) : (
              <div className="space-y-3">
                {correctionAudits.map((audit) => (
                  <div key={audit.id} className="rounded-md border p-3">
                    <p className="text-sm font-medium">
                      {audit.action.toUpperCase()} payment {audit.paymentId}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(audit.createdAt)} by {audit.actorUserName || "Unknown"}
                    </p>
                    <p className="text-sm mt-2">{audit.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setIsEditDraftSubmitting(false);
          }
        }}
      >
        <DialogContent className="max-w-4xl p-0 max-h-[92vh] overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Edit Invoice Draft</DialogTitle>
            <DialogDescription>
              Update draft fields and line items before sending.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-6 pb-6 max-h-[calc(92vh-12.5rem)]">
            <InvoiceForm
              mode="edit"
              invoiceId={invoice.id}
              customers={customers}
              initialData={toInvoiceFormData(invoice)}
              submitLabel="Save Draft"
              formId="invoice-edit-draft-form"
              hideSubmitButton
              onSubmittingChange={setIsEditDraftSubmitting}
              onSuccess={() => {
                setEditOpen(false);
                setIsEditDraftSubmitting(false);
                router.refresh();
              }}
            />
          </div>
          <DialogFooter className="sticky bottom-0 border-t bg-background px-6 py-4 sm:justify-end">
            <Button
              type="submit"
              form="invoice-edit-draft-form"
              disabled={isEditDraftSubmitting}
            >
              {isEditDraftSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={recordPaymentOpen} onOpenChange={setRecordPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Add a payment entry for this invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={recordForm.amount}
              onChange={(event) =>
                setRecordForm((prev) => ({ ...prev, amount: event.target.value }))
              }
              disabled={isPending}
              placeholder="Amount"
            />
            <Input
              type="date"
              value={recordForm.paymentDate}
              onChange={(event) =>
                setRecordForm((prev) => ({
                  ...prev,
                  paymentDate: event.target.value,
                }))
              }
              disabled={isPending}
            />
            <Select
              value={recordForm.method}
              onValueChange={(value) =>
                setRecordForm((prev) => ({
                  ...prev,
                  method: value as PaymentMethod,
                }))
              }
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={recordForm.methodDetail}
              onChange={(event) =>
                setRecordForm((prev) => ({
                  ...prev,
                  methodDetail: event.target.value,
                }))
              }
              disabled={isPending}
              placeholder="Method detail (optional unless method is other)"
            />
            <Textarea
              rows={3}
              value={recordForm.notes}
              onChange={(event) =>
                setRecordForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              disabled={isPending}
              placeholder="Payment notes"
            />
            <Button onClick={handleRecordPayment} disabled={isPending}>
              Save Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingPaymentId)} onOpenChange={() => setEditingPaymentId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>
              Owner action. A reason is required for audit logging.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={editForm.amount}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, amount: event.target.value }))
              }
              disabled={isPending}
              placeholder="Amount"
            />
            <Input
              type="date"
              value={editForm.paymentDate}
              onChange={(event) =>
                setEditForm((prev) => ({
                  ...prev,
                  paymentDate: event.target.value,
                }))
              }
              disabled={isPending}
            />
            <Select
              value={editForm.method}
              onValueChange={(value) =>
                setEditForm((prev) => ({
                  ...prev,
                  method: value as PaymentMethod,
                }))
              }
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={editForm.methodDetail}
              onChange={(event) =>
                setEditForm((prev) => ({
                  ...prev,
                  methodDetail: event.target.value,
                }))
              }
              disabled={isPending}
              placeholder="Method detail"
            />
            <Textarea
              rows={3}
              value={editForm.notes}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              disabled={isPending}
              placeholder="Payment notes"
            />
            <Textarea
              rows={2}
              value={editReason}
              onChange={(event) => setEditReason(event.target.value)}
              disabled={isPending}
              placeholder="Reason for edit (required)"
            />
            <Button onClick={handleUpdatePayment} disabled={isPending}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletePaymentId)} onOpenChange={() => setDeletePaymentId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
            <DialogDescription>
              This permanently removes the payment and logs your reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm">
              Deleting payment{" "}
              <span className="font-medium">{deletingPayment?.id ?? ""}</span> (
              {formatCurrencyFromCents(deletingPayment?.amountCents ?? 0)}).
            </p>
            <Textarea
              rows={3}
              value={deleteReason}
              onChange={(event) => setDeleteReason(event.target.value)}
              disabled={isPending}
              placeholder="Reason for deletion (required)"
            />
            <Button variant="destructive" onClick={handleDeletePayment} disabled={isPending}>
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
