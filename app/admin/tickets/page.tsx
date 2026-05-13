import { getAllTickets } from "@/app/actions/tickets";
import { AdminTicketsCRM } from "@/components/admin-tickets-crm";
import { TICKET_STATUSES } from "@/types";

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; id?: string }>;
}) {
  const params = await searchParams;
  const tickets = await getAllTickets(params.status as any).catch(() => []);

  return (
    <AdminTicketsCRM
      tickets={tickets}
      statusFilter={params.status}
      selectedTicketId={params.id}
      allStatuses={TICKET_STATUSES}
    />
  );
}
