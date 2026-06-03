"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevRight,
  Globe,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Shield,
  TicketIcon,
  XCircle,
  Zap,
} from "lucide-react";
import { formatStatusLabel, getStatusMeta } from "@/components/customer-status";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/types";

type TicketWithOrder = Ticket & {
  order?: {
    orderNumber?: string;
    items: Array<{ product?: { name: string } | null; name: string }>;
  } | null;
};

type SupportPageClientProps = {
  tickets: TicketWithOrder[];
  filteredTickets: TicketWithOrder[];
  searchParams: { status?: string; category?: string };
  ticketCount: number;
};

const CATEGORY_ICONS: Record<string, { bg: string; icon: string }> = {
  "Installation Issue": { bg: "bg-blue-100", icon: "⚡" },
  "Product Issue":      { bg: "bg-orange-100", icon: "🔧" },
  "Billing / Payment":  { bg: "bg-green-100", icon: "📄" },
  "General Query":      { bg: "bg-purple-100", icon: "💬" },
  "Plant On":           { bg: "bg-blue-100", icon: "⚡" },
  "DG BreakDown":       { bg: "bg-red-100", icon: "🔧" },
  "INC":                { bg: "bg-green-100", icon: "📄" },
  "BOM Visit":          { bg: "bg-purple-100", icon: "🚚" },
};

function getCategoryDisplay(category: string) {
  const reverse: Record<string, string> = {
    "Plant On": "Installation Issue",
    "DG BreakDown": "Product Issue",
    "INC": "Billing / Payment",
    "BOM Visit": "General Query",
  };
  return reverse[category] || category;
}

function StatusPill({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    OPEN:        "bg-sky-100 text-sky-700",
    IN_PROGRESS: "bg-amber-100 text-amber-700",
    RESOLVED:    "bg-emerald-100 text-emerald-700",
    CLOSED:      "bg-gray-100 text-gray-600",
  };
  const label: Record<string, string> = {
    OPEN: "Open", IN_PROGRESS: "In Progress", RESOLVED: "Resolved", CLOSED: "Closed",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", colorMap[status] ?? "bg-gray-100 text-gray-600")}>
      {label[status] ?? formatStatusLabel(status)}
    </span>
  );
}

function getTicketNote(ticket: TicketWithOrder): string {
  const now = new Date();
  const updated = new Date(ticket.updatedAt ?? ticket.createdAt);
  const dist = formatDistanceToNow(updated, { addSuffix: true });
  if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
    return `${ticket.status === "RESOLVED" ? "Resolved" : "Closed"} on ${format(updated, "d MMM yyyy")}`;
  }
  return `Updated ${dist}`;
}

const ITEMS_PER_PAGE = 5;

const FAQ_ITEMS = [
  { q: "How long does installation take?",      a: "Typically 1–2 days depending on system size and site conditions." },
  { q: "What is covered under warranty?",        a: "Panels (25 yr), inverter (5 yr), and structure (10 yr) are covered." },
  { q: "When will I get the subsidy?",           a: "After installation & net metering approval — usually 1–3 months." },
  { q: "How do I track my order?",               a: "Go to My Orders to see real-time project status and stages." },
];

