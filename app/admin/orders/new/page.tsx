import { CreateOrderForm } from "@/components/create-order-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewOrderPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/orders">
          <Button variant="ghost">← Back to Orders</Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Create New Order</h1>
      <CreateOrderForm />
    </div>
  );
}
