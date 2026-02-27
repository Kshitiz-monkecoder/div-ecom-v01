"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/language-provider";
import { Ticket } from "@prisma/client";
import { format } from "date-fns";

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

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

export function TicketCard({ ticket }: TicketCardProps) {
  const { t } = useLanguage();
  const statusKey = `support.ticketStatus${ticket.status}`;
  const statusLabel = t(statusKey);

  return (
    <Link href={`/tickets/${ticket.id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{ticket.category}</CardTitle>
              <CardDescription>
                {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
              </CardDescription>
            </div>
            <Badge className={statusColors[ticket.status] || "bg-gray-100 text-gray-800"} variant="secondary">
              {statusLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm line-clamp-2 mb-2">{ticket.description}</p>
          {ticket.order && ticket.order.items.length > 0 && (
            <Badge variant="outline">
              {ticket.order.items.length === 1
                ? ticket.order.items[0]?.product?.name || ticket.order.items[0]?.name
                : `${ticket.order.items.length} items`}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
