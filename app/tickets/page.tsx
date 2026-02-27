import CustomerLayout from "@/components/customer-layout";
import { SupportPageClient } from "@/components/support-page-client";
import { getUserTickets } from "@/app/actions/tickets";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: { status?: string; category?: string };
}) {
  const tickets = await getUserTickets();

  let filteredTickets = tickets;
  if (searchParams.status) {
    filteredTickets = filteredTickets.filter((t) => t.status === searchParams.status);
  }
  if (searchParams.category) {
    filteredTickets = filteredTickets.filter((t) => t.category === searchParams.category);
  }

  return (
    <CustomerLayout>
      <SupportPageClient
        tickets={tickets}
        filteredTickets={filteredTickets}
        searchParams={searchParams}
        ticketCount={tickets.length}
      />
    </CustomerLayout>
  );
}
