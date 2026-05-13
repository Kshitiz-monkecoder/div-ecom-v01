"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, FileCheck, Headphones, MessageCircle, Phone, Search, Wrench } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TicketCard } from "@/components/ticket-card";
import { CreateTicketButton } from "@/components/create-ticket-button";
import { CustomerCard, CustomerPage, CustomerPageHeader, EmptyState, MetricCard, SectionHeader } from "@/components/customer-portal-ui";
import { formatStatusLabel } from "@/components/customer-status";
import type { Ticket } from "@/types";

const FAQ_ITEMS = [
  { qKey: "support.faq1q", aKey: "support.faq1a" },
  { qKey: "support.faq2q", aKey: "support.faq2a" },
  { qKey: "support.faq3q", aKey: "support.faq3a" },
  { qKey: "support.faq4q", aKey: "support.faq4a" },
  { qKey: "support.faq5q", aKey: "support.faq5a" },
  { qKey: "support.faq6q", aKey: "support.faq6a" },
] as const;

type TicketWithOrder = Ticket & {
  order?: {
    items: Array<{
      product?: { name: string } | null;
      name: string;
    }>;
  } | null;
};

type SupportPageClientProps = {
  tickets: TicketWithOrder[];
  filteredTickets: TicketWithOrder[];
  searchParams: { status?: string; category?: string };
  ticketCount: number;
};

const statusFilters = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const categoryFilters = ["Installation Issue", "Product Issue", "Billing / Payment", "General Query"];

export function SupportPageClient({
  tickets,
  filteredTickets,
  searchParams,
  ticketCount,
}: SupportPageClientProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");

  const openCount = tickets.filter((ticket) => ticket.status === "OPEN").length;
  const inProgressCount = tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((ticket) => ["RESOLVED", "CLOSED"].includes(ticket.status)).length;

  const visibleTickets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filteredTickets;
    return filteredTickets.filter((ticket) => {
      const orderText = ticket.order?.items?.map((item) => item.product?.name || item.name).join(" ") || "";
      return [ticket.category, ticket.description, ticket.status, orderText].join(" ").toLowerCase().includes(q);
    });
  }, [filteredTickets, query]);

  return (
    <CustomerPage className="space-y-8">
      <CustomerPageHeader
        eyebrow="Support center"
        title="Fast, structured customer support"
        description="Create tickets with the right category, attach images, track status, and keep every service request connected to the correct order."
        actions={<CreateTicketButton />}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total tickets" value={ticketCount} icon={<Headphones className="size-5" />} detail="All support requests raised by you." tone="dark" />
        <MetricCard label="Received" value={openCount} icon={<MessageCircle className="size-5" />} detail="New requests waiting for review." tone="blue" />
        <MetricCard label="Under review" value={inProgressCount} icon={<Wrench className="size-5" />} detail="Requests currently being handled." tone="solar" />
        <MetricCard label="Resolved" value={resolvedCount} icon={<FileCheck className="size-5" />} detail="Closed or resolved support work." tone="green" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SupportAction href="/tickets/new" icon={<Wrench className="size-5" />} title={t("support.registerComplaint")} description="Installation, product, billing, or general query." primary />
        <SupportAction href="/orders" icon={<FileCheck className="size-5" />} title={t("support.checkSubsidy")} description="Review order documents and project status." />
        <SupportAction href="tel:+917065028801" icon={<Phone className="size-5" />} title={t("support.callNow")} description="Talk to the Divy Power team during support hours." />
        <SupportAction href="/tickets/new" icon={<MessageCircle className="size-5" />} title={t("support.whatsappChat")} description="Create a request with context first." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <CustomerCard className="p-5">
          <SectionHeader
            title={t("support.myTickets")}
            description="Filter by status or category, then open a ticket for full history."
            action={<span className="text-sm font-medium text-slate-500">{visibleTickets.length} shown</span>}
          />

          <div className="mb-5 space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tickets by category, issue, status, or order"
                className="h-12 rounded-full border-slate-200 bg-white pl-11 shadow-none"
              />
            </div>

            <FilterRow
              label={t("support.filterByStatus")}
              allHref="/tickets"
              allActive={!searchParams.status}
              items={statusFilters.map((status) => ({
                href: `/tickets?status=${status}`,
                label: formatStatusLabel(status),
                active: searchParams.status === status,
              }))}
            />
            <FilterRow
              label={t("support.filterByCategory")}
              allHref="/tickets"
              allActive={!searchParams.category}
              items={categoryFilters.map((category) => ({
                href: `/tickets?category=${encodeURIComponent(category)}`,
                label: category,
                active: searchParams.category === category,
              }))}
            />
          </div>

          {visibleTickets.length === 0 ? (
            <EmptyState
              title={ticketCount === 0 ? "No tickets yet" : "No matching tickets"}
              description={ticketCount === 0 ? "When you need help, create a structured ticket and our team will follow up." : "Try clearing filters or searching a different issue."}
              action={
                <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-slate-800">
                  <Link href="/tickets/new">Create ticket</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {visibleTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </CustomerCard>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <CustomerCard className="p-5">
            <h2 className="text-lg font-semibold text-orange-900">{t("support.faqTitle")}</h2>
            <div className="mt-4 space-y-2">
              {FAQ_ITEMS.map((item) => (
                <details key={item.qKey} className="group rounded-2xl border border-slate-100 bg-slate-50">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-orange-900 [&::-webkit-details-marker]:hidden">
                    {t(item.qKey)}
                    <ChevronDown className="size-4 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-slate-100 px-4 py-3 text-sm leading-6 text-muted-foreground">
                    {t(item.aKey)}
                  </div>
                </details>
              ))}
            </div>
          </CustomerCard>

          <CustomerCard className="bg-primary p-5 text-white">
            <p className="text-lg font-semibold">Support hours</p>
            <p className="mt-2 text-sm leading-6 text-white/65">Mon-Sat, 9:00 AM to 6:00 PM. For urgent issues, call the team directly.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-white text-orange-900 hover:bg-emerald-50">
                <a href="tel:+917065028801">Call now</a>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                <Link href="/tickets/new">New ticket</Link>
              </Button>
            </div>
          </CustomerCard>
        </aside>
      </section>
    </CustomerPage>
  );
}

function SupportAction({
  href,
  icon,
  title,
  description,
  primary,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  primary?: boolean;
}) {
  const content = (
    <>
      <span className={`flex size-11 items-center justify-center rounded-2xl ${primary ? "bg-white/10 text-orange-200" : "bg-emerald-50 text-orange-600"}`}>
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className={`mt-1 block text-xs leading-5 ${primary ? "text-white/65" : "text-slate-500"}`}>{description}</span>
      </span>
    </>
  );

  const className = `flex min-h-[132px] flex-col gap-4 rounded-[1.5rem] border p-4 transition-all customer-focus-ring ${
    primary
      ? "border-slate-950 bg-primary text-primary-foreground shadow-[0_24px_60px_-38px_rgba(15,23,42,0.85)]"
      : "border-white/80 bg-white/90 text-orange-900 hover:-translate-y-0.5 hover:bg-white"
  }`;

  if (href.startsWith("tel:")) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

function FilterRow({
  label,
  allHref,
  allActive,
  items,
}: {
  label: string;
  allHref: string;
  allActive: boolean;
  items: { href: string; label: string; active: boolean }[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href={allHref}
          className={`h-10 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors customer-focus-ring ${
            allActive ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-slate-100"
          }`}
        >
          All
        </Link>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`h-10 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors customer-focus-ring ${
              item.active ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-slate-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
