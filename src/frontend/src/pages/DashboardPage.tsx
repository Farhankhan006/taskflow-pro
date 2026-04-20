import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { Layout } from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductivityStatsQuery } from "@/hooks/use-productivity";
import { useWeeklyChartQuery } from "@/hooks/use-productivity";
import { useUserSettingsQuery } from "@/hooks/use-settings";
import { useTasksQuery } from "@/hooks/use-tasks";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  ClipboardList,
  Plus,
  Timer,
  TrendingUp,
} from "lucide-react";

// ─── Greeting helper ──────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getGreetingEmoji(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️";
  if (hour < 17) return "👋";
  return "🌙";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Dashboard Header ─────────────────────────────────────────────────────────

function DashboardHeader({
  displayName,
  isLoading,
}: { displayName?: string; isLoading: boolean }) {
  const greeting = getGreeting();
  const emoji = getGreetingEmoji();

  return (
    <div
      className="px-4 pt-5 pb-4 animate-slide-down"
      data-ocid="dashboard.header"
    >
      {isLoading ? (
        <div>
          <Skeleton className="h-7 w-52 rounded-lg mb-2" />
          <Skeleton className="h-4 w-40 rounded" />
        </div>
      ) : (
        <>
          <h1 className="text-xl font-display font-bold text-foreground leading-tight">
            {greeting}, {displayName || "there"}! {emoji}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{formatDate()}</p>
        </>
      )}
    </div>
  );
}

// ─── Stat Cards Grid ──────────────────────────────────────────────────────────

function StatsGrid({
  stats,
  isLoading,
}: {
  stats:
    | {
        totalTasks: bigint;
        completedTasks: bigint;
        pendingTasks: bigint;
        completionRate: bigint;
      }
    | undefined;
  isLoading: boolean;
}) {
  const cards = [
    {
      label: "Total Tasks",
      value: stats ? Number(stats.totalTasks) : 0,
      icon: <ClipboardList className="w-4 h-4" />,
      iconBg: "gradient-primary",
      ocid: "stats.total_tasks",
      delay: 0,
    },
    {
      label: "Completed",
      value: stats ? Number(stats.completedTasks) : 0,
      icon: <CheckCircle2 className="w-4 h-4" />,
      iconBg: "bg-emerald-500/80",
      ocid: "stats.completed",
      delay: 80,
    },
    {
      label: "Pending",
      value: stats ? Number(stats.pendingTasks) : 0,
      icon: <Timer className="w-4 h-4" />,
      iconBg: "bg-amber-500/80",
      ocid: "stats.pending",
      delay: 160,
    },
    {
      label: "Completion Rate",
      value: stats ? Number(stats.completionRate) : 0,
      suffix: "%",
      icon: <TrendingUp className="w-4 h-4" />,
      iconBg: "bg-accent/80",
      trend:
        stats && Number(stats.completionRate) > 60 ? "On track 🚀" : undefined,
      ocid: "stats.completion_rate",
      delay: 240,
    },
  ];

  return (
    <section className="px-4" data-ocid="stats.section">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <StatCard
            key={card.ocid}
            label={card.label}
            value={card.value}
            suffix={card.suffix}
            icon={card.icon}
            iconBg={card.iconBg}
            trend={card.trend}
            isLoading={isLoading}
            animationDelay={card.delay}
            data-ocid={card.ocid}
          />
        ))}
      </div>
    </section>
  );
}

// ─── FAB ─────────────────────────────────────────────────────────────────────

function QuickAddFAB() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate({ to: "/tasks/new" })}
      className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-2xl gradient-primary shadow-glow flex items-center justify-center animate-scale-in transition-smooth hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Add new task"
      data-ocid="dashboard.fab_add_task"
    >
      <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: settings, isLoading: settingsLoading } = useUserSettingsQuery();
  const { data: stats, isLoading: statsLoading } = useProductivityStatsQuery();
  const { data: weeklyChart, isLoading: chartLoading } = useWeeklyChartQuery();
  const { data: tasks, isLoading: tasksLoading } = useTasksQuery();

  return (
    <Layout title="Dashboard" displayName={settings?.displayName}>
      <div className="flex flex-col gap-5 pb-6" data-ocid="dashboard.page">
        {/* Greeting header */}
        <DashboardHeader
          displayName={settings?.displayName}
          isLoading={settingsLoading}
        />

        {/* Stat cards */}
        <StatsGrid stats={stats} isLoading={statsLoading} />

        {/* Weekly chart */}
        <div className="px-4">
          <WeeklyChart data={weeklyChart} isLoading={chartLoading} />
        </div>

        {/* Upcoming deadlines */}
        <div className="px-4">
          <UpcomingDeadlines tasks={tasks} isLoading={tasksLoading} />
        </div>
      </div>

      {/* Floating Action Button */}
      <QuickAddFAB />
    </Layout>
  );
}
