import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerLayout from "@/components/customer-layout";
import { getOrder } from "@/app/actions/orders";
import { OrderPipeline } from "@/components/order-pipeline";
import { CustomerCard, CustomerPage, CustomerPageHeader } from "@/components/customer-portal-ui";

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
      <CustomerPage className="space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="ghost" className="rounded-full text-muted-foreground hover:bg-white/70 hover:text-orange-900">
            <Link href={`/orders/${order.id}`}>
              <ArrowLeft className="size-4" />
              Back to order
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white/80">
            <Link href="/orders">
              <FileText className="size-4" />
              All orders
            </Link>
          </Button>
        </div>

        <CustomerPageHeader
          eyebrow="Project pipeline"
          title={`Order #${order.orderNumber}`}
          description="A customer-friendly view of each operational stage, so the next mileorange is always clear."
        />

        <OrderPipeline stages={order.canonicalStages ?? []} />

        <CustomerCard className="p-5">
          <h2 className="text-lg font-semibold text-orange-900">How to read this pipeline</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-orange-950">Completed</p>
              <p className="mt-1 text-xs leading-5 text-orange-800/75">The mileorange has been finished by the responsible team.</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-950">In progress</p>
              <p className="mt-1 text-xs leading-5 text-amber-800/75">This is the current project stage receiving attention.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-orange-900">Pending</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">The project has not reached this stage yet.</p>
            </div>
          </div>
        </CustomerCard>
      </CustomerPage>
    </CustomerLayout>
  );
}
