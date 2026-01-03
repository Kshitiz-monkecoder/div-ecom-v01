import { getUserDetails } from "@/app/actions/admin";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUserDetails(params.id);

  if (!user) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/users">
          <Button variant="ghost">← Back to Users</Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
          <div className="flex gap-2 items-center">
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
              {user.role}
            </Badge>
            <span className="text-gray-500">
              Joined {format(new Date(user.createdAt), "MMMM dd, yyyy")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Phone:</span> {user.phone || "Not provided"}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Total Orders:</span> {user.orders.length}</p>
              <p><span className="font-medium">Total Tickets:</span> {user.tickets.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Orders</h2>
          <div className="space-y-4">
            {user.orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{order.product.name}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(order.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <StatusBadge status={order.status} type="order" />
                </div>
              </Link>
            ))}
            {user.orders.length === 0 && (
              <p className="text-gray-500">No orders yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Tickets</h2>
          <div className="space-y-4">
            {user.tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/admin/tickets/${ticket.id}`}
                className="block p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{ticket.category}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {ticket.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <StatusBadge status={ticket.status} type="ticket" />
                </div>
              </Link>
            ))}
            {user.tickets.length === 0 && (
              <p className="text-gray-500">No tickets yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

