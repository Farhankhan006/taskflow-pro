import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Flame, Target, TrendingUp } from "lucide-react";
import type { ProductivityStats } from "../../lib/types";

interface MonthlyInsightsProps {
  stats: ProductivityStats | undefined;
  isLoading: boolean;
}

interface InsightItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}

function InsightCard({ item, index }: { item: InsightItem; index: number }) {
  return (
    <div
      className="glass rounded-xl p-3.5 flex items-center gap-3 animate-slide-up"
      style={{ animationDelay: `${index * 0.08}s` }}
      data-ocid={`monthly_insights.item.${index + 1}`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.accent}`}
      >
        {item.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground leading-none mb-1">
          {item.label}
        </p>
        <p className="text-foreground font-bold text-base leading-none">
          {item.value}
        </p>
        {item.sub && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
        )}
      </div>
    </div>
  );
}

function InsightSkeleton() {
  return (
    <div className="glass rounded-xl p-3.5 flex items-center gap-3">
      <Skeleton className="w-9 h-9 rounded-xl shimmer flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-2.5 w-20 rounded shimmer" />
        <Skeleton className="h-4 w-12 rounded shimmer" />
      </div>
    </div>
  );
}

export function MonthlyInsights({ stats, isLoading }: MonthlyInsightsProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 gap-3"
        data-ocid="monthly_insights.loading_state"
      >
        {(["a", "b", "c", "d"] as const).map((k) => (
          <InsightSkeleton key={k} />
        ))}
      </div>
    );
  }

  const monthlyCompleted = Number(stats?.monthlyCompleted ?? 0);
  const totalTasks = Number(stats?.totalTasks ?? 0);
  const completedTasks = Number(stats?.completedTasks ?? 0);
  const completionRate = Number(stats?.completionRate ?? 0);

  // Approx days elapsed this month
  const now = new Date();
  const dayOfMonth = now.getDate();
  const avgPerDay =
    dayOfMonth > 0 ? (monthlyCompleted / dayOfMonth).toFixed(1) : "0";

  // Best day from weekly chart
  const weeklyDays = stats?.weeklyChart?.days ?? [];
  let bestDay = "—";
  let bestCount = 0;
  for (const d of weeklyDays) {
    const count = Number(d.completedCount);
    if (count > bestCount) {
      bestCount = count;
      bestDay = d.date;
    }
  }

  const insights: InsightItem[] = [
    {
      icon: <Calendar className="w-4 h-4 text-violet-300" />,
      label: "Completed this month",
      value: String(monthlyCompleted),
      sub: "tasks finished",
      accent: "bg-violet-500/20",
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-sky-300" />,
      label: "Daily average",
      value: avgPerDay,
      sub: "tasks per day",
      accent: "bg-sky-500/20",
    },
    {
      icon: <Target className="w-4 h-4 text-emerald-300" />,
      label: "Completion rate",
      value: `${completionRate}%`,
      sub: `${completedTasks} / ${totalTasks} tasks`,
      accent: "bg-emerald-500/20",
    },
    {
      icon: <Flame className="w-4 h-4 text-amber-300" />,
      label: "Best day (this week)",
      value: bestCount > 0 ? bestDay : "—",
      sub: bestCount > 0 ? `${bestCount} tasks done` : "No data yet",
      accent: "bg-amber-500/20",
    },
  ];

  if (monthlyCompleted === 0 && totalTasks === 0) {
    return (
      <div
        className="glass rounded-xl p-6 text-center"
        data-ocid="monthly_insights.empty_state"
      >
        <p className="text-3xl mb-2">🗓️</p>
        <p className="text-muted-foreground text-sm">
          Your monthly insights will appear once you start completing tasks
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 gap-3"
      data-ocid="monthly_insights.section"
    >
      {insights.map((item, i) => (
        <InsightCard key={item.label} item={item} index={i} />
      ))}
    </div>
  );
}
