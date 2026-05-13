import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";

type CanonicalStage = {
  id: string;
  stageName: string;
  status: string;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
};

interface CanonicalStageTimelineProps {
  stages: CanonicalStage[];
}

const prettyStageName = (value: string) => value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export function CanonicalStageTimeline({ stages }: CanonicalStageTimelineProps) {
  const completedStages = stages
    .filter((stage) => stage.completedAt)
    .sort(
      (left, right) =>
        new Date(left.completedAt as string | Date).getTime() -
        new Date(right.completedAt as string | Date).getTime()
    );

  if (completedStages.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-orange-200 bg-white/65 p-8 text-center text-sm text-slate-500">
        Stage activity will appear here as mileoranges are completed.
      </div>
    );
  }

  return (
    <section className="rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-orange-900">Stage activity</h2>
        <p className="mt-1 text-sm text-slate-500">A timeline of completed operational mileoranges.</p>
      </div>
      <div className="space-y-3">
        {completedStages.map((stage) => (
          <div key={stage.id} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <CheckCircle2 className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-orange-900">{prettyStageName(stage.stageName)}</p>
                <p className="text-xs text-slate-500">
                  {format(new Date(stage.completedAt as string | Date), "MMM dd, yyyy 'at' HH:mm")}
                </p>
              </div>
              <p className="mt-1 text-xs font-medium text-orange-600">Completed</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
