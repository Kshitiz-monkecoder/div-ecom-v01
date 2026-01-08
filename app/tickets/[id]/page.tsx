import { Navbar } from "@/components/navbar";
import { StatusBadge } from "@/components/status-badge";
import { getTicket } from "@/app/actions/tickets";
import { requireAuth } from "@/lib/middleware";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const ticket = await getTicket(id).catch(() => null);

  if (!ticket) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/tickets">
            <Button variant="ghost">← Back to Tickets</Button>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{ticket.category}</h1>
              <p className="text-gray-500">
                Created on {format(new Date(ticket.createdAt), "MMMM dd, yyyy 'at' HH:mm")}
              </p>
            </div>
            <StatusBadge status={ticket.status} type="ticket" />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {ticket.description}
            </p>
          </div>

          {ticket.order && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Related Order</h2>
              <Link
                href={`/orders/${ticket.order.id}`}
                className="block p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <p className="font-medium">{ticket.order.product.name}</p>
                <p className="text-sm text-gray-500">
                  Order placed on {format(new Date(ticket.order.createdAt), "MMM dd, yyyy")}
                </p>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

