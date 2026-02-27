"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketCard } from "@/components/ticket-card";
import { CreateTicketButton } from "@/components/create-ticket-button";
import { Wrench, FileCheck, Phone, MessageCircle } from "lucide-react";
import type { Ticket } from "@prisma/client";

const PHONE_NUMBER = "9310259325";
const WHATSAPP_NUMBER = "919310259325";

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

export function SupportPageClient({
  tickets,
  filteredTickets,
  searchParams,
  ticketCount,
}: SupportPageClientProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("support.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("support.subtitle")}</p>
        </div>
        <CreateTicketButton />
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button asChild variant="outline" className="h-auto flex flex-col items-center gap-2 p-4 min-h-[48px]">
          <Link href="/tickets/new">
            <Wrench className="h-6 w-6" />
            <span className="text-sm font-medium">{t("support.registerComplaint")}</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex flex-col items-center gap-2 p-4 min-h-[48px]">
          <Link href="/orders">
            <FileCheck className="h-6 w-6" />
            <span className="text-sm font-medium">{t("support.checkSubsidy")}</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex flex-col items-center gap-2 p-4 min-h-[48px]">
          <a href={`tel:+91${PHONE_NUMBER}`}>
            <Phone className="h-6 w-6" />
            <span className="text-sm font-medium">{t("support.callNow")}</span>
          </a>
        </Button>
        <Button asChild variant="outline" className="h-auto flex flex-col items-center gap-2 p-4 min-h-[48px]">
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-6 w-6" />
            <span className="text-sm font-medium">{t("support.whatsappChat")}</span>
          </a>
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">{t("support.filterByStatus")}</p>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/tickets"
              className={`px-3 py-2 rounded-md text-sm min-h-[48px] flex items-center ${
                !searchParams.status ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {t("support.all")}
            </Link>
            {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
              <Link
                key={status}
                href={`/tickets?status=${status}`}
                className={`px-3 py-2 rounded-md text-sm min-h-[48px] flex items-center ${
                  searchParams.status === status ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {t(`support.ticketStatus${status}`)}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">{t("support.filterByCategory")}</p>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/tickets"
              className={`px-3 py-2 rounded-md text-sm min-h-[48px] flex items-center ${
                !searchParams.category ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {t("support.all")}
            </Link>
            {["Installation Issue", "Product Issue", "Billing / Payment", "General Query"].map((cat) => (
              <Link
                key={cat}
                href={`/tickets?category=${encodeURIComponent(cat)}`}
                className={`px-3 py-2 rounded-md text-sm min-h-[48px] flex items-center ${
                  searchParams.category === cat ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* My tickets */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("support.myTickets")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
        {filteredTickets.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            {ticketCount === 0 ? t("support.noTickets") : t("support.noTicketsFilter")}
          </p>
        )}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>❓ {t("support.faqTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.qKey}
              className="group rounded-lg border border-border overflow-hidden"
            >
              <summary className="px-4 py-3 cursor-pointer list-none flex items-center justify-between font-medium [&::-webkit-details-marker]:hidden">
                {t(item.qKey)}
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 py-3 bg-muted/50 text-sm text-muted-foreground border-t border-border">
                {t(item.aKey)}
              </div>
            </details>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
