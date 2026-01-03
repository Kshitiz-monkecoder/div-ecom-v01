import { getAllOrders } from "@/app/actions/orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { ORDER_STATUSES } from "@/types";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const orders = await getAllOrders(
    searchParams.status as any
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      {/* Status Filter */}
      <div className="mb-8 flex gap-4 flex-wrap">
        <Link
          href="/admin/orders"
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
            href={`/admin/orders?status=${status}`}
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

      <div className="bg-white dark:bg-gray-900 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.product.name}</TableCell>
                <TableCell>{order.user.name}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status} type="order" />
                </TableCell>
                <TableCell>
                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <Link href={`/admin/orders/${order.id}`}>
                    <span className="text-primary hover:underline">View</span>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.length === 0 && (
          <p className="text-center text-gray-500 py-8">No orders found.</p>
        )}
      </div>
    </div>
  );
}

