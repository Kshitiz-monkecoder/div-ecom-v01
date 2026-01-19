import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "@prisma/client";
import { format } from "date-fns";

interface TicketCardProps {
  ticket: Ticket & {
    order?: {
      items: Array<{
        product?: {
          name: string;
        } | null;
        name: string;
      }>;
    } | null;
  };
}

export function TicketCard({ ticket }: TicketCardProps) {
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
            <StatusBadge status={ticket.status} type="ticket" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm line-clamp-2 mb-2">{ticket.description}</p>
          {ticket.order && ticket.order.items.length > 0 && (
            <Badge variant="outline">
              Related to: {ticket.order.items.length === 1
                ? ticket.order.items[0]?.product?.name || ticket.order.items[0]?.name
                : `${ticket.order.items.length} items`}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

