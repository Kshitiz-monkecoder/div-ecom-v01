"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, CalendarDays, Package, MessageSquare } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { type Ticket } from "@/types";

interface TicketCardProps {
  ticket: Ticket & {
    order?: {
      items: Array<{
        product?: { name: string } | null;
        name: string;
      }>;
    } | null;
  };
}

export function TicketCard({ ticket }: TicketCardProps) {
  const orderLabel = ticket.order?.items?.length
    ? ticket.order.items.length === 1
      ? ticket.order.items[0]?.product?.name || ticket.order.items[0]?.name
      : `${ticket.order.items.length} order items`
    : null;

  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="group flex h-full flex-col rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-sm transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_70px_-42px_rgba(15,23,42,0.75)] customer-focus-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-orange-600">
          <MessageSquare className="size-5" />
        </span>
        <StatusBadge status={ticket.status} type="ticket" />
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug text-orange-900">{ticket.category}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{ticket.description}</p>

      <div className="mt-5 space-y-2 text-sm">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-muted-foreground">
          <CalendarDays className="size-4 text-slate-400" />
          {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
        </div>
        {orderLabel && (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-muted-foreground">
            <Package className="size-4 text-slate-400" />
            <span className="truncate">{orderLabel}</span>
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-end border-t border-slate-100 pt-5">
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
          Open ticket
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
