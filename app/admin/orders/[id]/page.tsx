import { getOrder, updateOrderStatus } from "@/app/actions/orders";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { OrderStatusForm } from "@/components/order-status-form";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ORDER_STATUSES } from "@/types";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id).catch(() => null);

  if (!order) {
    notFound();
  }

  const priceInRupees = (order.product.price / 100).toFixed(2);

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/orders">
          <Button variant="ghost">← Back to Orders</Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order Details</h1>
            <p className="text-gray-500">
              Created on {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' HH:mm")}
            </p>
          </div>
          <StatusBadge status={order.status} type="order" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Product Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Product:</span> {order.product.name}</p>
              <p><span className="font-medium">Capacity:</span> {order.product.capacity}</p>
              <p><span className="font-medium">Category:</span> {order.product.category}</p>
              <p><span className="font-medium">Price:</span> ₹{priceInRupees}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {order.user.name}</p>
              <p><span className="font-medium">Email:</span> {order.user.email}</p>
              <p><span className="font-medium">Phone:</span> {order.user.phone || "Not provided"}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Installation Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Address:</span> {order.address}</p>
              <p><span className="font-medium">Phone:</span> {order.phone}</p>
              {order.notes && (
                <p><span className="font-medium">Notes:</span> {order.notes}</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Update Status</h2>
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}

