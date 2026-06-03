"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Package,
  Search,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { formatStatusLabel, getStatusMeta } from "@/components/customer-status";
import { cn } from "@/lib/utils";
import type { Order, OrderItem, ParsedProduct } from "@/types";

type OrderWithItems = Order & { items: OrderItem[] };

type OrdersPageClientProps = {
  orders: OrderWithItems[];
  assignedProducts: ParsedProduct[];
};

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

const SOLAR_IMAGES = [
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=120&h=80&fit=crop",
  "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=120&h=80&fit=crop",
  "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=120&h=80&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=80&fit=crop",
  "https://images.unsplash.com/photo-1612594305265-2e0a69b91e8c?w=120&h=80&fit=crop",
];

function getOrderImage(orderNumber: string) {
  const idx = parseInt(orderNumber.replace(/\D/g, "") || "0") % SOLAR_IMAGES.length;
  return SOLAR_IMAGES[idx];
}

function StatusPill({ status }: { status: string }) {
  const meta = getStatusMeta(status);
  const colorMap: Record<string, string> = {
    NEW: "bg-sky-100 text-sky-700",
    CONTACTED: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-indigo-100 text-indigo-700",
    INSTALLED: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-rose-100 text-rose-700",
    PENDING: "bg-amber-100 text-amber-700",
  };
  const color = colorMap[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", color)}>
      {meta.label}
    </span>
  );
}

function getStatusNote(order: OrderWithItems): string {
  const d = order.deliveryDate ? format(new Date(order.deliveryDate), "d MMM yyyy") : null;
  switch (order.status) {
    case "NEW": return "Order placed";
    case "CONTACTED": return "Team contacted you";
    case "CONFIRMED": return d ? `Installation scheduled\n${d}` : "Installation scheduled";
    case "INSTALLED": return d ? `Completed on\n${d}` : "Installation complete";
    case "COMPLETED": return d ? `Completed on\n${d}` : "Completed";
    case "CANCELLED": return d ? `Cancelled on\n${d}` : "Order cancelled";
    default: return d ? `Updated ${d}` : "In progress";
  }
}

export function OrdersPageClient({ orders, assignedProducts }: OrdersPageClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => !["INSTALLED", "COMPLETED", "CANCELLED"].includes(o.status)).length;
  const completedOrders = orders.filter((o) => ["INSTALLED", "COMPLETED"].includes(o.status)).length;
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED").length;

  const statuses = useMemo(() => Array.from(new Set(orders.map((o) => o.status))), [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = orders.filter((o) => {
      const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
      const matchType = typeFilter === "ALL";
      const searchable = [
        o.orderNumber,
        o.address,
        o.phone,
        ...o.items.flatMap((i) => [i.name, i.capacity ?? ""]),
      ].join(" ").toLowerCase();
      return matchStatus && matchType && (!q || searchable.includes(q));
    });
    if (sortBy === "newest") result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortBy === "oldest") result = [...result].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return result;
  }, [orders, search, statusFilter, typeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  return (
    <div className="px-4 sm:px-6 py-6 space-y-5">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track and manage all your solar projects and orders.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: <Package className="size-5 text-orange-500" />,
            bg: "bg-orange-50",
            label: "Total Orders",
            value: totalOrders,
            sub: "All time",
          },
          {
            icon: <svg className="size-5 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
            bg: "bg-teal-50",
            label: "Active Projects",
            value: activeOrders,
            sub: "In progress",
          },
          {
            icon: <CheckCircle2 className="size-5 text-blue-500" />,
            bg: "bg-blue-50",
            label: "Completed",
            value: completedOrders,
            sub: "Successfully done",
          },
          {
            icon: <XCircle className="size-5 text-purple-400" />,
            bg: "bg-purple-50",
            label: "Cancelled",
            value: cancelledOrders,
            sub: "Cancelled orders",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={cn("size-11 rounded-full flex items-center justify-center shrink-0", stat.bg)}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800 leading-tight">{stat.value}</p>
              <p className="text-[11px] text-gray-400">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by order ID, project name or location..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <XCircle className="size-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{formatStatusLabel(s)}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="ROOFTOP">Rooftop Solar</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative flex items-center gap-2">
          <CalendarDays className="absolute left-3 size-4 text-gray-400 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Orders Table / List */}
      {paginated.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center py-20 text-center">
          <div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Package className="size-8 text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-600">
            {orders.length === 0 ? "No orders yet" : "No matching orders"}
          </p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            {orders.length === 0
              ? "Your solar project orders will appear here when the Divy Power team creates them."
              : "Try adjusting your search or filter."}
          </p>
          {orders.length === 0 && (
            <Link href="/tickets/new" className="mt-5 inline-flex items-center gap-2 bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-orange-600 transition-colors">
              Contact Support
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {paginated.map((order) => {
              const firstItem = order.items[0];
              const systemSize = firstItem?.capacity || "—";
              const orderType = "Rooftop Solar";
              const imgSrc = getOrderImage(order.orderNumber);
              const placedDate = format(new Date(order.createdAt), "dd MMM yyyy • hh:mm aa");
              const note = getStatusNote(order);

              return (
                <div key={order.id} className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors group">
                  <div className="size-[72px] sm:size-[88px] rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <img
                      src={imgSrc}
                      alt="Solar installation"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/image-fallback.svg";
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">
                      Order ID: {order.orderNumber}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <MapPin className="size-3 shrink-0" />
                      <span className="truncate">{order.address || "—"}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                      <CalendarDays className="size-3 shrink-0" />
                      <span>Placed on {placedDate}</span>
                    </div>
                  </div>

                  <div className="hidden md:block text-center shrink-0 w-20">
                    <p className="text-[11px] text-gray-400 font-medium">System Size</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{systemSize}</p>
                  </div>

                  <div className="hidden md:block text-center shrink-0 w-28">
                    <p className="text-[11px] text-gray-400 font-medium">Order Type</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{orderType}</p>
                  </div>

                  <div className="hidden sm:block shrink-0 w-36">
                    <StatusPill status={order.status} />
                    <p className="text-[11px] text-gray-500 mt-1.5 leading-tight whitespace-pre-line">{note}</p>
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="shrink-0 inline-flex items-center gap-1.5 border border-orange-300 text-orange-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    View Details <ArrowRight className="size-3" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} orders
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="size-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pg = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={cn(
                      "size-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                      pg === page
                        ? "bg-orange-500 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-white"
                    )}
                  >
                    {pg}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="size-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>

              <div className="relative ml-2">
                <select
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                  className="appearance-none pl-2 pr-7 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-orange-300 cursor-pointer"
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n} per page</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}