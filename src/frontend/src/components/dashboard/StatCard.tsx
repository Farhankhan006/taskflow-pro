import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: string;
  isLoading?: boolean;
  animationDelay?: number;
  "data-ocid"?: string;
}

function useCountUp(target: number, duration = 1200, enabled = true) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, enabled]);

  return count;
}

export function StatCard({
  label,
  value,
  suffix = "",
  icon,
  iconBg,
  trend,
  isLoading,
  animationDelay = 0,
  "data-ocid": ocid,
}: StatCardProps) {
  const displayValue = useCountUp(value, 1000, !isLoading);

  if (isLoading) {
    return (
      <div
        className="glass rounded-2xl p-4 flex flex-col gap-3"
        data-ocid={`${ocid}.loading_state`}
      >
        <div className="flex items-center justify-between">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <Skeleton className="w-12 h-4 rounded" />
        </div>
        <div>
          <Skeleton className="w-16 h-7 rounded mb-1" />
          <Skeleton className="w-20 h-3 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass rounded-2xl p-4 flex flex-col gap-3 animate-slide-up transition-smooth hover:scale-[1.02] active:scale-[0.98] cursor-default"
      style={{ animationDelay: `${animationDelay}ms` }}
      data-ocid={ocid}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-glow-sm",
            iconBg,
          )}
        >
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-foreground tabular-nums leading-tight">
          {displayValue.toLocaleString()}
          {suffix}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 font-body">
          {label}
        </p>
      </div>
    </div>
  );
}
