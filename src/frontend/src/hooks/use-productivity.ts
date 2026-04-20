import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import { createBackendService } from "../lib/backend-service";
import type { ProductivityStats, WeeklyChart } from "../lib/types";

function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service: actor ? createBackendService(actor as any) : null,
    ready: !!actor && !isFetching,
  };
}

export function useProductivityStatsQuery() {
  const { service, ready } = useBackend();
  return useQuery<ProductivityStats>({
    queryKey: ["productivityStats"],
    queryFn: async () => {
      if (!service) {
        return {
          totalTasks: 0n,
          completedTasks: 0n,
          pendingTasks: 0n,
          weeklyChart: { days: [], totalThisWeek: 0n },
          monthlyCompleted: 0n,
          completionRate: 0n,
        };
      }
      return service.getProductivityStats();
    },
    enabled: ready,
    staleTime: 60_000,
  });
}

export function useWeeklyChartQuery() {
  const { service, ready } = useBackend();
  return useQuery<WeeklyChart>({
    queryKey: ["weeklyChart"],
    queryFn: async () => {
      if (!service) return { days: [], totalThisWeek: 0n };
      return service.getWeeklyChart();
    },
    enabled: ready,
    staleTime: 60_000,
  });
}
