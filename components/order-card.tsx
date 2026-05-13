"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, CalendarDays, FileText, MapPin, Package } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { useLanguage } from "@/components/language-provider";
import { type Order, type OrderItem } from "@/types";

interface OrderCardProps {
  order: Order & {
    items: OrderItem[];
  };
}

export function OrderCard({ order }: OrderCardProps) {
  const { t } = useLanguage();
  const totalAmount = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalInRupees = (totalAmount / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  const firstItem = order.items[0];
  const itemSummary =
    order.items.length === 0
      ? "Solar order"
      : order.items.length === 1
      ? firstItem.name
      : `${firstItem.name} +${order.items.length - 1} more`;

  return (
    <Link
      href={`/orders/${order.id}`}
      className="group flex h-full flex-col rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-sm transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_70px_-42px_rgba(15,23,42,0.75)] customer-focus-ring"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {t("orders.orderNumber")} #{order.orderNumber}
          </p>
          <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-orange-900">
            {itemSummary}
          </h3>
          {firstItem?.capacity && <p className="mt-1 text-sm text-slate-500">{firstItem.capacity}</p>}
        </div>
        <StatusBadge status={order.status} type="order" />
      </div>

      <div className="mt-5 grid gap-2 text-sm">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-muted-foreground">
          <Package className="size-4 text-slate-400" />
          <span>{order.items.length} item{order.items.length === 1 ? "" : "s"}</span>
        </div>
        {order.deliveryDate && (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-muted-foreground">
            <CalendarDays className="size-4 text-slate-400" />
            <span>{format(new Date(order.deliveryDate), "dd MMM yyyy")}</span>
          </div>
        )}
        <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <span className="line-clamp-2">{order.address}</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
        <div>
          <p className="text-xs text-slate-400">Project value</p>
          <p className="text-lg font-semibold text-orange-900">Rs {totalInRupees}</p>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-orange-600">
          <span className="hidden items-center gap-1 sm:inline-flex">
            <FileText className="size-4" />
            Documents
          </span>
          <span className="inline-flex items-center gap-1">
            Open
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
