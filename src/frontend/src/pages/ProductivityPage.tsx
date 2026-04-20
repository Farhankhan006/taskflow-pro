import { Button } from "@/components/ui/button";
import { BarChart2, RefreshCw } from "lucide-react";
import { MonthlyInsights } from "../components/productivity/MonthlyInsights";
import { PerformanceStats } from "../components/productivity/PerformanceStats";
import { WeeklyBarChart } from "../components/productivity/WeeklyBarChart";
import {
  useProductivityStatsQuery,
  useWeeklyChartQuery,
} from "../hooks/use-productivity";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
  ocid,
}: {
  title: string;
  children: React.ReactNode;
  ocid: string;
}) {
  return (
    <section data-ocid={ocid}>
      <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-widest mb-3 px-1">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function PageHeader({ onRefresh }: { onRefresh: () => void }) {
  return (
    <header
      className="glass-dark border-b border-border/10 sticky top-0 z-20 px-4 py-3.5 flex items-center justify-between safe-top"
      data-ocid="productivity.page"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
          <BarChart2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-base leading-none">
            Productivity
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Your performance insights
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8 rounded-xl text-muted-foreground hover:text-foreground"
        onClick={onRefresh}
        aria-label="Refresh productivity data"
        data-ocid="productivity.refresh_button"
      >
        <RefreshCw className="w-4 h-4" />
      </Button>
    </header>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductivityPage() {
  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useProductivityStatsQuery();

  const {
    data: chartData,
    isLoading: chartLoading,
    refetch: refetchChart,
  } = useWeeklyChartQuery();

  function handleRefresh() {
    void refetchStats();
    void refetchChart();
  }

  const isLoading = statsLoading || chartLoading;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader onRefresh={handleRefresh} />

      <main className="flex-1 px-4 pt-5 pb-28 space-y-6 overflow-y-auto scrollbar-hide">
        {/* Performance Stats */}
        <Section title="Performance" ocid="performance.section_header">
          <PerformanceStats
            stats={statsData}
            weeklyChart={chartData}
            isLoading={isLoading}
          />
        </Section>

        {/* Weekly Chart */}
        <Section title="Weekly Activity" ocid="weekly_chart.section_header">
          <div className="glass rounded-2xl p-4" data-ocid="weekly_chart.card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">
                Tasks completed per day
              </p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                This week
              </span>
            </div>
            <WeeklyBarChart data={chartData} isLoading={chartLoading} />
          </div>
        </Section>

        {/* Monthly Insights */}
        <Section
          title="Monthly Insights"
          ocid="monthly_insights.section_header"
        >
          <MonthlyInsights stats={statsData} isLoading={statsLoading} />
        </Section>
      </main>
    </div>
  );
}
