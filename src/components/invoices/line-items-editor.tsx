"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import type { CreateInvoiceDraftFormInput } from "@/lib/validations/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LineItemsEditorProps {
  form: UseFormReturn<CreateInvoiceDraftFormInput>;
  disabled?: boolean;
}

export function LineItemsEditor({ form, disabled = false }: LineItemsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  const errors = form.formState.errors.lineItems;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Line Items</h3>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-12 gap-2 rounded-md border p-3"
          >
            <div className="col-span-12 md:col-span-6">
              <Input
                placeholder="Description"
                {...form.register(`lineItems.${index}.description`)}
                disabled={disabled}
              />
              {errors?.[index]?.description && (
                <p className="mt-1 text-xs text-destructive">
                  {errors[index]?.description?.message}
                </p>
              )}
            </div>
            <div className="col-span-5 md:col-span-2">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Qty"
                {...form.register(`lineItems.${index}.quantity`, {
                  valueAsNumber: true,
                })}
                disabled={disabled}
              />
              {errors?.[index]?.quantity && (
                <p className="mt-1 text-xs text-destructive">
                  {errors[index]?.quantity?.message}
                </p>
              )}
            </div>
            <div className="col-span-5 md:col-span-3">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Unit price"
                {...form.register(`lineItems.${index}.unitPrice`, {
                  valueAsNumber: true,
                })}
                disabled={disabled}
              />
              {errors?.[index]?.unitPrice && (
                <p className="mt-1 text-xs text-destructive">
                  {errors[index]?.unitPrice?.message}
                </p>
              )}
            </div>
            <div className="col-span-2 md:col-span-1 flex items-start justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={disabled || fields.length <= 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {typeof errors?.message === "string" && (
        <p className="text-xs text-destructive">{errors.message}</p>
      )}

      <div className="flex md:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              description: "",
              quantity: 1,
              unitPrice: 0.01,
            })
          }
          disabled={disabled}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Line
        </Button>
      </div>
    </div>
  );
}
