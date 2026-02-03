import CustomerLayout from "@/components/customer-layout";
import { StatusBadge } from "@/components/status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { getTicket } from "@/app/actions/tickets";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getTicket(id).catch(() => null);

  if (!ticket) {
    notFound();
  }

  const statusTimeline = ticket.statusHistory.map((entry) => {
    let images: string[] = [];
    if (entry.imagesJson) {
      try {
        const parsed = JSON.parse(entry.imagesJson);
        if (Array.isArray(parsed)) {
          images = parsed;
        }
      } catch {
        images = [];
      }
    }

    return {
      id: entry.id,
      status: entry.status,
      note: entry.note,
      images,
      createdAt: entry.createdAt,
      createdBy: entry.createdBy ? { name: entry.createdBy.name, email: entry.createdBy.email } : null,
    };
  });

  return (
    <CustomerLayout>
      <div className="max-w-4xl">
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

          {ticket.images.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Supporting Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ticket.images.map((image, index) => (
                  <div key={image.id} className="relative h-28 w-full">
                    <Image
                      src={image.url}
                      alt={`Support image ${index + 1}`}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {ticket.order && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Related Order</h2>
              <Link
                href={`/orders/${ticket.order.id}`}
                className="block p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <p className="font-medium">
                  {ticket.order.items.length === 1
                    ? ticket.order.items[0]?.product?.name || ticket.order.items[0]?.name
                    : `${ticket.order.items.length} items`}
                </p>
                <p className="text-sm text-gray-500">
                  Order placed on {format(new Date(ticket.order.createdAt), "MMM dd, yyyy")}
                </p>
              </Link>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-2">Contact Support</h2>
            <p className="text-sm text-muted-foreground">
              Need immediate assistance? Call{" "}
              <a href="tel:+917065028801" className="text-primary underline">
                +91 70650 28801
              </a>
              .
            </p>
          </div>

          <StatusTimeline items={statusTimeline} type="ticket" />
        </div>
      </div>
    </CustomerLayout>
  );
}

