import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  CATEGORIES,
  type Category,
  PRIORITIES,
  type Priority,
  type TaskFilter,
} from "../../lib/types";
import { cn } from "../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type DeadlineKey = "today" | "week" | "month" | "overdue";

interface TaskFiltersProps {
  filter: Omit<TaskFilter, "searchText" | "deadlineFrom" | "deadlineTo">;
  deadlineKey: DeadlineKey | null;
  onFilterChange: (
    filter: Omit<TaskFilter, "searchText" | "deadlineFrom" | "deadlineTo">,
  ) => void;
  onDeadlineChange: (key: DeadlineKey | null) => void;
  onClearAll: () => void;
  isActive: boolean;
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({
  label,
  active,
  onClick,
  ocid,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  ocid: string;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={cn(
        "flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-fast",
        active
          ? "gradient-primary text-white border-transparent shadow-glow-sm"
          : "glass-sm text-muted-foreground hover:text-foreground hover:border-primary/40",
      )}
    >
      {label}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const DEADLINE_OPTIONS: { key: DeadlineKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "overdue", label: "Overdue" },
];

const STATUS_OPTIONS: { key: "all" | "active" | "completed"; label: string }[] =
  [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
  ];

export default function TaskFilters({
  filter,
  deadlineKey,
  onFilterChange,
  onDeadlineChange,
  onClearAll,
  isActive,
}: TaskFiltersProps) {
  const currentStatus: "all" | "active" | "completed" =
    filter.completed === null
      ? "all"
      : filter.completed
        ? "completed"
        : "active";

  const handleStatus = (key: "all" | "active" | "completed") => {
    onFilterChange({
      ...filter,
      completed: key === "all" ? null : key === "completed",
    });
  };

  const handlePriority = (p: Priority) => {
    onFilterChange({ ...filter, priority: filter.priority === p ? null : p });
  };

  const handleCategory = (c: Category) => {
    onFilterChange({ ...filter, category: filter.category === c ? null : c });
  };

  const handleDeadline = (key: DeadlineKey) => {
    onDeadlineChange(deadlineKey === key ? null : key);
  };

  return (
    <div className="space-y-3">
      {/* Status */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        {STATUS_OPTIONS.map(({ key, label }) => (
          <Chip
            key={key}
            label={label}
            active={currentStatus === key}
            onClick={() => handleStatus(key)}
            ocid={`tasks.filter.tab.${key}`}
          />
        ))}
      </div>

      {/* Priority */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        {PRIORITIES.map((p) => (
          <Chip
            key={p}
            label={p}
            active={filter.priority === p}
            onClick={() => handlePriority(p)}
            ocid={`tasks.filter.tab.priority_${p.toLowerCase()}`}
          />
        ))}
      </div>

      {/* Category */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            active={filter.category === c}
            onClick={() => handleCategory(c)}
            ocid={`tasks.filter.tab.category_${c.toLowerCase()}`}
          />
        ))}
      </div>

      {/* Deadline */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        {DEADLINE_OPTIONS.map(({ key, label }) => (
          <Chip
            key={key}
            label={label}
            active={deadlineKey === key}
            onClick={() => handleDeadline(key)}
            ocid={`tasks.filter.tab.deadline_${key}`}
          />
        ))}
      </div>

      {/* Clear all */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              data-ocid="tasks.filter.clear_button"
              onClick={onClearAll}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-fast font-medium"
            >
              <X className="w-3.5 h-3.5" />
              Clear all filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
