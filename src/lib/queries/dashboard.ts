import { and, desc, eq, gt, gte, lt, lte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { customer, invoice, invoicePayment } from "@/lib/db/schema";
import { getTodayIsoDateInTimeZone } from "@/lib/domain/date";
import {
  deriveInvoiceDisplayStatus,
  type InvoiceDisplayStatus,
  type InvoicePersistedStatus,
} from "@/lib/domain/invoice-status";

export const DASHBOARD_PERIODS = ["month", "quarter", "year"] as const;

export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

interface DashboardPeriodRange {
  from: string;
  to: string;
  label: string;
}

export interface DashboardRecentInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  status: InvoicePersistedStatus;
  displayStatus: InvoiceDisplayStatus;
  dueDate: string;
  totalCents: number;
  amountDueCents: number;
  updatedAt: Date;
}

export interface DashboardSnapshot {
  period: DashboardPeriod;
  periodRange: DashboardPeriodRange;
  outstandingCents: number;
  overdueCount: number;
  revenueCents: number;
  recentInvoices: DashboardRecentInvoice[];
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function buildIsoDate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseDashboardPeriod(input: string | null | undefined): DashboardPeriod {
  if (typeof input !== "string") {
    return "month";
  }

  if ((DASHBOARD_PERIODS as readonly string[]).includes(input)) {
    return input as DashboardPeriod;
  }

  return "month";
}

function getPeriodRange(todayIso: string, period: DashboardPeriod): DashboardPeriodRange {
  const [year, month] = todayIso.split("-").map((part) => Number(part));

  if (period === "year") {
    return {
      from: buildIsoDate(year, 1, 1),
      to: buildIsoDate(year, 12, 31),
      label: String(year),
    };
  }

  if (period === "quarter") {
    const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;
    const quarterEndMonth = quarterStartMonth + 2;
    const quarter = Math.floor((month - 1) / 3) + 1;

    return {
      from: buildIsoDate(year, quarterStartMonth, 1),
      to: buildIsoDate(
        year,
        quarterEndMonth,
        getLastDayOfMonth(year, quarterEndMonth),
      ),
      label: `Q${quarter} ${year}`,
    };
  }

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  return {
    from: buildIsoDate(year, month, 1),
    to: buildIsoDate(year, month, getLastDayOfMonth(year, month)),
    label: monthLabel,
  };
}

export async function getDashboardSnapshot(
  organizationId: string,
  options?: {
    period?: DashboardPeriod;
    timeZone?: string;
    recentLimit?: number;
  },
): Promise<DashboardSnapshot> {
  const period = options?.period ?? "month";
  const timeZone = options?.timeZone ?? "UTC";
  const recentLimit = options?.recentLimit ?? 8;

  const todayIso = getTodayIsoDateInTimeZone(timeZone);
  const periodRange = getPeriodRange(todayIso, period);

  const [outstandingRow] = await db
    .select({
      totalCents: sql<number>`coalesce(sum(${invoice.amountDueCents}), 0)`,
    })
    .from(invoice)
    .where(
      and(
        eq(invoice.organizationId, organizationId),
        eq(invoice.status, "sent"),
        gt(invoice.amountDueCents, 0),
      ),
    );

  const [overdueRow] = await db
    .select({
      count: sql<number>`coalesce(count(*), 0)`,
    })
    .from(invoice)
    .where(
      and(
        eq(invoice.organizationId, organizationId),
        eq(invoice.status, "sent"),
        gt(invoice.amountDueCents, 0),
        lt(invoice.dueDate, todayIso),
      ),
    );

  const [revenueRow] = await db
    .select({
      totalCents: sql<number>`coalesce(sum(${invoicePayment.amountCents}), 0)`,
    })
    .from(invoicePayment)
    .where(
      and(
        eq(invoicePayment.organizationId, organizationId),
        gte(invoicePayment.paymentDate, periodRange.from),
        lte(invoicePayment.paymentDate, periodRange.to),
      ),
    );

  const recentRows = await db
    .select({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerName: customer.name,
      status: invoice.status,
      dueDate: invoice.dueDate,
      totalCents: invoice.totalCents,
      amountDueCents: invoice.amountDueCents,
      amountPaidCents: invoice.amountPaidCents,
      updatedAt: invoice.updatedAt,
    })
    .from(invoice)
    .innerJoin(customer, eq(invoice.customerId, customer.id))
    .where(eq(invoice.organizationId, organizationId))
    .orderBy(desc(invoice.updatedAt))
    .limit(recentLimit);

  return {
    period,
    periodRange,
    outstandingCents: toNumber(outstandingRow?.totalCents),
    overdueCount: toNumber(overdueRow?.count),
    revenueCents: toNumber(revenueRow?.totalCents),
    recentInvoices: recentRows.map((row) => ({
      id: row.id,
      invoiceNumber: row.invoiceNumber,
      customerName: row.customerName,
      status: row.status as InvoicePersistedStatus,
      displayStatus: deriveInvoiceDisplayStatus(
        row.status as InvoicePersistedStatus,
        row.dueDate,
        timeZone,
        row.amountPaidCents,
        row.amountDueCents,
      ),
      dueDate: row.dueDate,
      totalCents: row.totalCents,
      amountDueCents: row.amountDueCents,
      updatedAt: row.updatedAt,
    })),
  };
}
