"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CopyPlus, Download, Eye, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { cloneInvoiceToDraft } from "@/lib/actions/invoice";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvoiceListItem } from "@/lib/queries/invoice";

interface InvoiceTableProps {
  invoices: InvoiceListItem[];
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

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const router = useRouter();
  const [isCloning, startTransition] = useTransition();

  function handleClone(invoiceId: string) {
    startTransition(async () => {
      const result = await cloneInvoiceToDraft(invoiceId);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Invoice cloned as draft");
      router.push(`/invoices/${result.data!.id}`);
      router.refresh();
    });
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-[70px]">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
              <TableCell>{invoice.customerName}</TableCell>
              <TableCell>
                <InvoiceStatusBadge status={invoice.displayStatus} />
              </TableCell>
              <TableCell>{formatCurrencyFromCents(invoice.totalCents)}</TableCell>
              <TableCell>{formatDate(invoice.dueDate)}</TableCell>
              <TableCell>{formatDate(invoice.updatedAt)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/invoices/${invoice.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={isCloning || invoice.status === "void"}
                        onSelect={(event) => {
                          event.preventDefault();
                          handleClone(invoice.id);
                        }}
                      >
                        <CopyPlus className="mr-2 h-4 w-4" />
                        Clone as Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
