import { Navbar } from "@/components/navbar";
import { CreateTicketForm } from "@/components/create-ticket-form";
import { requireAuth } from "@/lib/middleware";
import { getUserOrders } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CreateTicketPage() {
  await requireAuth();
  const orders = await getUserOrders();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/tickets">
            <Button variant="ghost">← Back to Tickets</Button>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
          <h1 className="text-3xl font-bold mb-6">Create Support Ticket</h1>
          <CreateTicketForm orders={orders} />
        </div>
      </div>
    </div>
  );
}

