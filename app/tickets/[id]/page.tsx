import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { AlertCircle, ArrowLeft, ChevronRight, Image as ImageIcon, MessageSquare, Package, Phone } from "lucide-react";
import CustomerLayout from "@/components/customer-layout";
import { StatusBadge } from "@/components/status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { getTicket } from "@/app/actions/tickets";
import { Button } from "@/components/ui/button";
import { TICKET_SUB_CATEGORIES } from "@/types";
import { SafeImage } from "@/components/safe-image";
import { CustomerCard, CustomerPage, CustomerPageHeader, SectionHeader } from "@/components/customer-portal-ui";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getTicket(id).catch(() => null);

  if (!ticket) {
    notFound();
  }

  const statusTimeline = ticket.statusHistory.map((entry: any) => {
    let images: string[] = [];
    if (entry.imagesJson) {
      try {
        const parsed = JSON.parse(entry.imagesJson);
        if (Array.isArray(parsed)) {
          images = parsed;
        }
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

  let subCategories: string[] = [];
  if (ticket.subCategories) {
    try {
      const parsed = JSON.parse(ticket.subCategories);
      if (Array.isArray(parsed)) {
        subCategories = parsed;
      }
    } catch {
      subCategories = [];
    }
  }

  const getSubCategoryLabel = (value: string) => {
    if (ticket.category === "General Query") return value;
    const categorySubCats = TICKET_SUB_CATEGORIES[ticket.category] || [];
    const found = categorySubCats.find((sc) => sc.value === value);
    return found ? found.label : value;
  };

  return (
    <CustomerLayout>
      <CustomerPage className="space-y-8">
        <div>
          <Button asChild variant="ghost" className="rounded-full text-muted-foreground hover:bg-white/70 hover:text-orange-900">
            <Link href="/tickets">
              <ArrowLeft className="size-4" />
              All tickets
            </Link>
          </Button>
        </div>

        <CustomerPageHeader
          eyebrow="Support ticket"
          title={ticket.category}
          description={`Created ${format(new Date(ticket.createdAt), "MMMM dd, yyyy 'at' HH:mm")}. Review reported issues, evidence, linked order, and support updates.`}
          actions={<StatusBadge status={ticket.status} type="ticket" />}
        />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            {subCategories.length > 0 && (
              <CustomerCard className="p-5">
                <SectionHeader
                  title="Reported issues"
                  description="The selected issue signals used to route this ticket."
                />
                {ticket.category === "General Query" ? (
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {subCategories[0]}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {subCategories.map((subCat, index) => (
                      <span
                        key={`${subCat}-${index}`}
                        className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200"
                      >
                        {getSubCategoryLabel(subCat)}
                      </span>
                    ))}
                  </div>
                )}
              </CustomerCard>
            )}

            {ticket.description && (
              <CustomerCard className="p-5">
                <SectionHeader title="Description" />
                <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{ticket.description}</p>
              </CustomerCard>
            )}

            {ticket.images.length > 0 && (
              <CustomerCard className="p-5">
                <SectionHeader
                  title="Supporting images"
                  description={`${ticket.images.length} image${ticket.images.length === 1 ? "" : "s"} attached to this ticket.`}
                />
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {ticket.images.map((image: any, index: number) => (
                    <div
                      key={image.id}
                      className="relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
                    >
                      <SafeImage
                        src={image.url}
                        alt={`Support image ${index + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </CustomerCard>
            )}

            <StatusTimeline items={statusTimeline} type="ticket" />
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <CustomerCard className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <MessageSquare className="size-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-orange-900">Ticket snapshot</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    ID ending #{ticket.id.slice(-6).toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <InfoBlock icon={<AlertCircle className="size-4" />} label="Category" value={ticket.category} />
                <InfoBlock icon={<ImageIcon className="size-4" />} label="Images" value={`${ticket.images.length}`} />
              </div>
            </CustomerCard>

            {ticket.order && (
              <CustomerCard className="p-5">
                <SectionHeader title="Related order" />
                <Link
                  href={`/orders/${ticket.order.id}`}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-white customer-focus-ring"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-orange-900">
                      {ticket.order.items.length === 1
                        ? ticket.order.items[0]?.product?.name || ticket.order.items[0]?.name
                        : `${ticket.order.items.length} items`}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Order placed {format(new Date(ticket.order.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-slate-400" />
                </Link>
              </CustomerCard>
            )}

            <CustomerCard className="bg-primary p-5 text-white">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-orange-200">
                  <Phone className="size-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold">Need immediate help?</p>
                  <p className="mt-1 text-sm leading-6 text-white/65">
                    Call support during business hours and reference this ticket.
                  </p>
                  <a href="tel:+917065028801" className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-orange-900 hover:bg-emerald-50">
                    +91 70650 28801
                  </a>
                </div>
              </div>
            </CustomerCard>
          </aside>
        </section>
      </CustomerPage>
    </CustomerLayout>
  );
}

function InfoBlock({
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
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
