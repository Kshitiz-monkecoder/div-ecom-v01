import { getDashboardStats } from "@/app/actions/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import Link from "next/link";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>All orders in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Tickets</CardTitle>
            <CardDescription>Tickets requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.openTickets}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest 10 orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentOrders.map((order) => {
                const totalAmount = order.items.reduce(
                  (sum, item) => sum + item.unitPrice * item.quantity,
                  0
                );
                const itemCount = order.items.length;
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      {order.orderNumber}
                      <div className="text-sm text-gray-500">
                        {itemCount} product{itemCount !== 1 ? "s" : ""} • ₹
                        {(totalAmount / 100).toFixed(2)}
                      </div>
                    </TableCell>
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
                );
              })}
            </TableBody>
          </Table>
          {stats.recentOrders.length === 0 && (
            <p className="text-center text-gray-500 py-4">No orders yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
          <CardDescription>Latest 10 tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.category}</TableCell>
                  <TableCell>{ticket.user.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} type="ticket" />
                  </TableCell>
                  <TableCell>
                    {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/tickets/${ticket.id}`}>
                      <span className="text-primary hover:underline">View</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {stats.recentTickets.length === 0 && (
            <p className="text-center text-gray-500 py-4">No tickets yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

