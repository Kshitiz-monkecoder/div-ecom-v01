import { Navbar } from "@/components/navbar";
import { OrderCard } from "@/components/order-card";
import { getUserOrders } from "@/app/actions/orders";
import { requireAuth } from "@/lib/middleware";
import { ORDER_STATUSES } from "@/types";
import Link from "next/link";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  await requireAuth();
  const orders = await getUserOrders();
  const filteredOrders = searchParams.status
    ? orders.filter((o) => o.status === searchParams.status)
    : orders;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {/* Status Filter */}
        <div className="mb-8 flex gap-4 flex-wrap">
          <Link
            href="/orders"
            className={`px-4 py-2 rounded ${
              !searchParams.status
                ? "bg-primary text-primary-foreground"
                : "bg-gray-200 dark:bg-gray-800"
            }`}
          >
            All
          </Link>
          {ORDER_STATUSES.map((status) => (
            <Link
              key={status}
              href={`/orders?status=${status}`}
              className={`px-4 py-2 rounded ${
                searchParams.status === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-200 dark:bg-gray-800"
              }`}
            >
              {status.replace("_", " ")}
            </Link>
          ))}
        </div>

        {/* Orders List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            {orders.length === 0
              ? "You haven't placed any orders yet."
              : "No orders found with this status."}
          </p>
        )}
      </div>
    </div>
  );
}

