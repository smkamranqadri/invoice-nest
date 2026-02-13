import { Badge } from "@/components/ui/badge";
import type { InvoiceDisplayStatus } from "@/lib/domain/invoice-status";

interface InvoiceStatusBadgeProps {
  status: InvoiceDisplayStatus;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  if (status === "overdue") {
    return <Badge variant="destructive">Overdue</Badge>;
  }

  if (status === "draft") {
    return <Badge variant="secondary">Draft</Badge>;
  }

  if (status === "sent") {
    return <Badge className="bg-blue-600 text-white">Sent</Badge>;
  }

  if (status === "paid") {
    return <Badge className="bg-emerald-600 text-white">Paid</Badge>;
  }

  return <Badge variant="outline">Void</Badge>;
}
