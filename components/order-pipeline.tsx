import { CheckCircle2, Circle, CircleDot, XCircle } from "lucide-react";
import { format } from "date-fns";
import { OrderStatus } from "@prisma/client";

type HistoryItem = {
  status: OrderStatus;
  createdAt: Date | string;
};

interface OrderPipelineProps {
  currentStatus: OrderStatus;
  statusHistory?: HistoryItem[];
}

const PIPELINE: OrderStatus[] = ["NEW", "CONTACTED", "CONFIRMED", "INSTALLED"];

const labelMap: Record<OrderStatus, string> = {
  NEW: "Order Placed",
  CONTACTED: "Team Contacted",
  CONFIRMED: "Order Confirmed",
  INSTALLED: "Installation Complete",
  CANCELLED: "Cancelled",
};

const toDate = (value: Date | string): Date => (value instanceof Date ? value : new Date(value));

export function OrderPipeline({ currentStatus, statusHistory = [] }: OrderPipelineProps) {
  const historyMap = new Map<OrderStatus, Date>();

  for (const item of statusHistory) {
    if (!historyMap.has(item.status)) {
      historyMap.set(item.status, toDate(item.createdAt));
    }
  }

  const currentIndex = PIPELINE.indexOf(currentStatus);
  const isCancelled = currentStatus === "CANCELLED";

  return (
    <div className="rounded-lg border p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Order Pipeline</h2>
        {isCancelled && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
            <XCircle className="h-3.5 w-3.5" />
            Cancelled
          </span>
        )}
      </div>

      <div className="space-y-4 md:space-y-0 md:flex md:items-start md:justify-between md:gap-3">
        {PIPELINE.map((step, index) => {
          const reachedAt = historyMap.get(step);
          const isDone = isCancelled ? Boolean(reachedAt) : currentIndex > index;
          const isCurrent = !isCancelled && currentIndex === index;

          return (
            <div key={step} className="flex md:flex-1 md:flex-col md:items-center md:text-center gap-3 md:gap-2">
              <div className="flex items-center gap-2 md:flex-col md:gap-2">
                {isDone ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : isCurrent ? (
                  <CircleDot className="h-6 w-6 text-blue-600" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}

                <div className="md:hidden h-px flex-1 bg-border" />
              </div>

              <div>
                <p className={`text-sm font-semibold ${isDone || isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                  {labelMap[step]}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {reachedAt ? format(reachedAt, "dd MMM yyyy, hh:mm a") : "Pending"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {isCancelled && (
        <p className="text-sm text-muted-foreground">
          This order was cancelled. Steps shown as completed are those reached before cancellation.
        </p>
      )}
    </div>
  );
}
