"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be at most 50 characters")
    .regex(slugRegex, "Slug must contain only lowercase letters, numbers, and hyphens"),
  address: z.string().optional(),
  phone: z.string().optional(),
});

type CreateWorkspaceValues = z.infer<typeof createWorkspaceSchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CreateWorkspaceForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const form = useForm<CreateWorkspaceValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
      address: "",
      phone: "",
    },
  });

  const nameValue = form.watch("name");

  useEffect(() => {
    if (!slugManuallyEdited && nameValue) {
      form.setValue("slug", slugify(nameValue), { shouldValidate: true });
    }
  }, [nameValue, slugManuallyEdited, form]);

  async function onSubmit(values: CreateWorkspaceValues) {
    setIsLoading(true);
    try {
      const result = await authClient.organization.create({
        name: values.name,
        slug: values.slug,
        metadata: {
          address: values.address || "",
          phone: values.phone || "",
        },
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to create workspace");
        return;
      }

      // Save the newly created organization as the last active one
      if (result.data) {
        localStorage.setItem("lastActiveOrgId", result.data.id);
      }

      toast.success("Workspace created successfully!");
      window.location.href = "/dashboard";
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
              </FormControl>
              <FormDescription>
                Your company or organization name
              </FormDescription>
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
                <Input
                  placeholder="acme-inc"
                  {...field}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormDescription>
                URL-friendly identifier (lowercase, numbers, hyphens)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormDescription>Optional - can be added later in settings</FormDescription>
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
              <FormDescription>Optional - can be added later in settings</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Workspace
        </Button>
      </form>
    </Form>
  );
}
