import { getAllTickets } from "@/app/actions/tickets";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { TICKET_STATUSES } from "@/types";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const tickets = await getAllTickets(
    searchParams.status as any
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tickets</h1>

      {/* Status Filter */}
      <div className="mb-8 flex gap-4 flex-wrap">
        <Link
          href="/admin/tickets"
          className={`px-4 py-2 rounded ${
            !searchParams.status
              ? "bg-primary text-primary-foreground"
              : "bg-gray-200 dark:bg-gray-800"
          }`}
        >
          All
        </Link>
        {TICKET_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/tickets?status=${status}`}
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
              <TableHead>Category</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
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
        {tickets.length === 0 && (
          <p className="text-center text-gray-500 py-8">No tickets found.</p>
        )}
      </div>
    </div>
  );
}

