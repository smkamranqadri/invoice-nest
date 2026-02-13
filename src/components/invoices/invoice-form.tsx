"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  DEFAULT_WORKSPACE_CURRENCY,
  normalizeWorkspaceTaxPresets,
  type WorkspaceTaxPreset,
} from "@/lib/workspace/settings";
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
  FormDescription,
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
  currency?: string;
  taxPresets?: WorkspaceTaxPreset[];
}

function formatCurrencyFromCents(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
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
  currency = DEFAULT_WORKSPACE_CURRENCY,
  taxPresets = [],
}: InvoiceFormProps) {
  const router = useRouter();
  const isEditing = mode === "edit";
  const normalizedTaxPresets = useMemo(
    () => normalizeWorkspaceTaxPresets(taxPresets),
    [taxPresets],
  );
  const defaultTaxPreset = useMemo(
    () =>
      normalizedTaxPresets.find((preset) => preset.isDefault) ??
      normalizedTaxPresets[0] ??
      null,
    [normalizedTaxPresets],
  );
  const [selectedTaxPresetId, setSelectedTaxPresetId] = useState(() => {
    if (initialData) {
      const matchingPreset = normalizedTaxPresets.find(
        (preset) =>
          Math.abs(preset.rate - Number(initialData.taxRate ?? 0)) < 1e-8,
      );
      return matchingPreset?.id ?? "custom";
    }

    return defaultTaxPreset?.id ?? "custom";
  });

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
      taxRate: defaultTaxPreset?.rate ?? 0,
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

  function handleTaxPresetChange(nextPresetId: string) {
    if (nextPresetId === "custom") {
      setSelectedTaxPresetId("custom");
      return;
    }

    const preset = normalizedTaxPresets.find(
      (taxPreset) => taxPreset.id === nextPresetId,
    );
    if (!preset) {
      setSelectedTaxPresetId("custom");
      return;
    }

    setSelectedTaxPresetId(preset.id);
    form.setValue("taxRate", preset.rate, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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

          <FormItem className="min-w-0">
            <FormLabel>Tax Preset</FormLabel>
            <Select
              value={
                normalizedTaxPresets.some(
                  (preset) => preset.id === selectedTaxPresetId,
                )
                  ? selectedTaxPresetId
                  : "custom"
              }
              onValueChange={handleTaxPresetChange}
              disabled={form.formState.isSubmitting || normalizedTaxPresets.length === 0}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose tax preset" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {normalizedTaxPresets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name} ({preset.rate.toFixed(2)}%)
                    {preset.isDefault ? " • Default" : ""}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              {normalizedTaxPresets.length > 0
                ? "Selecting a preset applies its tax rate."
                : "No tax presets configured in workspace settings."}
            </FormDescription>
            <FormMessage />
          </FormItem>

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
                    onChange={(event) => {
                      setSelectedTaxPresetId("custom");
                      field.onChange(event.target.valueAsNumber);
                    }}
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
              <span>
                {formatCurrencyFromCents(totalsPreview.subtotalCents, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>
                -{formatCurrencyFromCents(totalsPreview.discountCents, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrencyFromCents(totalsPreview.taxCents, currency)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrencyFromCents(totalsPreview.totalCents, currency)}</span>
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
