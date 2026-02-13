"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import type { InvoiceListItem } from "@/lib/queries/invoice";

interface InvoicesClientProps {
  invoices: InvoiceListItem[];
}

export function InvoicesClient({ invoices }: InvoicesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "all";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  const updateParams = useCallback(
    (key: "status" | "from" | "to", value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && (key !== "status" || value !== "all")) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      const nextQuery = params.toString();
      router.replace(nextQuery ? `/invoices?${nextQuery}` : "/invoices");
    },
    [router, searchParams],
  );

  const buildExportHref = useCallback(
    (dataset: "invoices" | "payments" | "combined") => {
      const params = new URLSearchParams();
      params.set("dataset", dataset);

      if (status !== "all") {
        params.set("status", status);
      }
      if (from) {
        params.set("from", from);
      }
      if (to) {
        params.set("to", to);
      }

      return `/invoices/export?${params.toString()}`;
    },
    [status, from, to],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Invoices
          </h2>
          <p className="text-muted-foreground">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <a href={buildExportHref("invoices")}>
              <Download className="mr-2 h-4 w-4" />
              Export Invoices CSV
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={buildExportHref("payments")}>
              <Download className="mr-2 h-4 w-4" />
              Export Payments CSV
            </a>
          </Button>
          <Button asChild>
            <Link href="/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Select value={status} onValueChange={(value) => updateParams("status", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="void">Void</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={from}
          onChange={(event) => updateParams("from", event.target.value)}
          placeholder="From date"
        />

        <Input
          type="date"
          value={to}
          onChange={(event) => updateParams("to", event.target.value)}
          placeholder="To date"
        />
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No invoices found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first invoice to get started.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
        </div>
      ) : (
        <InvoiceTable invoices={invoices} />
      )}
    </div>
  );
}
