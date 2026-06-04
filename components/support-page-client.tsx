"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevRight,
  Plus,
  Search,
  Shield,
} from "lucide-react";
import { formatStatusLabel } from "@/components/customer-status";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";
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
  "Installation Issue": { bg: "bg-blue-100",   icon: "⚡" },
  "Product Issue":      { bg: "bg-orange-100", icon: "🔧" },
  "Billing / Payment":  { bg: "bg-green-100",  icon: "📄" },
  "General Query":      { bg: "bg-purple-100", icon: "💬" },
  "Plant On":           { bg: "bg-blue-100",   icon: "⚡" },
  "DG BreakDown":       { bg: "bg-red-100",    icon: "🔧" },
  "INC":                { bg: "bg-green-100",  icon: "📄" },
  "BOM Visit":          { bg: "bg-purple-100", icon: "🚚" },
};

function getCategoryDisplay(category: string) {
  const reverse: Record<string, string> = {
    "Plant On":     "Installation Issue",
    "DG BreakDown": "Product Issue",
    "INC":          "Billing / Payment",
    "BOM Visit":    "General Query",
  };
  return reverse[category] || category;
}

function StatusPill({ status, t }: { status: string; t: (k: string) => string }) {
  const colorMap: Record<string, string> = {
    OPEN:        "bg-sky-100 text-sky-700",
    IN_PROGRESS: "bg-amber-100 text-amber-700",
    RESOLVED:    "bg-emerald-100 text-emerald-700",
    CLOSED:      "bg-gray-100 text-gray-600",
  };
  const labelMap: Record<string, string> = {
    OPEN:        t("orderStatus.OPEN"),
    IN_PROGRESS: t("orderStatus.IN_PROGRESS"),
    RESOLVED:    t("orderStatus.RESOLVED"),
    CLOSED:      t("orderStatus.CLOSED"),
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", colorMap[status] ?? "bg-gray-100 text-gray-600")}>
      {labelMap[status] ?? formatStatusLabel(status)}
    </span>
  );
}

function getTicketNote(ticket: TicketWithOrder, t: (k: string) => string): string {
  const updated = new Date(ticket.updatedAt ?? ticket.createdAt);
  const dist = formatDistanceToNow(updated, { addSuffix: true });
  if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
    const label = ticket.status === "RESOLVED" ? t("orderStatus.RESOLVED") : t("orderStatus.CLOSED");
    return `${label} on ${format(updated, "d MMM yyyy")}`;
  }
  return `${t("support.updated")} ${dist}`;
}

const ITEMS_PER_PAGE = 5;

