import type { Principal } from "@icp-sdk/core/principal";

// ─── Domain Enums ────────────────────────────────────────────────────────────

export type Category = "Work" | "Personal" | "Study" | "Health" | "Finance";
export type Priority = "High" | "Medium" | "Low";

export const CATEGORIES: Category[] = [
  "Work",
  "Personal",
  "Study",
  "Health",
  "Finance",
];
export const PRIORITIES: Priority[] = ["High", "Medium", "Low"];

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface Task {
  id: bigint;
  userId: Principal;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  deadline: bigint | null;
  completed: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  deadline: bigint | null;
}

export interface UpdateTaskInput {
  title: string | null;
  description: string | null;
  category: Category | null;
  priority: Priority | null;
  deadline?: bigint | null;
  completed: boolean | null;
}

export interface TaskFilter {
  priority: Priority | null;
  category: Category | null;
  completed: boolean | null;
  deadlineFrom: bigint | null;
  deadlineTo: bigint | null;
  searchText: string | null;
}

export interface UserSettings {
  userId: Principal;
  displayName: string;
  theme: "light" | "dark";
  notificationsEnabled: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface UpdateSettingsInput {
  displayName: string | null;
  theme: "light" | "dark" | null;
  notificationsEnabled: boolean | null;
}

// ─── Productivity ─────────────────────────────────────────────────────────────

export interface DayStats {
  date: string;
  completedCount: bigint;
}

export interface WeeklyChart {
  days: DayStats[];
  totalThisWeek: bigint;
}

export interface ProductivityStats {
  totalTasks: bigint;
  completedTasks: bigint;
  pendingTasks: bigint;
  weeklyChart: WeeklyChart;
  monthlyCompleted: bigint;
  completionRate: bigint;
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; className: string; color: string }
> = {
  High: { label: "High", className: "priority-high", color: "#f87171" },
  Medium: { label: "Medium", className: "priority-medium", color: "#fbbf24" },
  Low: { label: "Low", className: "priority-low", color: "#34d399" },
};

export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; className: string; emoji: string }
> = {
  Work: { label: "Work", className: "category-work", emoji: "💼" },
  Personal: { label: "Personal", className: "category-personal", emoji: "🏠" },
  Study: { label: "Study", className: "category-study", emoji: "📚" },
  Health: { label: "Health", className: "category-health", emoji: "💪" },
  Finance: { label: "Finance", className: "category-finance", emoji: "💰" },
};

export const DEFAULT_FILTER: TaskFilter = {
  priority: null,
  category: null,
  completed: null,
  deadlineFrom: null,
  deadlineTo: null,
  searchText: null,
};
