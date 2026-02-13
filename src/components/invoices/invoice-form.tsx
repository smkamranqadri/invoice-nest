"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  createInvoiceDraft,
  updateInvoiceDraft,
} from "@/lib/actions/invoice";
import {
  createInvoiceDraftSchema,
  type CreateInvoiceDraftFormInput,
  type CreateInvoiceDraftInput,
} from "@/lib/validations/invoice";
import { calculateInvoiceTotals } from "@/lib/domain/invoice-totals";
import { LineItemsEditor } from "@/components/invoices/line-items-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InvoiceFormProps {
  customers: {
    id: string;
    name: string;
  }[];
  mode?: "create" | "edit";
  invoiceId?: string;
  initialData?: CreateInvoiceDraftInput;
  submitLabel?: string;
  redirectToInvoiceOnCreate?: boolean;
  onSuccess?: (invoiceId: string) => void;
  formId?: string;
  hideSubmitButton?: boolean;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}

function getDefaultDueDate() {
  return new Date().toISOString().slice(0, 10);
}

export function InvoiceForm({
  customers,
  mode = "create",
  invoiceId,
  initialData,
  submitLabel,
  redirectToInvoiceOnCreate = false,
  onSuccess,
  formId,
  hideSubmitButton = false,
  onSubmittingChange,
}: InvoiceFormProps) {
  const router = useRouter();
  const isEditing = mode === "edit";

  const form = useForm<CreateInvoiceDraftFormInput>({
    resolver: zodResolver(createInvoiceDraftSchema),
    defaultValues: initialData ?? {
      customerId: customers[0]?.id ?? "",
      dueDate: getDefaultDueDate(),
      notes: "",
      terms: "",
      discountType: "none",
      discountRate: 0,
      discountAmount: 0,
      taxRate: 0,
      lineItems: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0.01,
        },
      ],
    },
  });

  const watchedValues = useWatch({
    control: form.control,
  });

  const totalsPreview = useMemo(() => {
    const lineItems = (watchedValues.lineItems ?? []).map((lineItem) => ({
      description: lineItem.description ?? "",
      quantity: Number(lineItem.quantity ?? 0),
      unitPrice: Number(lineItem.unitPrice ?? 0),
    }));

    return calculateInvoiceTotals({
      lineItems,
      discountType: watchedValues.discountType ?? "none",
      discountRate: Number(watchedValues.discountRate ?? 0),
      discountAmount: Number(watchedValues.discountAmount ?? 0),
      taxRate: Number(watchedValues.taxRate ?? 0),
    });
  }, [watchedValues]);

  useEffect(() => {
    onSubmittingChange?.(form.formState.isSubmitting);
  }, [form.formState.isSubmitting, onSubmittingChange]);

  async function onSubmit(values: CreateInvoiceDraftFormInput) {
    const result = isEditing
      ? await updateInvoiceDraft(invoiceId!, values)
      : await createInvoiceDraft(values);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    const savedInvoiceId = result.data?.id ?? invoiceId;
    if (!savedInvoiceId) {
      toast.error("Invoice saved but no ID was returned");
      return;
    }

    toast.success(isEditing ? "Invoice updated" : "Invoice draft created");

    if (!isEditing && redirectToInvoiceOnCreate) {
      router.push(`/invoices/${savedInvoiceId}`);
    } else {
      onSuccess?.(savedInvoiceId);
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={form.formState.isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <LineItemsEditor form={form} disabled={form.formState.isSubmitting} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Discount Type</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={form.formState.isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Discount type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="min-w-0">
            {watchedValues.discountType === "percentage" ? (
              <FormField
                control={form.control}
                name="discountRate"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Discount %</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(event.target.valueAsNumber)
                        }
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {watchedValues.discountType === "fixed" ? (
              <FormField
                control={form.control}
                name="discountAmount"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Discount Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(event.target.valueAsNumber)
                        }
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {watchedValues.discountType === "none" ? (
              <FormItem className="min-w-0">
                <FormLabel>Discount Value</FormLabel>
                <FormControl>
                  <Input value="" disabled placeholder="No discount" />
                </FormControl>
              </FormItem>
            ) : null}
          </div>

          <FormField
            control={form.control}
            name="taxRate"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Tax %</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(event.target.valueAsNumber)
                    }
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Optional note for internal context"
                    {...field}
                    value={field.value ?? ""}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terms</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Optional payment terms for customer"
                    {...field}
                    value={field.value ?? ""}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Totals Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrencyFromCents(totalsPreview.subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>-{formatCurrencyFromCents(totalsPreview.discountCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrencyFromCents(totalsPreview.taxCents)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrencyFromCents(totalsPreview.totalCents)}</span>
            </div>
          </CardContent>
        </Card>

        {!hideSubmitButton && (
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {submitLabel ?? (isEditing ? "Save Draft Changes" : "Create Draft")}
          </Button>
        )}
      </form>
    </Form>
  );
}
