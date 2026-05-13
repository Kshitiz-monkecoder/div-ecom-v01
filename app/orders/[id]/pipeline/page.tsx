import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import CustomerLayout from "@/components/customer-layout";
import { getOrder } from "@/app/actions/orders";
import { OrderPipeline } from "@/components/order-pipeline";

export default async function CustomerOrderPipelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id).catch(() => null);

  if (!order) {
    notFound();
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/orders/${order.id}`}>
            <Button variant="ghost">← Back to Order</Button>
          </Link>
          <Link href="/orders">
            <Button variant="outline">All Orders</Button>
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold">Order Pipeline</h1>
          <p className="text-muted-foreground mt-1">Order #{order.orderNumber}</p>
        </div>

        <OrderPipeline stages={order.canonicalStages ?? []} />
      </div>
    </CustomerLayout>
  );
}
