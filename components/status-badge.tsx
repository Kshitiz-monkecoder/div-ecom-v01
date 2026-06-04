"use client";
import { type OrderStatus, type TicketStatus } from "@/types";
import { getStatusMeta } from "@/components/customer-status";

// Add import at top:
import { useLanguage } from "@/components/language-provider";

interface StatusBadgeProps {
  status: OrderStatus | TicketStatus | string;
  type?: "order" | "ticket";
}


// Replace the component body:
export function StatusBadge({ status }: StatusBadgeProps) {
  const { t, locale } = useLanguage();
  const meta = getStatusMeta(status);
  const Icon = meta.icon;

  // Use translation if available, else fall back to meta.label
  const label = (() => {
    if (locale === "hi") {
      const key = `orderStatus.${status}`;
      const translated = t(key);
      return translated !== key ? translated : meta.label;
    }
    return meta.label;
  })();

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.tone}`}>
      <span className={`size-1.5 rounded-full ${meta.dot}`} />
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}