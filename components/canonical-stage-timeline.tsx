import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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

const prettyStageName = (value: string) => value.replace(/_/g, " ");

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
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        No stage activity available yet.
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <h2 className="text-xl font-semibold">Stage Activity</h2>
      <div className="space-y-4">
        {completedStages.map((stage) => (
          <div key={stage.id} className="rounded-lg border p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant="secondary">Completed</Badge>
              <div className="text-xs text-muted-foreground">
                {format(new Date(stage.completedAt as string | Date), "MMM dd, yyyy 'at' HH:mm")}
              </div>
            </div>
            <p className="text-sm font-medium">{prettyStageName(stage.stageName)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
