import { SupportPageClient } from "@/components/support-page-client";
import { getUserTickets } from "@/app/actions/tickets";
import { requireAuth } from "@/lib/proxy";
import { LanguageProvider } from "@/components/language-provider";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: { status?: string; category?: string };
}) {
  await requireAuth();
  const allTickets = await getUserTickets();
  const tickets = allTickets;

  let filteredTickets = tickets;
  if (searchParams.status) {
    filteredTickets = filteredTickets.filter((t) => t.status === searchParams.status);
  }
  if (searchParams.category) {
    filteredTickets = filteredTickets.filter((t) => t.category === searchParams.category);
  }

  return (
    <LanguageProvider>
      <SupportPageClient
        tickets={tickets}
        filteredTickets={filteredTickets}
        searchParams={searchParams}
        ticketCount={tickets.length}
      />
    </LanguageProvider>
  );
}