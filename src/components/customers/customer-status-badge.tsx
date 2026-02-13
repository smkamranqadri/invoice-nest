import { Badge } from "@/components/ui/badge";

interface CustomerStatusBadgeProps {
  isActive: boolean;
}

export function CustomerStatusBadge({ isActive }: CustomerStatusBadgeProps) {
  return (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className={isActive ? "bg-emerald-600 text-white" : ""}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