export function SupportPageClient({ tickets, filteredTickets, searchParams, ticketCount }: SupportPageClientProps) {
  const { t } = useLanguage();

  const TAB_FILTERS = [
    { key: "ALL",         label: t("support.all") },
    { key: "IN_PROGRESS", label: t("orderStatus.IN_PROGRESS") },
    { key: "RESOLVED",    label: t("orderStatus.RESOLVED") },
    { key: "CLOSED",      label: t("orderStatus.CLOSED") },
  ];

  const FAQ_ITEMS = [
    { q: t("support.faq1q"), a: t("support.faq1a") },
    { q: t("support.faq2q"), a: t("support.faq2a") },
    { q: t("support.faq3q"), a: t("support.faq3a") },
    { q: t("support.faq4q"), a: t("support.faq4a") },
  ];

  const SIDEBAR_ACTIONS = [
    { icon: "💬", bg: "bg-green-100",  label: t("support.whatsappChat"),     sub: t("support.quickResponse"),    href: "https://wa.me/911234567890" },
    { icon: "📞", bg: "bg-blue-100",   label: t("support.callNow"),          sub: "+91 12345 67890",              href: "tel:+911234567890" },
    { icon: "🎫", bg: "bg-purple-100", label: t("support.registerComplaint"), sub: t("support.getHelpViaTicket"), href: "/tickets/new" },
    { icon: "💬", bg: "bg-orange-100", label: t("support.liveChat"),         sub: t("support.chatWithTeam"),     href: "/tickets/new" },
  ];

  const [search, setSearch]                 = useState("");
  const [activeTab, setActiveTab]           = useState("ALL");
  const [statusFilter, setStatusFilter]     = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy]                 = useState("newest");
  const [page, setPage]                     = useState(1);
  const [openFaq, setOpenFaq]               = useState<number | null>(null);

  const totalTickets  = tickets.length;
  const resolvedCount = tickets.filter((tk) => tk.status === "RESOLVED").length;
  const inProgCount   = tickets.filter((tk) => tk.status === "IN_PROGRESS").length;
  const closedCount   = tickets.filter((tk) => tk.status === "CLOSED").length;

  const uniqueCategories = useMemo(
    () => Array.from(new Set(tickets.map((tk) => getCategoryDisplay(tk.category)))),
    [tickets]
  );

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = tickets.filter((tk) => {
      const tabMatch    = activeTab === "ALL" || tk.status === activeTab;
      const statusMatch = statusFilter === "ALL" || tk.status === statusFilter;
      const catMatch    = categoryFilter === "ALL" || getCategoryDisplay(tk.category) === categoryFilter;
      const searchable  = [tk.category, tk.description, tk.status, tk.order?.orderNumber ?? ""].join(" ").toLowerCase();
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
    <div className="flex flex-1 gap-0">
      {/* ─── Center ─── */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 space-y-5">

        {/* Title + CTA */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t("support.title")}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{t("support.subtitle")}</p>
          </div>
          <Link
            href="/tickets/new"
            className="shrink-0 inline-flex items-center gap-2 bg-orange-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
          >
            <Plus className="size-4" /> {t("support.registerComplaint")}
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "🎫", bg: "bg-orange-50",  label: t("support.totalTickets"), value: totalTickets,  sub: t("support.allTime") },
            { icon: "✅", bg: "bg-emerald-50", label: t("orderStatus.RESOLVED"), value: resolvedCount, sub: t("support.completed") },
            { icon: "⏳", bg: "bg-amber-50",   label: t("orderStatus.IN_PROGRESS"), value: inProgCount, sub: t("support.beingWorkedOn") },
            { icon: "🚫", bg: "bg-gray-50",    label: t("orderStatus.CLOSED"),   value: closedCount,   sub: t("support.closedTickets") },
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
              placeholder={t("support.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => handleFilter(setStatusFilter)(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer">
              <option value="ALL">{t("support.all")}</option>
              <option value="OPEN">{t("support.openStatus")}</option>
              <option value="IN_PROGRESS">{t("orderStatus.IN_PROGRESS")}</option>
              <option value="RESOLVED">{t("orderStatus.RESOLVED")}</option>
              <option value="CLOSED">{t("orderStatus.CLOSED")}</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={categoryFilter} onChange={(e) => handleFilter(setCategoryFilter)(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer">
              <option value="ALL">{t("support.allCategories")}</option>
              {uniqueCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer">
              <option value="newest">{t("support.newestFirst")}</option>
              <option value="oldest">{t("support.oldestFirst")}</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Ticket List */}
        {paginated.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-3xl">🎫</div>
            <p className="text-base font-semibold text-gray-600">
              {totalTickets === 0 ? t("support.noTicketsYet") : t("support.noMatchingTickets")}
            </p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              {totalTickets === 0 ? t("support.noTicketsRaise") : t("support.noMatchTry")}
            </p>
            {totalTickets === 0 && (
              <Link href="/tickets/new" className="mt-5 inline-flex items-center gap-2 bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-orange-600 transition-colors">
                <Plus className="size-4" /> {t("support.raiseRequest")}
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {paginated.map((ticket) => {
                const catDisplay = getCategoryDisplay(ticket.category);
                const catMeta    = CATEGORY_ICONS[catDisplay] ?? CATEGORY_ICONS[ticket.category] ?? { bg: "bg-gray-100", icon: "💬" };
                const orderId    = ticket.order?.orderNumber ?? (ticket.orderId ? `#${ticket.orderId.slice(-6).toUpperCase()}` : null);
                const dateStr    = format(new Date(ticket.createdAt), "d MMM yyyy");
                const note       = getTicketNote(ticket, t);

                return (
                  <div key={ticket.id} className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors group">
                    <div className={cn("size-11 rounded-full flex items-center justify-center text-xl shrink-0", catMeta.bg)}>
                      {catMeta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800">{ticket.id.slice(0, 12).toUpperCase().replace(/-/g, "").slice(0, 11)}</p>
                      <p className="text-xs text-gray-600 mt-0.5 truncate">{ticket.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                        {orderId && <span>{t("support.orderId")}: {orderId}</span>}
                        {orderId && <span>•</span>}
                        <span>{dateStr}</span>
                      </div>
                    </div>
                    <div className="hidden sm:block shrink-0 w-40 text-right">
                      <StatusPill status={ticket.status} t={t} />
                      <p className="text-[11px] text-gray-400 mt-1.5 leading-tight">{note}</p>
                    </div>
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="shrink-0 inline-flex items-center gap-1.5 border border-orange-300 text-orange-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      {t("common.viewDetails")} <ArrowRight className="size-3" />
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                {t("support.showing", {
                  from: String(displayed.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1),
                  to: String(Math.min(page * ITEMS_PER_PAGE, displayed.length)),
                  total: String(displayed.length),
                })}
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
            {t("nav.needHelp")} <span className="text-gray-500 font-normal">{t("support.hereForYou")}</span>
          </p>
          <div className="space-y-2">
            {SIDEBAR_ACTIONS.map((item) => (
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
              <p className="text-sm font-bold text-teal-900">{t("support.ourCommitment")}</p>
              <p className="text-xs text-teal-700 mt-1 leading-relaxed">{t("support.commitmentDesc")}</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm font-bold text-gray-800 mb-3">{t("support.faqTitle")}</p>
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
            {t("support.viewAllFaqs")} <ArrowRight className="size-3" />
          </Link>
        </div>
      </aside>
    </div>
  );
}