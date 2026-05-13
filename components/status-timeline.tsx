import { format } from "date-fns";
import { StatusBadge } from "@/components/status-badge";
import { SafeImage } from "@/components/safe-image";
import { type OrderStatus, type TicketStatus } from "@/types";

type TimelineStatus = OrderStatus | TicketStatus | string;

export interface StatusTimelineItem {
  id: string;
  status: TimelineStatus;
  note?: string | null;
  images?: string[];
  createdAt: Date;
  createdBy?: { name?: string | null; email?: string | null } | null;
}

interface StatusTimelineProps {
  items: StatusTimelineItem[];
  type: "order" | "ticket";
  title?: string;
}

export function StatusTimeline({ items, type, title = "Status history" }: StatusTimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-orange-200 bg-white/65 p-8 text-center text-sm text-slate-500">
        No status history is available yet.
      </div>
    );
  }

  return (
    <section className="rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-orange-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">Every update is timestamped so you can see what changed and when.</p>
      </div>
      <div className="relative space-y-4">
        <div className="absolute bottom-4 left-5 top-4 hidden w-px bg-slate-200 sm:block" />
        {items.map((item) => (
          <article key={item.id} className="relative rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:ml-12">
            <span className="absolute -left-[3.25rem] top-4 hidden size-10 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 sm:flex">
              <span className="size-2 rounded-full bg-emerald-500" />
            </span>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <StatusBadge status={item.status} type={type} />
              <div className="text-xs text-slate-500">
                {format(new Date(item.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                {item.createdBy?.name ? ` by ${item.createdBy.name}` : ""}
              </div>
            </div>

            {item.note && (
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{item.note}</p>
            )}

            {item.images && item.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                {item.images.map((url, index) => (
                  <div key={`${item.id}-${index}`} className="relative h-28 w-full overflow-hidden rounded-2xl bg-white">
                    <SafeImage
                      src={url}
                      alt={`${type} status ${item.status} image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
