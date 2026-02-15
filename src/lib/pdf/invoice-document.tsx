/* eslint-disable jsx-a11y/alt-text */

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingHorizontal: 32,
    paddingBottom: 56,
    fontSize: 10,
    color: "#111827",
    lineHeight: 1.4,
  },
  watermark: {
    position: "absolute",
    top: 280,
    left: 130,
    fontSize: 64,
    color: "#ef4444",
    opacity: 0.14,
    transform: "rotate(-25deg)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  companyBlock: {
    maxWidth: 280,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
  },
  logo: {
    width: 96,
    height: 96,
    objectFit: "contain",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  metaGrid: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 24,
  },
  metaColumn: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  table: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
  },
  tableSectionHeader: {
    marginTop: 8,
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableSectionMeta: {
    fontSize: 9,
    color: "#6b7280",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    borderBottomStyle: "solid",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  colDescription: {
    flex: 4,
    paddingRight: 8,
  },
  colQty: {
    flex: 1,
    textAlign: "right",
    paddingRight: 8,
  },
  colMoney: {
    flex: 2,
    textAlign: "right",
  },
  totalsCard: {
    marginTop: 16,
    alignSelf: "flex-end",
    width: 230,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
    borderRadius: 2,
    padding: 10,
    gap: 4,
  },
  totalRowStrong: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 11,
    fontWeight: 700,
    marginTop: 2,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
  },
  notesSection: {
    marginTop: 18,
    gap: 10,
  },
  pageFooter: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 9,
    color: "#6b7280",
  },
});

interface InvoicePdfLineItem {
  description: string;
  quantityHundredths: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

interface InvoicePdfProps {
  invoice: {
    invoiceNumber: string;
    status: "draft" | "sent" | "paid" | "void";
    issueDate: string;
    dueDate: string;
    customerName: string;
    notes: string | null;
    terms: string | null;
    subtotalCents: number;
    discountCents: number;
    taxCents: number;
    totalCents: number;
    amountPaidCents: number;
    amountDueCents: number;
    lineItems: InvoicePdfLineItem[];
  };
  workspace: {
    name: string;
    address: string | null;
    logoUrl: string | null;
  };
}

const FIRST_PAGE_LINE_ITEM_LIMIT = 16;
const CONTINUATION_PAGE_LINE_ITEM_LIMIT = 24;

interface LineItemChunk {
  items: InvoicePdfLineItem[];
  startIndex: number;
  endIndex: number;
}

function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatQuantity(quantityHundredths: number) {
  return (quantityHundredths / 100).toFixed(2);
}

function isRenderableLogo(logoUrl: string | null): boolean {
  if (!logoUrl) {
    return false;
  }

  return (
    logoUrl.startsWith("http://") ||
    logoUrl.startsWith("https://") ||
    logoUrl.startsWith("data:")
  );
}

function chunkLineItems(
  items: InvoicePdfLineItem[],
): {
  firstPageChunk: LineItemChunk;
  continuationChunks: LineItemChunk[];
} {
  const firstPageItems = items.slice(0, FIRST_PAGE_LINE_ITEM_LIMIT);
  const firstPageChunk: LineItemChunk = {
    items: firstPageItems,
    startIndex: firstPageItems.length > 0 ? 1 : 0,
    endIndex: firstPageItems.length,
  };

  if (items.length <= FIRST_PAGE_LINE_ITEM_LIMIT) {
    return { firstPageChunk, continuationChunks: [] };
  }

  const remaining = items.slice(FIRST_PAGE_LINE_ITEM_LIMIT);
  const continuationChunks: LineItemChunk[] = [];
  let nextStartIndex = FIRST_PAGE_LINE_ITEM_LIMIT + 1;

  for (let index = 0; index < remaining.length; index += CONTINUATION_PAGE_LINE_ITEM_LIMIT) {
    const chunkItems = remaining.slice(index, index + CONTINUATION_PAGE_LINE_ITEM_LIMIT);
    continuationChunks.push({
      items: chunkItems,
      startIndex: nextStartIndex,
      endIndex: nextStartIndex + chunkItems.length - 1,
    });
    nextStartIndex += chunkItems.length;
  }

  return {
    firstPageChunk,
    continuationChunks,
  };
}

function LineItemsTable({ lineItems }: { lineItems: InvoicePdfLineItem[] }) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader} wrap={false}>
        <Text style={styles.colDescription}>Description</Text>
        <Text style={styles.colQty}>Qty</Text>
        <Text style={styles.colMoney}>Unit Price</Text>
        <Text style={styles.colMoney}>Line Total</Text>
      </View>
      {lineItems.map((lineItem, index) => (
        <View key={`${lineItem.description}-${index}`} style={styles.tableRow} wrap={false}>
          <Text style={styles.colDescription}>{lineItem.description}</Text>
          <Text style={styles.colQty}>{formatQuantity(lineItem.quantityHundredths)}</Text>
          <Text style={styles.colMoney}>{formatCurrencyFromCents(lineItem.unitPriceCents)}</Text>
          <Text style={styles.colMoney}>{formatCurrencyFromCents(lineItem.lineTotalCents)}</Text>
        </View>
      ))}
    </View>
  );
}

