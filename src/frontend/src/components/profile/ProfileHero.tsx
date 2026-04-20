import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Flame, Trophy, User2 } from "lucide-react";
import type { ProductivityStats, UserSettings } from "../../lib/types";

// ─── Stat Chip ─────────────────────────────────────────────────────────────

interface StatChipProps {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
  ocid: string;
}

function StatChip({ icon: Icon, value, label, color, ocid }: StatChipProps) {
  return (
    <div
      className="flex-1 glass rounded-2xl p-3 flex flex-col items-center gap-1 animate-scale-in"
      data-ocid={ocid}
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-lg font-display font-bold text-foreground leading-none">
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground leading-none text-center">
        {label}
      </span>
    </div>
  );
}

// ─── Avatar ────────────────────────────────────────────────────────────────

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center shadow-glow text-white font-display font-bold text-3xl ring-4 ring-background"
      aria-label={`Avatar for ${name}`}
    >
      {initials || <User2 className="w-10 h-10" />}
    </div>
  );
}

// ─── Member Since ─────────────────────────────────────────────────────────

function formatMemberSince(createdAt: bigint): string {
  // backend stores nanoseconds
  const ms = Number(createdAt / 1_000_000n);
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function deriveStreak(stats: ProductivityStats): number {
  const days = stats.weeklyChart.days;
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (Number(days[i].completedCount) > 0) streak++;
    else break;
  }
  return streak;
}

// ─── ProfileHero ──────────────────────────────────────────────────────────

interface ProfileHeroProps {
  settings: UserSettings | null | undefined;
  stats: ProductivityStats | undefined;
  isLoading: boolean;
  principalText: string;
}

export function ProfileHero({
  settings,
  stats,
  isLoading,
  principalText,
}: ProfileHeroProps) {
  const displayName = settings?.displayName || "Taskflow User";
  const memberSince = settings?.createdAt
    ? formatMemberSince(settings.createdAt)
    : "—";
  const completedTotal = stats ? Number(stats.completedTasks) : 0;
  const streak = stats ? deriveStreak(stats) : 0;

  return (
    <div
      className="relative overflow-hidden px-4 pt-6 pb-5"
      data-ocid="profile.hero"
    >
      {/* Background gradient blob */}
      <div
        className="absolute inset-0 gradient-hero opacity-70 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.7 0.18 260 / 0.18) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Avatar + Identity */}
        <div className="flex items-end gap-4 mb-5 animate-slide-up">
          {isLoading ? (
            <Skeleton className="w-24 h-24 rounded-3xl flex-shrink-0" />
          ) : (
            <InitialsAvatar name={displayName} />
          )}

          <div className="flex-1 min-w-0 mb-1">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-36 mb-2 rounded-lg" />
                <Skeleton className="h-4 w-28 rounded-lg" />
              </>
            ) : (
              <>
                <h1 className="text-xl font-display font-bold text-foreground truncate leading-tight">
                  {displayName}
                </h1>
                <p
                  className="text-xs text-muted-foreground mt-0.5 font-mono truncate"
                  data-ocid="profile.principal_text"
                  title={principalText}
                >
                  {principalText.length > 22
                    ? `${principalText.slice(0, 10)}…${principalText.slice(-8)}`
                    : principalText || "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Member since {memberSince}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Stats row */}
        {isLoading ? (
          <div className="flex gap-2.5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="flex-1 h-20 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="flex gap-2.5" data-ocid="profile.stats_row">
            <StatChip
              icon={CheckCircle2}
              value={String(completedTotal)}
              label="Completed"
              color="bg-emerald-500/20 text-emerald-400"
              ocid="profile.stat_completed"
            />
            <StatChip
              icon={Flame}
              value={`${streak}d`}
              label="Streak"
              color="bg-orange-500/20 text-orange-400"
              ocid="profile.stat_streak"
            />
            <StatChip
              icon={Trophy}
              value={stats ? `${Number(stats.completionRate)}%` : "0%"}
              label="Rate"
              color="bg-primary/20 text-primary"
              ocid="profile.stat_rate"
            />
          </div>
        )}
      </div>
    </div>
  );
}
