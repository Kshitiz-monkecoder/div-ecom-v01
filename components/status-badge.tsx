import { type OrderStatus, type TicketStatus } from "@/types";
import { getStatusMeta } from "@/components/customer-status";

interface StatusBadgeProps {
  status: OrderStatus | TicketStatus | string;
  type?: "order" | "ticket";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = getStatusMeta(status);
  const Icon = meta.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.tone}`}>
      <span className={`size-1.5 rounded-full ${meta.dot}`} />
      <Icon className="size-3.5" />
      {meta.label}
    </span>
  );
}
