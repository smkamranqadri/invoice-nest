"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import {
  WORKSPACE_CURRENCIES,
  normalizeWorkspaceTaxPresets,
  serializeWorkspaceSettingsMetadata,
  type ParsedWorkspaceSettingsMetadata,
} from "@/lib/workspace/settings";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function hasAtMostTwoDecimals(value: number): boolean {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-8;
}

function createPresetId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `preset-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

const taxPresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Preset name is required").max(64),
  rate: z
    .number()
    .finite()
    .min(0, "Rate must be between 0 and 100")
    .max(100, "Rate must be between 0 and 100")
    .refine(hasAtMostTwoDecimals, "Rate must have at most 2 decimal places"),
  isDefault: z.boolean(),
});

const workspaceSettingsSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be at most 50 characters")
    .regex(slugRegex, "Slug must contain only lowercase letters, numbers, and hyphens"),
  logoUrl: z
    .string()
    .max(2000)
    .refine(
      (value) =>
        value.length === 0 ||
        value.startsWith("https://") ||
        value.startsWith("http://") ||
        value.startsWith("data:image/"),
      "Logo URL must be an https/http URL or data:image URL",
    ),
  address: z.string().max(1000).optional(),
  phone: z.string().max(100).optional(),
  currency: z.enum(WORKSPACE_CURRENCIES),
  taxPresets: z.array(taxPresetSchema).max(20, "Maximum 20 tax presets"),
});

type WorkspaceSettingsValues = z.infer<typeof workspaceSettingsSchema>;

interface WorkspaceSettingsFormProps {
  workspace: {
    name: string;
    slug: string;
    logoUrl: string;
    settings: ParsedWorkspaceSettingsMetadata;
  };
}

export function WorkspaceSettingsForm({ workspace }: WorkspaceSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<WorkspaceSettingsValues>({
    resolver: zodResolver(workspaceSettingsSchema),
    defaultValues: {
      name: workspace.name,
      slug: workspace.slug,
      logoUrl: workspace.logoUrl,
      address: workspace.settings.address,
      phone: workspace.settings.phone,
      currency: workspace.settings.currency,
      taxPresets: workspace.settings.taxPresets,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "taxPresets",
  });

  function setDefaultPreset(index: number) {
    const presets = form.getValues("taxPresets");
    form.setValue(
      "taxPresets",
      presets.map((preset, presetIndex) => ({
        ...preset,
        isDefault: presetIndex === index,
      })),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function removePreset(index: number) {
    const presets = form.getValues("taxPresets");
    const wasDefault = presets[index]?.isDefault;
    remove(index);

    const nextPresets = form.getValues("taxPresets");
    if (wasDefault && nextPresets.length > 0) {
      const hasDefault = nextPresets.some((preset) => preset.isDefault);
      if (!hasDefault) {
        form.setValue(
          "taxPresets",
          nextPresets.map((preset, presetIndex) => ({
            ...preset,
            isDefault: presetIndex === 0,
          })),
          { shouldDirty: true, shouldValidate: true },
        );
      }
    }
  }

  function addPreset() {
    append({
      id: createPresetId(),
      name: "",
      rate: 0,
      isDefault: fields.length === 0,
    });
  }

  async function onSubmit(values: WorkspaceSettingsValues) {
    setIsLoading(true);
    try {
      let normalizedPresets = normalizeWorkspaceTaxPresets(values.taxPresets);
      if (normalizedPresets.length > 0 && !normalizedPresets.some((preset) => preset.isDefault)) {
        normalizedPresets = normalizedPresets.map((preset, index) => ({
          ...preset,
          isDefault: index === 0,
        }));
      }

      const metadata = serializeWorkspaceSettingsMetadata({
        address: values.address,
        phone: values.phone,
        currency: values.currency,
        taxPresets: normalizedPresets,
        timeZone: workspace.settings.timeZone,
        extras: workspace.settings.extras,
      });

      const { error } = await authClient.organization.update({
        data: {
          name: values.name,
          slug: values.slug,
          logo: values.logoUrl.trim() || undefined,
          metadata,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to update workspace settings");
        return;
      }

      form.setValue("taxPresets", normalizedPresets, {
        shouldDirty: false,
        shouldValidate: true,
      });
      toast.success("Workspace settings updated");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Settings</CardTitle>
        <CardDescription>
          Update branding, billing defaults, and reusable tax presets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="acme-inc" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL-friendly identifier (lowercase, numbers, hyphens)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://cdn.example.com/logo.png"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Used for PDF branding. Leave blank to use text-only branding.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Currency</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WORKSPACE_CURRENCIES.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Used for dashboard totals and invoice amount display defaults.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="123 Business St, Suite 100&#10;City, State 12345"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 rounded-md border p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Tax Presets</h3>
                  <p className="text-sm text-muted-foreground">
                    Create reusable tax rates for invoice drafting.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addPreset}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Preset
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tax presets configured.</p>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const isDefault = form.watch(`taxPresets.${index}.isDefault` as const);

                    return (
                      <div key={field.id} className="rounded-md border p-3 space-y-3">
                        <input
                          type="hidden"
                          {...form.register(`taxPresets.${index}.id` as const)}
                        />
                        <input
                          type="hidden"
                          {...form.register(`taxPresets.${index}.isDefault` as const)}
                        />

                        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto_auto]">
                          <FormField
                            control={form.control}
                            name={`taxPresets.${index}.name` as const}
                            render={({ field: presetField }) => (
                              <FormItem>
                                <FormLabel>Preset Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Standard VAT" {...presetField} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`taxPresets.${index}.rate` as const}
                            render={({ field: presetField }) => (
                              <FormItem>
                                <FormLabel>Rate %</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={presetField.value ?? ""}
                                    onChange={(event) => {
                                      const nextValue = Number(event.target.value);
                                      presetField.onChange(
                                        Number.isFinite(nextValue) ? nextValue : 0,
                                      );
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant={isDefault ? "default" : "outline"}
                              size="sm"
                              onClick={() => setDefaultPreset(index)}
                            >
                              {isDefault ? "Default" : "Set Default"}
                            </Button>
                          </div>

                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removePreset(index)}
                              aria-label="Remove tax preset"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