function TotalsAndNotes({
  invoice,
}: {
  invoice: InvoicePdfProps["invoice"];
}) {
  return (
    <>
      <View style={styles.totalsCard} wrap={false}>
        <View style={styles.row}>
          <Text>Subtotal</Text>
          <Text>{formatCurrencyFromCents(invoice.subtotalCents)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Discount</Text>
          <Text>-{formatCurrencyFromCents(invoice.discountCents)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Tax</Text>
          <Text>{formatCurrencyFromCents(invoice.taxCents)}</Text>
        </View>
        <View style={styles.totalRowStrong}>
          <Text>Total</Text>
          <Text>{formatCurrencyFromCents(invoice.totalCents)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Paid</Text>
          <Text>{formatCurrencyFromCents(invoice.amountPaidCents)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Remaining</Text>
          <Text>{formatCurrencyFromCents(invoice.amountDueCents)}</Text>
        </View>
      </View>

      {(invoice.notes || invoice.terms) && (
        <View style={styles.notesSection} wrap={false}>
          <View>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text>{invoice.notes || "-"}</Text>
          </View>
          <View>
            <Text style={styles.sectionTitle}>Terms</Text>
            <Text>{invoice.terms || "-"}</Text>
          </View>
        </View>
      )}
    </>
  );
}

function LineItemsSection({
  chunk,
  totalItems,
  title,
}: {
  chunk: LineItemChunk;
  totalItems: number;
  title: string;
}) {
  return (
    <>
      <View style={styles.tableSectionHeader} wrap={false}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.tableSectionMeta}>
          {chunk.startIndex > 0
            ? `Items ${chunk.startIndex}-${chunk.endIndex} of ${totalItems}`
            : "No line items"}
        </Text>
      </View>
      <LineItemsTable lineItems={chunk.items} />
    </>
  );
}

function PdfPageFooter() {
  return (
    <View style={styles.pageFooter} fixed>
      <Text>Generated by InvoiceNest</Text>
      <Text render={renderPageMarker} />
    </View>
  );
}

function renderPageMarker({
  pageNumber,
  totalPages,
}: {
  pageNumber: number;
  totalPages: number;
}) {
  return `Page ${pageNumber} of ${totalPages}`;
}

export function InvoicePdfDocument({ invoice, workspace }: InvoicePdfProps) {
  const { firstPageChunk, continuationChunks } = chunkLineItems(invoice.lineItems);
  const hasContinuationPages = continuationChunks.length > 0;

  return (
    <Document title={invoice.invoiceNumber}>
      <Page size="A4" style={styles.page}>
        {invoice.status === "void" && <Text style={styles.watermark}>VOID</Text>}

        <View style={styles.topRow}>
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>{workspace.name}</Text>
            {workspace.address ? <Text>{workspace.address}</Text> : null}
          </View>

          {isRenderableLogo(workspace.logoUrl) ? (
            <Image style={styles.logo} src={workspace.logoUrl!} />
          ) : null}
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaColumn}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text>{invoice.customerName}</Text>
          </View>

          <View style={styles.metaColumn}>
            <Text style={styles.sectionTitle}>Invoice</Text>
            <View style={styles.row}>
              <Text>Number</Text>
              <Text>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text>Status</Text>
              <Text>{invoice.status.toUpperCase()}</Text>
            </View>
            <View style={styles.row}>
              <Text>Issue Date</Text>
              <Text>{formatDate(invoice.issueDate)}</Text>
            </View>
            <View style={styles.row}>
              <Text>Due Date</Text>
              <Text>{formatDate(invoice.dueDate)}</Text>
            </View>
          </View>
        </View>

        <LineItemsSection
          chunk={firstPageChunk}
          totalItems={invoice.lineItems.length}
          title={hasContinuationPages ? "Line Items (Page 1)" : "Line Items"}
        />

        {!hasContinuationPages && <TotalsAndNotes invoice={invoice} />}
        <PdfPageFooter />
      </Page>

      {continuationChunks.map((chunk, pageIndex) => (
        <Page
          key={`line-items-page-${pageIndex}`}
          size="A4"
          style={styles.page}
        >
          {invoice.status === "void" && <Text style={styles.watermark}>VOID</Text>}
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>Invoice {invoice.invoiceNumber}</Text>
            <Text style={styles.sectionTitle}>
              Line Items (Page {pageIndex + 2})
            </Text>
          </View>
          <LineItemsSection
            chunk={chunk}
            totalItems={invoice.lineItems.length}
            title={`Line Items (Page ${pageIndex + 2})`}
          />
          <PdfPageFooter />
        </Page>
      ))}

      {hasContinuationPages && (
        <Page size="A4" style={styles.page}>
          {invoice.status === "void" && <Text style={styles.watermark}>VOID</Text>}
          <View style={styles.metaGrid}>
            <View style={styles.metaColumn}>
              <Text style={styles.sectionTitle}>Invoice Summary</Text>
              <View style={styles.row}>
                <Text>Invoice</Text>
                <Text>{invoice.invoiceNumber}</Text>
              </View>
              <View style={styles.row}>
                <Text>Status</Text>
                <Text>{invoice.status.toUpperCase()}</Text>
              </View>
              <View style={styles.row}>
                <Text>Issue Date</Text>
                <Text>{formatDate(invoice.issueDate)}</Text>
              </View>
              <View style={styles.row}>
                <Text>Due Date</Text>
                <Text>{formatDate(invoice.dueDate)}</Text>
              </View>
            </View>
            <View style={styles.metaColumn}>
              <Text style={styles.sectionTitle}>Customer</Text>
              <Text>{invoice.customerName}</Text>
            </View>
          </View>

          <TotalsAndNotes invoice={invoice} />

          <PdfPageFooter />
        </Page>
      )}
    </Document>
  );
}

export const __testables = {
  chunkLineItems,
  renderPageMarker,
  FIRST_PAGE_LINE_ITEM_LIMIT,
  CONTINUATION_PAGE_LINE_ITEM_LIMIT,
};
