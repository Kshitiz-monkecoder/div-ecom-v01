import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getOrder } from "@/app/actions/orders";
import { OrderPipeline } from "@/components/order-pipeline";

export default async function AdminOrderPipelinePage({
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
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/admin/orders/${order.id}`}>
          <Button variant="ghost">← Back to Order</Button>
        </Link>
        <Link href="/admin/orders">
          <Button variant="outline">All Orders</Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Order Pipeline</h1>
        <p className="text-muted-foreground mt-1">Order #{order.orderNumber}</p>
      </div>

      <OrderPipeline stages={order.canonicalStages ?? []} />
    </div>
  );
}
