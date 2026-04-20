import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeeklyChart as WeeklyChartType } from "@/lib/types";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  completed: {
    label: "Tasks completed",
    color: "oklch(0.72 0.26 270)",
  },
} satisfies ChartConfig;

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildChartData(weeklyChart: WeeklyChartType | undefined) {
  // Build a 7-day window starting from Monday of the current week
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun
  // Start from Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  return DAY_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const isoDate = d.toISOString().split("T")[0];

    const found = weeklyChart?.days.find((day) => day.date === isoDate);
    return {
      day: label,
      completed: found ? Number(found.completedCount) : 0,
      isToday: d.toDateString() === today.toDateString(),
    };
  });
}

interface WeeklyChartProps {
  data: WeeklyChartType | undefined;
  isLoading: boolean;
}

export function WeeklyChart({ data, isLoading }: WeeklyChartProps) {
  const chartData = buildChartData(data);
  const totalThisWeek = data ? Number(data.totalThisWeek) : 0;

  return (
    <section data-ocid="weekly_chart.section">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-display font-semibold text-foreground">
          Weekly Activity
        </h2>
        {!isLoading && (
          <span className="text-xs font-medium text-accent animate-fade-in">
            {totalThisWeek} this week
          </span>
        )}
      </div>

      <div className="glass rounded-2xl p-4" data-ocid="weekly_chart.card">
        {isLoading ? (
          <div data-ocid="weekly_chart.loading_state">
            <div className="flex items-end justify-between gap-1.5 h-28 mb-3">
              {[0.4, 0.7, 0.55, 0.9, 0.65, 0.3, 0.5].map((h, i) => (
                <Skeleton
                  key={`skel-${DAY_LABELS[i]}`}
                  className="flex-1 rounded-md"
                  style={{ height: `${h * 100}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between">
              {DAY_LABELS.map((l) => (
                <Skeleton key={l} className="w-6 h-3 rounded" />
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <ChartContainer config={chartConfig} className="h-40 w-full">
              <BarChart
                data={chartData}
                barSize={22}
                margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="oklch(var(--border) / 0.15)"
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 11,
                    fill: "oklch(var(--muted-foreground))",
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "oklch(var(--muted-foreground))",
                  }}
                  allowDecimals={false}
                  width={28}
                />
                <ChartTooltip
                  cursor={{ fill: "oklch(var(--muted) / 0.3)", radius: 6 }}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="completed"
                  radius={[6, 6, 3, 3]}
                  fill="oklch(0.72 0.26 270)"
                />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </div>
    </section>
  );
}
