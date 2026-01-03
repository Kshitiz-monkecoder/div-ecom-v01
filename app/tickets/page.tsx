import { Navbar } from "@/components/navbar";
import { TicketCard } from "@/components/ticket-card";
import { Button } from "@/components/ui/button";
import { getUserTickets } from "@/app/actions/tickets";
import { requireAuth } from "@/lib/middleware";
import Link from "next/link";
import { TICKET_STATUSES, TICKET_CATEGORIES } from "@/types";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: { status?: string; category?: string };
}) {
  await requireAuth();
  const tickets = await getUserTickets();
  
  let filteredTickets = tickets;
  if (searchParams.status) {
    filteredTickets = filteredTickets.filter((t) => t.status === searchParams.status);
  }
  if (searchParams.category) {
    filteredTickets = filteredTickets.filter((t) => t.category === searchParams.category);
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <Link href="/tickets/new">
            <Button>Create New Ticket</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Filter by Status:</p>
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/tickets"
                className={`px-3 py-1 rounded text-sm ${
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
                  href={`/tickets?status=${status}`}
                  className={`px-3 py-1 rounded text-sm ${
                    searchParams.status === status
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-200 dark:bg-gray-800"
                  }`}
                >
                  {status.replace("_", " ")}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Filter by Category:</p>
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/tickets"
                className={`px-3 py-1 rounded text-sm ${
                  !searchParams.category
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
              >
                All
              </Link>
              {TICKET_CATEGORIES.map((category) => (
                <Link
                  key={category}
                  href={`/tickets?category=${category}`}
                  className={`px-3 py-1 rounded text-sm ${
                    searchParams.category === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-200 dark:bg-gray-800"
                  }`}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            {tickets.length === 0
              ? "You haven't created any tickets yet."
              : "No tickets found with these filters."}
          </p>
        )}
      </div>
    </div>
  );
}

