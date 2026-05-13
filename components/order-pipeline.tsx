import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { format } from "date-fns";
import { type Order } from "@/types";

interface OrderPipelineProps {
  stages: NonNullable<Order["canonicalStages"]>;
}

const toDate = (value: Date | string): Date => (value instanceof Date ? value : new Date(value));
const labelForStage = (value: string) => value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export function OrderPipeline({ stages }: OrderPipelineProps) {
  if (!stages || stages.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-orange-200 bg-white/65 p-8 text-center text-sm text-slate-500">
        Pipeline activity will appear here once the project starts moving.
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-orange-900">Project pipeline</h2>
          <p className="mt-1 text-sm text-slate-500">Mileoranges from internal approval to customer handover.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stages.map((stage, index) => {
          const reachedAt = stage.completedAt ? toDate(stage.completedAt) : null;
          const isDone = stage.status === "completed";
          const isCurrent = stage.status === "in_progress";
          const Icon = isDone ? CheckCircle2 : isCurrent ? CircleDot : Circle;

          return (
            <div
              key={stage.id}
              className={`relative rounded-2xl border p-4 ${
                isDone
                  ? "border-emerald-200 bg-emerald-50"
                  : isCurrent
                  ? "border-amber-200 bg-amber-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${
                    isDone ? "bg-emerald-600 text-white" : isCurrent ? "bg-amber-500 text-white" : "bg-white text-slate-400"
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Stage {stage.stageNumber ?? index + 1}</p>
                  <h3 className="mt-1 text-sm font-semibold text-orange-900">{labelForStage(stage.stageName)}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {reachedAt
                      ? format(reachedAt, "dd MMM yyyy, hh:mm a")
                      : isCurrent && stage.startedAt
                      ? `Started ${format(toDate(stage.startedAt), "dd MMM yyyy, hh:mm a")}`
                      : "Pending"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
