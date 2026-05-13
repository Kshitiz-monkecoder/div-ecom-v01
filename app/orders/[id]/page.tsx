import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  FileText,
  GitBranch,
  MapPin,
  Package,
  Paperclip,
  Phone,
  Receipt,
  Shield,
  StickyNote,
} from "lucide-react";
import CustomerLayout from "@/components/customer-layout";
import { StatusBadge } from "@/components/status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { getOrder } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { CustomerCard, CustomerPage, CustomerPageHeader, MetricCard, SectionHeader } from "@/components/customer-portal-ui";
import { OrderDeliverySlotForm } from "@/components/order-delivery-slot-form";
import { OrderMaterialVerificationForm } from "@/components/order-material-verification-form";
import { CanonicalStageTimeline } from "@/components/canonical-stage-timeline";
import { parseStringArray } from "@/lib/json";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id).catch(() => null);

  if (!order) {
    notFound();
  }

  const totalAmount = order.items.reduce(
    (sum: number, item: any) => sum + item.unitPrice * item.quantity,
    0
  );
  const totalInRupees = (totalAmount / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const additionalFiles = parseStringArray(order.additionalFiles);
  const manualApprovedStage = order.canonicalStages?.find((stage: any) => stage.stageName === "MANUAL_APPROVED");
  const bomStage = order.canonicalStages?.find((stage: any) => stage.stageName === "BOM_VERIFICATION");
  const bomCompleted = bomStage?.status === "completed";
  const manuallyApproved = manualApprovedStage?.status === "completed";

  const statusTimeline = order.statusHistory.map((entry: any) => {
    let images: string[] = [];
    if (entry.imagesJson) {
      try {
        images = parseStringArray(entry.imagesJson);
      } catch {
        images = [];
      }
    }

    return {
      id: entry.id,
      status: entry.status,
      note: entry.note,
      images,
      createdAt: entry.createdAt,
      createdBy: entry.createdBy ? { name: entry.createdBy.name, email: entry.createdBy.email } : null,
    };
  });

  const hasDocuments = order.warrantyCardUrl || order.invoiceUrl || additionalFiles.length > 0;
  const completedStages = (order.canonicalStages ?? []).filter((stage: any) => stage.status === "completed").length;

  return (
    <CustomerLayout>
      <CustomerPage className="space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="ghost" className="rounded-full text-muted-foreground hover:bg-white/70 hover:text-stone-900">
            <Link href="/orders">
              <ArrowLeft className="size-4" />
              All orders
            </Link>
          </Button>
          <Button asChild variant="outline" className="ml-auto rounded-full border-slate-200 bg-white/80">
            <Link href={`/orders/${order.id}/pipeline`}>
              <GitBranch className="size-4" />
              View pipeline
            </Link>
          </Button>
        </div>

        <CustomerPageHeader
          eyebrow="Order detail"
          title={`Order #${order.orderNumber}`}
          description={`Placed ${format(new Date(order.createdAt), "MMMM dd, yyyy 'at' HH:mm")}. Review materials, documents, delivery timing, and support linked to this project.`}
          actions={<StatusBadge status={order.status} type="order" />}
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Project value" value={`Rs ${totalInRupees}`} icon={<Receipt className="size-5" />} detail="Total value across all order items." tone="dark" />
          <MetricCard label="Products" value={order.items.length} icon={<Package className="size-5" />} detail="Items included in this order." tone="green" />
          <MetricCard label="Stages complete" value={`${completedStages}/${order.canonicalStages?.length ?? 0}`} icon={<GitBranch className="size-5" />} detail="Operational pipeline progress." tone="blue" />
          <MetricCard label="Documents" value={hasDocuments ? "Ready" : "Pending"} icon={<FileText className="size-5" />} detail="Warranty, invoice, and uploaded files." tone="solar" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <CustomerCard className="p-5">
              <SectionHeader
                title="Products and pricing"
                description="The materials and products currently attached to this order."
                action={<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{order.items.length} items</span>}
              />
              <div className="space-y-3">
                {order.items.map((item: any) => (
                  <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-stone-900">{item.name}</p>
                        {item.capacity && <p className="mt-1 text-sm font-medium text-orange-600">{item.capacity}</p>}
                        {item.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>}
                      </div>
                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-lg font-semibold text-stone-900">Rs {((item.unitPrice * item.quantity) / 100).toLocaleString("en-IN")}</p>
                        <p className="mt-1 text-xs text-slate-500">Rs {(item.unitPrice / 100).toLocaleString("en-IN")} x {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-slate-100 px-1 pt-4">
                  <span className="text-sm font-semibold text-muted-foreground">Total order value</span>
                  <span className="text-xl font-semibold text-stone-900">Rs {totalInRupees}</span>
                </div>
              </div>
            </CustomerCard>

            <CustomerCard className="p-5">
              <SectionHeader
                title="Material verification"
                description="Use OTP verification only when the team has made BOM confirmation available."
              />
              <OrderMaterialVerificationForm
                orderId={order.id}
                bomCompleted={Boolean(bomCompleted)}
                manuallyApproved={Boolean(manuallyApproved)}
              />
            </CustomerCard>

            <CanonicalStageTimeline stages={order.canonicalStages ?? []} />
            <StatusTimeline items={statusTimeline} type="order" title="Order status history" />
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <CustomerCard className="p-5">
              <SectionHeader title="Documents" description="Open warranty, invoice, and additional files." />
              <div className="space-y-3">
                {order.warrantyCardUrl && (
                  <DocumentLink href={order.warrantyCardUrl} title="Warranty card" description="Warranty certificate for this order" icon={<Shield className="size-5" />} />
                )}
                {order.invoiceUrl && (
                  <DocumentLink href={order.invoiceUrl} title="Invoice" description="Order invoice and payment details" icon={<Receipt className="size-5" />} />
                )}
                {additionalFiles.map((fileUrl: string, index: number) => (
                  <DocumentLink key={fileUrl} href={fileUrl} title={`File ${index + 1}`} description="Additional project document" icon={<Paperclip className="size-5" />} />
                ))}
                {!hasDocuments && (
                  <div className="rounded-2xl border border-dashed border-orange-200 bg-slate-50 p-6 text-center">
                    <FileText className="mx-auto size-7 text-slate-400" />
                    <p className="mt-3 text-sm font-semibold text-stone-900">No documents yet</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Documents will appear here when the team uploads them.</p>
                  </div>
                )}
              </div>
            </CustomerCard>

            <CustomerCard className="p-5">
              <SectionHeader
                title="Delivery slot"
                description="Choose the most convenient 4-hour delivery window."
              />
              <OrderDeliverySlotForm
                orderId={order.id}
                currentDeliveryDate={order.deliveryDate}
                currentDeliverySlot={order.deliverySlot}
              />
            </CustomerCard>

            <CustomerCard className="p-5">
              <SectionHeader title="Installation details" />
              <div className="space-y-3">
                <InfoRow icon={<MapPin className="size-4" />} label="Address" value={order.address} />
                <InfoRow icon={<Phone className="size-4" />} label="Contact" value={order.phone} />
                {order.deliveryDate && (
                  <InfoRow icon={<CalendarDays className="size-4" />} label="Delivery date" value={format(new Date(order.deliveryDate), "MMM dd, yyyy")} />
                )}
                {order.notes && <InfoRow icon={<StickyNote className="size-4" />} label="Notes" value={order.notes} />}
              </div>
            </CustomerCard>

            {order.tickets && order.tickets.length > 0 && (
              <CustomerCard className="p-5">
                <SectionHeader title="Related support tickets" />
                <div className="space-y-2">
                  {order.tickets.map((ticket: any) => (
                    <Link
                      key={ticket.id}
                      href={`/tickets/${ticket.id}`}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-white customer-focus-ring"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-900">{ticket.category}</p>
                        {ticket.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{ticket.description}</p>}
                      </div>
                      <ChevronRight className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    </Link>
                  ))}
                </div>
              </CustomerCard>
            )}
          </aside>
        </section>
      </CustomerPage>
    </CustomerLayout>
  );
}

function DocumentLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-white customer-focus-ring"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-stone-900">{title}</span>
        <span className="block text-xs leading-5 text-slate-500">{description}</span>
      </span>
      <ExternalLink className="size-4 text-slate-400 transition-colors group-hover:text-orange-600" />
    </a>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-slate-50 p-3">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
        <p className="mt-1 wrap-break-word text-sm leading-6 text-slate-700">{value}</p>
      </div>
    </div>
  );
}