const TAB_FILTERS = [
  { key: "ALL",         label: "All Tickets" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED",    label: "Resolved" },
  { key: "CLOSED",      label: "Closed" },
];

export function SupportPageClient({ tickets, filteredTickets, searchParams, ticketCount }: SupportPageClientProps) {
  const [search, setSearch]           = useState("");
  const [activeTab, setActiveTab]     = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy]           = useState("newest");
  const [page, setPage]               = useState(1);
  const [openFaq, setOpenFaq]         = useState<number | null>(null);

  const totalTickets  = tickets.length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;
  const inProgCount   = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const closedCount   = tickets.filter((t) => t.status === "CLOSED").length;

  const uniqueCategories = useMemo(() => Array.from(new Set(tickets.map((t) => getCategoryDisplay(t.category)))), [tickets]);

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = tickets.filter((t) => {
      const tabMatch = activeTab === "ALL" || t.status === activeTab;
      const statusMatch = statusFilter === "ALL" || t.status === statusFilter;
      const catMatch = categoryFilter === "ALL" || getCategoryDisplay(t.category) === categoryFilter;
      const searchable = [t.category, t.description, t.status, t.order?.orderNumber ?? ""].join(" ").toLowerCase();
      return tabMatch && statusMatch && catMatch && (!q || searchable.includes(q));
    });
    if (sortBy === "newest") result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortBy === "oldest") result = [...result].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return result;
  }, [tickets, search, activeTab, statusFilter, categoryFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(displayed.length / ITEMS_PER_PAGE));
  const paginated  = displayed.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleTabChange = (key: string) => { setActiveTab(key); setPage(1); };
  const handleFilter    = (setter: (v: string) => void) => (val: string) => { setter(val); setPage(1); };

  return (
    <div className="flex min-h-screen bg-[#f5f5f0]">
      {/* ─── Left Sidebar ─── */}
      <aside className="hidden xl:flex flex-col w-[220px] shrink-0 sticky top-0 h-screen bg-white border-r border-gray-100 py-6 px-3">
        <div className="px-3 mb-8">
          <img src="/divy-power-logo.png" alt="Divy Power" className="h-9 w-auto" />
          <p className="text-[10px] text-gray-400 mt-1">Solar operations, made simple</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {[
            { href: "/",          label: "Home",              active: false, icon: "home" },
            { href: "/orders",    label: "My Orders",         active: false, icon: "orders" },
            { href: "/orders/new",label: "New Order",         active: false, icon: "box",    badge: "New" },
            { href: "/tickets",   label: "Help & Support",    active: true,  icon: "support" },
            { href: "/referrals", label: "Referral & Rewards",active: false, icon: "referral" },
            { href: "/account",   label: "Account",           active: false, icon: "account" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                item.active ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800")}>
              <span className={cn("size-4 shrink-0", item.active ? "text-orange-500" : "text-gray-400")}>
                {item.icon === "home"     && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
                {item.icon === "orders"   && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>}
                {item.icon === "box"      && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
                {item.icon === "support"  && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>}
                {item.icon === "referral" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                {item.icon === "account"  && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && <span className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-3 pb-2">
          <div className="rounded-xl bg-orange-50 border border-orange-100 p-3">
            <p className="text-xs font-semibold text-orange-900">Need immediate help?</p>
            <p className="text-[11px] text-orange-600 mt-0.5">Mon–Sat, 9:00 AM – 6:00 PM</p>
            <Link href="/tickets/new" className="mt-2 block w-full text-center text-xs font-bold bg-orange-500 text-white py-1.5 rounded-lg hover:bg-orange-600 transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src="/divy-power-logo.png" alt="Divy Power" className="h-7 w-auto xl:hidden" />
            <div className="hidden xl:block">
              <p className="text-sm font-semibold text-gray-800">Customer Portal</p>
              <p className="text-xs text-gray-400">Solar operations, made simple</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
              <Globe className="size-3.5" /> English <ChevronDown className="size-3" />
            </button>
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell className="size-4 text-gray-500" />
              <span className="absolute top-1 right-1 size-2 bg-orange-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">U7</div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800">Hi, User</p>
                <p className="text-[11px] text-gray-400">7534034003</p>
              </div>
              <ChevronDown className="size-3.5 text-gray-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="flex-1 flex gap-0">
          {/* ─── Center ─── */}
          <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 space-y-5">

            {/* Title + CTA */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Help &amp; Support</h1>
                <p className="text-sm text-gray-500 mt-0.5">We're here to help. Raise a request or track any issue.</p>
              </div>
              <Link
                href="/tickets/new"
                className="shrink-0 inline-flex items-center gap-2 bg-orange-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
              >
                <Plus className="size-4" /> Raise a New Request
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "🎫", bg: "bg-orange-50", label: "Total Tickets", value: totalTickets, sub: "All time" },
                { icon: "✅", bg: "bg-emerald-50", label: "Resolved", value: resolvedCount, sub: "Completed" },
                { icon: "⏳", bg: "bg-amber-50",   label: "In Progress",  value: inProgCount,   sub: "Being worked on" },
                { icon: "🚫", bg: "bg-gray-50",    label: "Closed",       value: closedCount,   sub: "Closed tickets" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                  <div className={cn("size-11 rounded-full flex items-center justify-center text-xl shrink-0", stat.bg)}>
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

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200">
              {TAB_FILTERS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={cn(
                    "px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px",
                    activeTab === tab.key
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  {tab.label}
                </button>
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
                  placeholder="Search by ticket ID, issue or order ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                />
              </div>
              <div className="relative">
                <select value={statusFilter} onChange={(e) => handleFilter(setStatusFilter)(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer">
                  <option value="ALL">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={categoryFilter} onChange={(e) => handleFilter(setCategoryFilter)(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer">
                  <option value="ALL">All Categories</option>
                  {uniqueCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Ticket List */}
            {paginated.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center py-20 text-center">
                <div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-3xl">🎫</div>
                <p className="text-base font-semibold text-gray-600">{totalTickets === 0 ? "No tickets yet" : "No matching tickets"}</p>
                <p className="text-sm text-gray-400 mt-1 max-w-xs">
                  {totalTickets === 0 ? "Raise a request and our team will follow up." : "Try adjusting your search or filters."}
                </p>
                {totalTickets === 0 && (
                  <Link href="/tickets/new" className="mt-5 inline-flex items-center gap-2 bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-orange-600 transition-colors">
                    <Plus className="size-4" /> Raise a Request
                  </Link>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {paginated.map((ticket) => {
                    const catDisplay = getCategoryDisplay(ticket.category);
                    const catMeta = CATEGORY_ICONS[catDisplay] ?? CATEGORY_ICONS[ticket.category] ?? { bg: "bg-gray-100", icon: "💬" };
                    const orderId  = ticket.order?.orderNumber ?? (ticket.orderId ? `#${ticket.orderId.slice(-6).toUpperCase()}` : null);
                    const dateStr  = format(new Date(ticket.createdAt), "d MMM yyyy");
                    const note     = getTicketNote(ticket);

                    return (
                      <div key={ticket.id} className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors group">
                        {/* Category icon */}
                        <div className={cn("size-11 rounded-full flex items-center justify-center text-xl shrink-0", catMeta.bg)}>
                          {catMeta.icon}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800">{ticket.id.slice(0, 12).toUpperCase().replace(/-/g, "").slice(0, 11)}</p>
                          <p className="text-xs text-gray-600 mt-0.5 truncate">{ticket.description}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                            {orderId && <span>Order ID: {orderId}</span>}
                            {orderId && <span>•</span>}
                            <span>{dateStr}</span>
                          </div>
                        </div>

                        {/* Status + note */}
                        <div className="hidden sm:block shrink-0 w-40 text-right">
                          <StatusPill status={ticket.status} />
                          <p className="text-[11px] text-gray-400 mt-1.5 leading-tight">{note}</p>
                        </div>

                        {/* View Details */}
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="shrink-0 inline-flex items-center gap-1.5 border border-orange-300 text-orange-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          View Details <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-500">
                    Showing {displayed.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, displayed.length)} of {displayed.length} tickets
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      className="size-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">
                      <ChevronLeft className="size-4" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pg = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                      return (
                        <button key={pg} onClick={() => setPage(pg)}
                          className={cn("size-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                            pg === page ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-600 hover:bg-white")}>
                          {pg}
                        </button>
                      );
                    })}
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="size-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* ─── Right Sidebar ─── */}
          <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0 px-4 py-6 space-y-4">

            {/* Need Help */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-gray-800 mb-4">
                Need help? <span className="text-gray-500 font-normal">We're here for you.</span>
              </p>
              <div className="space-y-2">
                {[
                  {
                    icon: "💬",
                    bg: "bg-green-100",
                    label: "Chat on WhatsApp",
                    sub: "Quick response",
                    href: "https://wa.me/911234567890",
                  },
                  {
                    icon: "📞",
                    bg: "bg-blue-100",
                    label: "Call Support",
                    sub: "+91 12345 67890",
                    href: "tel:+911234567890",
                  },
                  {
                    icon: "🎫",
                    bg: "bg-purple-100",
                    label: "Create a Ticket",
                    sub: "Get help via ticket",
                    href: "/tickets/new",
                  },
                  {
                    icon: "💬",
                    bg: "bg-orange-100",
                    label: "Live Chat",
                    sub: "Chat with our team",
                    href: "/tickets/new",
                  },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className={cn("size-10 rounded-full flex items-center justify-center text-lg shrink-0", item.bg)}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.sub}</p>
                    </div>
                    <ChevRight className="size-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Our Commitment */}
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-full bg-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="size-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-teal-900">Our Commitment</p>
                  <p className="text-xs text-teal-700 mt-1 leading-relaxed">
                    We're dedicated to providing fast and reliable support to keep your solar journey smooth.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-gray-800 mb-3">Frequently Asked Questions</p>
              <div className="space-y-1">
                {FAQ_ITEMS.map((faq, idx) => (
                  <div key={idx} className="border-b border-gray-50 last:border-0">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between gap-2 py-2.5 text-left"
                    >
                      <span className="text-xs font-semibold text-gray-700">{faq.q}</span>
                      <ChevRight className={cn("size-4 text-gray-400 shrink-0 transition-transform", openFaq === idx && "rotate-90")} />
                    </button>
                    {openFaq === idx && (
                      <p className="text-xs text-gray-500 pb-2.5 leading-relaxed">{faq.a}</p>
                    )}
                  </div>
                ))}
              </div>
              <Link href="/tickets/new" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-700">
                View all FAQs <ArrowRight className="size-3" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}