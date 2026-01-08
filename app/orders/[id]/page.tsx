import { Navbar } from "@/components/navbar";
import { StatusBadge } from "@/components/status-badge";
import { getOrder } from "@/app/actions/orders";
import { requireAuth } from "@/lib/middleware";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const order = await getOrder(id).catch(() => null);

  if (!order) {
    notFound();
  }

  const priceInRupees = (order.product.price / 100).toFixed(2);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/orders">
            <Button variant="ghost">← Back to Orders</Button>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Order Details</h1>
              <p className="text-gray-500">
                Placed on {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' HH:mm")}
              </p>
            </div>
            <StatusBadge status={order.status} type="order" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Product Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Product:</span> {order.product.name}</p>
                <p><span className="font-medium">Capacity:</span> {order.product.capacity}</p>
                <p><span className="font-medium">Category:</span> {order.product.category}</p>
                <p><span className="font-medium">Price:</span> ₹{priceInRupees}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Installation Details</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Address:</span> {order.address}</p>
                <p><span className="font-medium">Phone:</span> {order.phone}</p>
                {order.notes && (
                  <p><span className="font-medium">Notes:</span> {order.notes}</p>
                )}
              </div>
            </div>
          </div>

          {order.tickets && order.tickets.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Related Tickets</h2>
              <div className="space-y-2">
                {order.tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="block p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <p className="font-medium">{ticket.category}</p>
                    <p className="text-sm text-gray-500">{ticket.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

