import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { format } from "date-fns";
import { type Order } from "@/types";

interface OrderPipelineProps {
  stages: NonNullable<Order["canonicalStages"]>;
}

const toDate = (value: Date | string): Date => (value instanceof Date ? value : new Date(value));
const labelForStage = (value: string) => value.replace(/_/g, " ");

export function OrderPipeline({ stages }: OrderPipelineProps) {
  return (
    <div className="rounded-lg border p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Order Pipeline</h2>
      </div>

      <div className="space-y-4 md:space-y-0 md:flex md:items-start md:justify-between md:gap-3">
        {stages.map((stage) => {
          const reachedAt = stage.completedAt ? toDate(stage.completedAt) : null;
          const isDone = stage.status === "completed";
          const isCurrent = stage.status === "in_progress";
          const isBlocked = stage.status !== "completed" && stage.status !== "in_progress";

          return (
            <div key={stage.id} className="flex md:flex-1 md:flex-col md:items-center md:text-center gap-3 md:gap-2">
              <div className="flex items-center gap-2 md:flex-col md:gap-2">
                {isDone ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : isCurrent ? (
                  <CircleDot className="h-6 w-6 text-blue-600" />
                ) : (
                  <Circle className={`h-6 w-6 ${isBlocked ? "text-gray-400" : "text-gray-500"}`} />
                )}

                <div className="md:hidden h-px flex-1 bg-border" />
              </div>

              <div>
                <p className={`text-sm font-semibold ${isDone || isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                  {labelForStage(stage.stageName)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {reachedAt
                    ? format(reachedAt, "dd MMM yyyy, hh:mm a")
                    : isCurrent && stage.startedAt
                    ? `Started ${format(toDate(stage.startedAt), "dd MMM yyyy, hh:mm a")}`
                    : "Pending"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
