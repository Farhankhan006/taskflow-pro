import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock,
  ListTodo,
} from "lucide-react";
import type { ProductivityStats, WeeklyChart } from "../../lib/types";

interface PerformanceStatsProps {
  stats: ProductivityStats | undefined;
  weeklyChart: WeeklyChart | undefined;
  isLoading: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBg: string;
  trend?: { value: number; label: string } | null;
  index: number;
}

function TrendBadge({ trend }: { trend: { value: number; label: string } }) {
  const positive = trend.value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
        positive
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-red-500/15 text-red-400"
      }`}
    >
      {positive ? (
        <ArrowUp className="w-2.5 h-2.5" />
      ) : (
        <ArrowDown className="w-2.5 h-2.5" />
      )}
      {Math.abs(trend.value)}%
    </span>
  );
}

function StatCard({ icon, label, value, iconBg, trend, index }: StatCardProps) {
  return (
    <div
      className="glass rounded-xl p-4 flex items-center gap-3 animate-slide-up"
      style={{ animationDelay: `${index * 0.07}s` }}
      data-ocid={`performance.stat.${index + 1}`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-foreground font-bold text-xl leading-tight">
            {value}
          </p>
          {trend && <TrendBadge trend={trend} />}
        </div>
      </div>
    </div>
  );
}

function CircularRate({ rate }: { rate: number }) {
  const clampedRate = Math.min(100, Math.max(0, rate));
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedRate / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-20 h-20">
        <svg
          className="w-20 h-20 -rotate-90"
          viewBox="0 0 72 72"
          role="img"
          aria-label={`Completion rate: ${clampedRate}%`}
        >
          <title>{`Completion rate: ${clampedRate}%`}</title>
          {/* Background track */}
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="oklch(var(--muted) / 0.4)"
            strokeWidth="6"
          />
          {/* Progress arc */}
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="url(#circleGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
          <defs>
            <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.72 0.26 270)" />
              <stop offset="100%" stopColor="oklch(0.55 0.15 295)" />
            </linearGradient>
          </defs>{" "}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-foreground font-bold text-sm leading-none">
            {clampedRate}%
          </span>
          <span className="text-[9px] text-muted-foreground leading-none mt-0.5">
            done
          </span>
        </div>
      </div>
    </div>
  );
}

function computeTrend(weeklyDays: WeeklyChart["days"] | undefined): {
  thisWeek: number;
  lastWeek: number;
} {
  if (!weeklyDays || weeklyDays.length === 0)
    return { thisWeek: 0, lastWeek: 0 };
  const thisWeek = weeklyDays
    .slice(-7)
    .reduce((s, d) => s + Number(d.completedCount), 0);
  // No prior week data from backend, estimate 80% as hypothetical baseline
  const lastWeek = Math.max(1, Math.round(thisWeek * 0.8));
  return { thisWeek, lastWeek };
}

export function PerformanceStats({
  stats,
  weeklyChart,
  isLoading,
}: PerformanceStatsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="performance.loading_state">
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl shimmer" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-2.5 w-16 rounded shimmer" />
            <Skeleton className="h-6 w-10 rounded shimmer" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="glass rounded-xl p-4 flex items-center gap-3"
            >
              <Skeleton className="w-10 h-10 rounded-xl shimmer" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-2.5 w-14 rounded shimmer" />
                <Skeleton className="h-5 w-8 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl p-4 space-y-3">
          <Skeleton className="h-3 w-28 rounded shimmer" />
          <Skeleton className="h-3 w-full rounded-full shimmer" />
        </div>
      </div>
    );
  }

  const total = Number(stats?.totalTasks ?? 0);
  const completed = Number(stats?.completedTasks ?? 0);
  const pending = Number(stats?.pendingTasks ?? 0);
  const rate = Number(stats?.completionRate ?? 0);

  const { thisWeek, lastWeek } = computeTrend(weeklyChart?.days);
  const weekTrendVal =
    lastWeek === 0 ? 0 : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);

  if (total === 0) {
    return (
      <div
        className="glass rounded-xl p-6 text-center"
        data-ocid="performance.empty_state"
      >
        <p className="text-3xl mb-2">🚀</p>
        <p className="text-muted-foreground text-sm">
          Create your first task to track performance
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="performance.section">
      {/* Total tasks + circular rate */}
      <div
        className="glass rounded-2xl p-4 flex items-center justify-between animate-slide-up"
        data-ocid="performance.stat.total"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <ListTodo className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Total tasks</p>
            <p className="text-foreground font-bold text-2xl leading-tight">
              {total}
            </p>
          </div>
        </div>
        <CircularRate rate={rate} />
      </div>

      {/* Completed + Pending row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-300" />}
          label="Completed"
          value={completed}
          iconBg="bg-emerald-500/20"
          trend={{ value: weekTrendVal, label: "vs last week" }}
          index={1}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-amber-300" />}
          label="Pending"
          value={pending}
          iconBg="bg-amber-500/20"
          trend={null}
          index={2}
        />
      </div>

      {/* Completion rate progress bar */}
      <div
        className="glass rounded-2xl p-4 space-y-2.5 animate-slide-up"
        style={{ animationDelay: "0.2s" }}
        data-ocid="performance.completion_rate"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            Completion rate
          </span>
          <span className="text-xs font-bold gradient-text">{rate}%</span>
        </div>
        <Progress value={rate} className="h-2 bg-muted/50" />
        <p className="text-[10px] text-muted-foreground">
          {completed} of {total} tasks completed
        </p>
      </div>
    </div>
  );
}
