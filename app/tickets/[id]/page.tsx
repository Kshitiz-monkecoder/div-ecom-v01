import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { AlertCircle, ArrowLeft, CheckCircle2, ChevronRight, Clock, Image as ImageIcon, MessageSquare, Package, Phone, UserCheck } from "lucide-react";
import CustomerLayout from "@/components/customer-layout";
import { StatusBadge } from "@/components/status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { getTicket } from "@/app/actions/tickets";
import { Button } from "@/components/ui/button";
import { TICKET_SUB_CATEGORIES } from "@/types";
import { SafeImage } from "@/components/safe-image";
import { CustomerCard, CustomerPage, CustomerPageHeader, SectionHeader } from "@/components/customer-portal-ui";
import { TicketMessageComposer } from "@/components/ticket-message-composer";

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

  // Pre-fetch messages server-side so first render is instant
  const initialMessages = await import("@/app/actions/tickets")
    .then(m => m.getTicketMessages(id))
    .catch(() => []);

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

  const agentAssigned = !!ticket.assignedAgentEmpId;
  const taskSynced = !!ticket.unoloTaskId;

  const steps = [
    { label: "Ticket raised",   done: true },
    { label: "Agent assigned",  done: agentAssigned },
    { label: "Visit scheduled", done: taskSynced },
    { label: "In progress",     done: ticket.status === "IN_PROGRESS" || ticket.status === "RESOLVED" || ticket.status === "CLOSED" },
    { label: "Resolved",        done: ticket.status === "RESOLVED" || ticket.status === "CLOSED" },
  ];

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

            {/* Field agent status */}
            <CustomerCard className="p-5">
              <SectionHeader
                title="Field agent status"
                description="Live progress of your ticket from assignment through to resolution."
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Agent assignment tile */}
                <div className={`flex items-start gap-3 rounded-2xl border p-4 ${
                  agentAssigned
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-amber-200 bg-amber-50"
                }`}>
                  <span className={`mt-0.5 shrink-0 ${agentAssigned ? "text-emerald-600" : "text-amber-500"}`}>
                    {agentAssigned ? <CheckCircle2 className="size-5" /> : <Clock className="size-5" />}
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${agentAssigned ? "text-emerald-800" : "text-amber-800"}`}>
                      {agentAssigned ? "Agent assigned" : "Awaiting assignment"}
                    </p>
                    <p className={`mt-0.5 text-xs leading-5 ${agentAssigned ? "text-emerald-600" : "text-amber-600"}`}>
                      {agentAssigned
                        ? "A field agent has been allocated to your ticket"
                        : "We are finding the right agent for your issue"}
                    </p>
                  </div>
                </div>

                {/* Visit scheduling tile */}
                <div className={`flex items-start gap-3 rounded-2xl border p-4 ${
                  taskSynced
                    ? "border-emerald-200 bg-emerald-50"
                    : agentAssigned
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-slate-50"
                }`}>
                  <span className={`mt-0.5 shrink-0 ${
                    taskSynced ? "text-emerald-600" : agentAssigned ? "text-blue-500" : "text-slate-400"
                  }`}>
                    {taskSynced
                      ? <CheckCircle2 className="size-5" />
                      : agentAssigned
                      ? <Clock className="size-5" />
                      : <UserCheck className="size-5" />}
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${
                      taskSynced ? "text-emerald-800" : agentAssigned ? "text-blue-800" : "text-slate-500"
                    }`}>
                      {taskSynced ? "Visit scheduled" : agentAssigned ? "Scheduling visit" : "Visit pending"}
                    </p>
                    <p className={`mt-0.5 text-xs leading-5 ${
                      taskSynced ? "text-emerald-600" : agentAssigned ? "text-blue-600" : "text-slate-400"
                    }`}>
                      {taskSynced
                        ? "Agent has received the task on their mobile app"
                        : agentAssigned
                        ? "Task is being sent to the agent's device"
                        : "Will be scheduled once an agent is assigned"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress track */}
              <div className="mt-5">
                <div className="flex items-start">
                  {steps.map((step, i) => (
                    <div
                      key={step.label}
                      className="flex flex-col items-center"
                      style={{ flex: i < steps.length - 1 ? "1 1 0%" : "none" }}
                    >
                      <div className="flex w-full items-center">
                        <div className={`size-3 shrink-0 rounded-full border-2 ${
                          step.done
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-slate-300 bg-white"
                        }`} />
                        {i < steps.length - 1 && (
                          <div className={`h-0.5 flex-1 ${
                            step.done && steps[i + 1].done ? "bg-emerald-400" : "bg-slate-200"
                          }`} />
                        )}
                      </div>
                      <p className="mt-2 w-14 text-center text-[10px] font-medium leading-tight text-slate-500">
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CustomerCard>

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

            <TicketMessageComposer
              ticketId={ticket.id}
              ticketStatus={ticket.status}
              initialMessages={initialMessages}
            />
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
                <InfoBlock
                  icon={<UserCheck className="size-4" />}
                  label="Agent"
                  value={
                    agentAssigned ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="size-3.5" />
                        Assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-600">
                        <Clock className="size-3.5" />
                        Pending
                      </span>
                    )
                  }
                />
                <InfoBlock
                  icon={<Package className="size-4" />}
                  label="Visit"
                  value={
                    taskSynced ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="size-3.5" />
                        Scheduled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        <Clock className="size-3.5" />
                        Not yet
                      </span>
                    )
                  }
                />
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