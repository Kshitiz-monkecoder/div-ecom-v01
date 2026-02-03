import CustomerLayout from "@/components/customer-layout";
import { CreateTicketPageClient } from "@/components/create-ticket-page-client";
import { getUserOrders } from "@/app/actions/orders";

export default async function CreateTicketPage() {
  const orders = await getUserOrders();

  return (
    <CustomerLayout>
      <CreateTicketPageClient orders={orders} />
    </CustomerLayout>
  );
}

