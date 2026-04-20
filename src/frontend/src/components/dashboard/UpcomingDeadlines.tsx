import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Priority, Task } from "@/lib/types";
import { PRIORITY_CONFIG } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertCircle, Clock } from "lucide-react";

function formatTimeRemaining(deadlineNs: bigint): {
  label: string;
  urgency: "overdue" | "today" | "soon" | "upcoming";
} {
  const nowMs = Date.now();
  const deadlineMs = Number(deadlineNs / 1_000_000n);
  const diffMs = deadlineMs - nowMs;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffMs < 0) {
    const overdueDays = Math.abs(Math.floor(diffDays));
    return {
      label: overdueDays === 0 ? "Overdue today" : `${overdueDays}d overdue`,
      urgency: "overdue",
    };
  }
  if (diffHours < 24) {
    const hrs = Math.floor(diffHours);
    return { label: hrs <= 1 ? "Due soon" : `${hrs}h left`, urgency: "today" };
  }
  if (diffDays < 3) {
    return { label: `${Math.floor(diffDays)}d left`, urgency: "soon" };
  }
  return { label: `${Math.floor(diffDays)}d left`, urgency: "upcoming" };
}

const URGENCY_STYLES = {
  overdue: "text-red-400 bg-red-500/10 border-red-500/20",
  today: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  soon: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  upcoming: "text-muted-foreground bg-muted/30 border-border/30",
};

interface DeadlineItemProps {
  task: Task;
  index: number;
}

function DeadlineItem({ task, index }: DeadlineItemProps) {
  if (!task.deadline) return null;
  const { label, urgency } = formatTimeRemaining(task.deadline);
  const priorityCfg = PRIORITY_CONFIG[task.priority as Priority];

  return (
    <div
      className="flex items-center gap-3 py-3 border-b border-border/10 last:border-0 animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
      data-ocid={`deadlines.item.${index + 1}`}
    >
      {/* Priority dot */}
      <div
        className={cn("w-2 h-2 rounded-full shrink-0", {
          "bg-red-400": task.priority === "High",
          "bg-amber-400": task.priority === "Medium",
          "bg-emerald-400": task.priority === "Low",
        })}
      />

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate leading-tight">
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {task.category}
        </p>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] px-1.5 py-0 h-5 border font-medium",
            priorityCfg.className,
          )}
        >
          {task.priority}
        </Badge>
        <span
          className={cn(
            "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border",
            URGENCY_STYLES[urgency],
          )}
        >
          {urgency === "overdue" ? (
            <AlertCircle className="w-2.5 h-2.5" />
          ) : (
            <Clock className="w-2.5 h-2.5" />
          )}
          {label}
        </span>
      </div>
    </div>
  );
}

interface UpcomingDeadlinesProps {
  tasks: Task[] | undefined;
  isLoading: boolean;
}

function getUpcomingTasks(tasks: Task[]): Task[] {
  const nowMs = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  return tasks
    .filter((t) => {
      if (t.completed || !t.deadline) return false;
      const deadlineMs = Number(t.deadline / 1_000_000n);
      return deadlineMs <= nowMs + sevenDaysMs;
    })
    .sort((a, b) => {
      const aMs = Number(a.deadline! / 1_000_000n);
      const bMs = Number(b.deadline! / 1_000_000n);
      return aMs - bMs;
    })
    .slice(0, 5);
}

export function UpcomingDeadlines({
  tasks,
  isLoading,
}: UpcomingDeadlinesProps) {
  const upcomingTasks = tasks ? getUpcomingTasks(tasks) : [];

  return (
    <section data-ocid="deadlines.section">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-display font-semibold text-foreground">
          Upcoming Deadlines
        </h2>
        <span className="text-xs text-muted-foreground">Next 7 days</span>
      </div>

      <div className="glass rounded-2xl px-4 py-1">
        {isLoading ? (
          <div data-ocid="deadlines.loading_state" className="py-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3 border-b border-border/10 last:border-0"
              >
                <Skeleton className="w-2 h-2 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3.5 w-3/4 rounded mb-1.5" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : upcomingTasks.length === 0 ? (
          <div className="py-8 text-center" data-ocid="deadlines.empty_state">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-foreground">All clear!</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              No tasks due in the next 7 days
            </p>
          </div>
        ) : (
          upcomingTasks.map((task, i) => (
            <DeadlineItem key={task.id.toString()} task={task} index={i} />
          ))
        )}
      </div>
    </section>
  );
}
