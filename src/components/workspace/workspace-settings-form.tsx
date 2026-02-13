"use client";

import { useState } from "react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  address: z.string().optional(),
  phone: z.string().optional(),
});

type WorkspaceSettingsValues = z.infer<typeof workspaceSettingsSchema>;

interface WorkspaceSettingsFormProps {
  workspace: {
    name: string;
    slug: string;
    metadata?: {
      address?: string;
      phone?: string;
    } | null;
  };
}

export function WorkspaceSettingsForm({ workspace }: WorkspaceSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<WorkspaceSettingsValues>({
    resolver: zodResolver(workspaceSettingsSchema),
    defaultValues: {
      name: workspace.name,
      slug: workspace.slug,
      address: (workspace.metadata as Record<string, string> | null)?.address ?? "",
      phone: (workspace.metadata as Record<string, string> | null)?.phone ?? "",
    },
  });

  async function onSubmit(values: WorkspaceSettingsValues) {
    setIsLoading(true);
    try {
      const { error } = await authClient.organization.update({
        data: {
          name: values.name,
          slug: values.slug,
          metadata: {
            address: values.address || "",
            phone: values.phone || "",
          },
        },
      });

      if (error) {
        toast.error(error.message || "Failed to update workspace settings");
        return;
      }

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
          Update your workspace name, slug, and company details
        </CardDescription>
      </CardHeader>
      <CardContent>
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
