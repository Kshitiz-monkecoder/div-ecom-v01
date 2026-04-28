import { format } from "date-fns";
import { StatusBadge } from "@/components/status-badge";
import { OrderStatus, TicketStatus } from "@prisma/client";
import { SafeImage } from "@/components/safe-image";

type TimelineStatus = OrderStatus | TicketStatus;

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

export function StatusTimeline({ items, type, title = "Status Timeline" }: StatusTimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        No status history available yet.
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge status={item.status} type={type} />
              <div className="text-xs text-muted-foreground">
                {format(new Date(item.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                {item.createdBy?.name ? ` · ${item.createdBy.name}` : ""}
              </div>
            </div>

            {item.note && (
              <p className="text-sm text-muted-foreground whitespace-pre-line">{item.note}</p>
            )}

            {item.images && item.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {item.images.map((url, index) => (
                  <div key={`${item.id}-${index}`} className="relative h-28 w-full">
                    <SafeImage
                      src={url}
                      alt={`${type} status ${item.status} image ${index + 1}`}
                      className="h-full w-full rounded-md object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
