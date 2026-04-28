import { getTicket } from "@/app/actions/tickets";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { TicketStatusForm } from "@/components/ticket-status-form";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TICKET_SUB_CATEGORIES } from "@/types";
import { parseTicketSubCategories } from "@/lib/ticket-subcategories";

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getTicket(id).catch(() => null);

  if (!ticket) {
    notFound();
  }

  const subCategories = parseTicketSubCategories(ticket.subCategories);

  // Get labels for sub-categories
  const getSubCategoryLabel = (value: string) => {
    if (ticket.category === "General Query") return value;
    const categorySubCats = TICKET_SUB_CATEGORIES[ticket.category] || [];
    const found = categorySubCats.find((sc) => sc.value === value);
    return found ? found.label : value;
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/tickets">
          <Button variant="ghost">← Back to Tickets</Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{ticket.category}</h1>
            <p className="text-gray-500">
              Created on {format(new Date(ticket.createdAt), "MMMM dd, yyyy 'at' HH:mm")}
            </p>
          </div>
          <StatusBadge status={ticket.status} type="ticket" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {ticket.user.name}</p>
              <p><span className="font-medium">Email:</span> {ticket.user.email}</p>
              <p><span className="font-medium">Phone:</span> {ticket.user.phone || "Not provided"}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Update Status</h2>
            <TicketStatusForm ticketId={ticket.id} currentStatus={ticket.status} />
          </div>
        </div>

        {subCategories.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Reported Issues</h2>
            {ticket.category === "General Query" ? (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <p className="text-sm">{subCategories[0]}</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subCategories.map((subCat, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3">
                    {getSubCategoryLabel(subCat)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
            {ticket.description}
          </p>
        </div>

        {ticket.order && ticket.order.items.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Related Order</h2>
            <Link
              href={`/admin/orders/${ticket.order.id}`}
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
      </div>
    </div>
  );
}

