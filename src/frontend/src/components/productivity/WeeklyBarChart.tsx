import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklyChart } from "../../lib/types";

interface WeeklyBarChartProps {
  data: WeeklyChart | undefined;
  isLoading: boolean;
}

interface TooltipPayload {
  value: number;
  payload: {
    fullDate: string;
    completed: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const { fullDate, completed } = payload[0].payload;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs shadow-elevated">
      <p className="text-muted-foreground mb-0.5">{fullDate || label}</p>
      <p className="text-foreground font-semibold">
        {completed}{" "}
        <span className="text-muted-foreground font-normal">
          task{completed !== 1 ? "s" : ""}
        </span>
      </p>
    </div>
  );
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyBarChart({ data, isLoading }: WeeklyBarChartProps) {
  if (isLoading) {
    return (
      <div
        className="flex items-end gap-2 h-36 px-2"
        data-ocid="weekly_chart.loading_state"
      >
        {DAY_LABELS.map((d) => (
          <div key={d} className="flex-1 flex flex-col items-center gap-2">
            <Skeleton
              className="w-full rounded-lg shimmer"
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
            <Skeleton className="w-6 h-2.5 rounded shimmer" />
          </div>
        ))}
      </div>
    );
  }

  const days = data?.days ?? [];
  const hasData = days.some((d) => Number(d.completedCount) > 0);

  // Build exactly 7 bars aligned Mon–Sun
  const chartData = DAY_LABELS.map((label, i) => {
    const dayData = days[i];
    const completed = dayData ? Number(dayData.completedCount) : 0;
    const fullDate = dayData?.date ?? label;
    return { label, completed, fullDate };
  });

  const maxVal = Math.max(...chartData.map((d) => d.completed), 1);

  return (
    <div className="w-full" data-ocid="weekly_chart.section">
      {!hasData ? (
        <div
          className="flex flex-col items-center justify-center h-36 text-center"
          data-ocid="weekly_chart.empty_state"
        >
          <p className="text-2xl mb-1">📊</p>
          <p className="text-muted-foreground text-xs">
            Complete tasks to see your weekly chart
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={144}>
          <BarChart
            data={chartData}
            barCategoryGap="30%"
            margin={{ top: 4, right: 0, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.72 0.26 270)" />
                <stop offset="100%" stopColor="oklch(0.55 0.15 295)" />
              </linearGradient>
              <linearGradient id="barGradActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.82 0.26 270)" />
                <stop offset="100%" stopColor="oklch(0.65 0.18 295)" />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="oklch(var(--border) / 0.2)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "oklch(0.62 0.02 270)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, maxVal + 1]}
              tick={{ fontSize: 10, fill: "oklch(0.62 0.02 270)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "oklch(var(--muted) / 0.25)", radius: 6 }}
            />
            <Bar
              dataKey="completed"
              fill="url(#barGrad)"
              radius={[6, 6, 2, 2]}
              maxBarSize={36}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Total this week pill */}
      <div className="flex justify-end mt-1">
        <span className="text-[11px] text-muted-foreground">
          {Number(data?.totalThisWeek ?? 0)}{" "}
          <span className="gradient-text font-semibold">this week</span>
        </span>
      </div>
    </div>
  );
}
