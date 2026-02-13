import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { getInvoiceById } from "@/lib/queries/invoice";
import {
  getFullOrganization,
  getOrganizationTimeZone,
  getRequiredOrganization,
} from "@/lib/queries/workspace";
import { InvoicePdfDocument } from "@/lib/pdf/invoice-document";

export const runtime = "nodejs";

function extractAddress(metadata: unknown): string | null {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === "string") {
    try {
      return extractAddress(JSON.parse(metadata));
    } catch {
      return null;
    }
  }

  if (typeof metadata === "object") {
    const address = (metadata as Record<string, unknown>).address;
    if (typeof address === "string" && address.trim().length > 0) {
      return address.trim();
    }
  }

  return null;
}

function sanitizeFilename(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const { id } = await Promise.resolve(context.params);
  const { organizationId } = await getRequiredOrganization();
  const timeZone = await getOrganizationTimeZone(organizationId);
  const invoice = await getInvoiceById(organizationId, id, timeZone);
  if (!invoice) {
    return new NextResponse("Invoice not found", { status: 404 });
  }

  const allowedStatuses = new Set(["draft", "sent", "paid", "void"]);
  if (!allowedStatuses.has(invoice.status)) {
    return new NextResponse("PDF generation not available for this invoice", {
      status: 400,
    });
  }

  const organization = await getFullOrganization(organizationId);
  if (!organization) {
    return new NextResponse("Workspace not found", { status: 404 });
  }

  const workspaceAddress = extractAddress(
    (organization as { metadata?: unknown }).metadata,
  );
  const workspaceLogo =
    typeof organization.logo === "string" ? organization.logo : null;

  const pdfBuffer = await renderToBuffer(
    InvoicePdfDocument({
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        customerName: invoice.customerName,
        notes: invoice.notes,
        terms: invoice.terms,
        subtotalCents: invoice.subtotalCents,
        discountCents: invoice.discountCents,
        taxCents: invoice.taxCents,
        totalCents: invoice.totalCents,
        amountPaidCents: invoice.amountPaidCents,
        amountDueCents: invoice.amountDueCents,
        lineItems: invoice.lineItems,
      },
      workspace: {
        name: organization.name,
        address: workspaceAddress,
        logoUrl: workspaceLogo,
      },
    }),
  );

  const filename = sanitizeFilename(`${invoice.invoiceNumber}.pdf`);
  const body = new Uint8Array(pdfBuffer);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
