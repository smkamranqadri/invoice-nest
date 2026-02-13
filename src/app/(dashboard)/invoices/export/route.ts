import { NextResponse } from "next/server";

import {
  getCombinedExportRows,
  getInvoiceExportRows,
  getPaymentExportRows,
} from "@/lib/queries/export";
import {
  getOrganizationTimeZone,
  getRequiredOrganization,
} from "@/lib/queries/workspace";
import { exportQuerySchema } from "@/lib/validations/export";

function formatCurrencyFromCents(amountCents: number): string {
  return (amountCents / 100).toFixed(2);
}

function safeSpreadsheetCell(value: string): string {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function toCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const raw = safeSpreadsheetCell(String(value));
  if (!/[",\n\r]/.test(raw)) {
    return raw;
  }

  return `"${raw.replace(/"/g, '""')}"`;
}

function toCsv(columns: string[], rows: Array<Record<string, unknown>>): string {
  const header = columns.map((column) => toCsvCell(column)).join(",");
  const body = rows
    .map((row) => columns.map((column) => toCsvCell(row[column])).join(","))
    .join("\n");

  return body.length > 0 ? `${header}\n${body}` : header;
}

function sanitizeFilename(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function GET(request: Request) {
  const { organizationId } = await getRequiredOrganization();
  const timeZone = await getOrganizationTimeZone(organizationId);

  const url = new URL(request.url);
  const parsed = exportQuerySchema.safeParse({
    dataset: url.searchParams.get("dataset") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid export filters" }, { status: 400 });
  }

  const filters = parsed.data;
  const timestamp = new Date().toISOString().slice(0, 10);

  if (filters.dataset === "payments") {
    const rows = await getPaymentExportRows(organizationId, filters, timeZone);

    const csv = toCsv(
      [
        "invoice_number",
        "customer_name",
        "invoice_status",
        "payment_date",
        "amount",
        "method",
        "method_detail",
        "notes",
      ],
      rows.map((row) => ({
        invoice_number: row.invoiceNumber,
        customer_name: row.customerName,
        invoice_status: row.invoiceDisplayStatus,
        payment_date: row.paymentDate,
        amount: formatCurrencyFromCents(row.amountCents),
        method: row.method,
        method_detail: row.methodDetail ?? "",
        notes: row.notes ?? "",
      })),
    );

    const filename = sanitizeFilename(`payments-${timestamp}.csv`);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  if (filters.dataset === "combined") {
    const rows = await getCombinedExportRows(organizationId, filters, timeZone);

    const csv = toCsv(
      [
        "invoice_number",
        "customer_name",
        "invoice_status",
        "invoice_total",
        "invoice_amount_due",
        "payment_date",
        "payment_amount",
        "payment_method",
        "payment_notes",
      ],
      rows.map((row) => ({
        invoice_number: row.invoiceNumber,
        customer_name: row.customerName,
        invoice_status: row.invoiceDisplayStatus,
        invoice_total: formatCurrencyFromCents(row.invoiceTotalCents),
        invoice_amount_due: formatCurrencyFromCents(row.invoiceAmountDueCents),
        payment_date: row.paymentDate ?? "",
        payment_amount:
          row.paymentAmountCents === null
            ? ""
            : formatCurrencyFromCents(row.paymentAmountCents),
        payment_method: row.paymentMethod ?? "",
        payment_notes: row.paymentNotes ?? "",
      })),
    );

    const filename = sanitizeFilename(`invoice-payments-${timestamp}.csv`);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  const rows = await getInvoiceExportRows(organizationId, filters, timeZone);
  const csv = toCsv(
    [
      "invoice_number",
      "customer_name",
      "persisted_status",
      "display_status",
      "issue_date",
      "due_date",
      "subtotal",
      "discount",
      "tax",
      "total",
      "amount_paid",
      "amount_due",
      "updated_at",
    ],
    rows.map((row) => ({
      invoice_number: row.invoiceNumber,
      customer_name: row.customerName,
      persisted_status: row.persistedStatus,
      display_status: row.displayStatus,
      issue_date: row.issueDate,
      due_date: row.dueDate,
      subtotal: formatCurrencyFromCents(row.subtotalCents),
      discount: formatCurrencyFromCents(row.discountCents),
      tax: formatCurrencyFromCents(row.taxCents),
      total: formatCurrencyFromCents(row.totalCents),
      amount_paid: formatCurrencyFromCents(row.amountPaidCents),
      amount_due: formatCurrencyFromCents(row.amountDueCents),
      updated_at: row.updatedAt.toISOString(),
    })),
  );

  const filename = sanitizeFilename(`invoices-${timestamp}.csv`);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
