import { getAllOrders } from "@/app/actions/orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Orders</h1>
        <Link href="/admin/orders/new">
          <Button>Create New Order</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const totalAmount = order.items.reduce(
                  (sum, item) => sum + item.unitPrice * item.quantity,
                  0
                );
                const itemCount = order.items.length;
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/users/${order.user.id}`}
                        className="text-primary hover:underline"
                      >
                        {order.user.name}
                      </Link>
                      <div className="text-sm text-gray-500">{order.user.phone}</div>
                    </TableCell>
                    <TableCell>
                      {itemCount} product{itemCount !== 1 ? "s" : ""}
                      {itemCount > 0 && (
                        <div className="text-sm text-gray-500">
                          {order.items[0]?.name}
                          {itemCount > 1 && ` + ${itemCount - 1} more`}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{(totalAmount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} type="order" />
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary hover:underline"
                      >
                        View Details
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {orders.length === 0 && (
            <p className="text-center text-gray-500 py-8">No orders found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

