import { Check, Clock, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { CATEGORY_CONFIG, PRIORITY_CONFIG, type Task } from "../../lib/types";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// ─── Deadline label ───────────────────────────────────────────────────────────

function formatDeadline(ns: bigint | null): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
} {
  if (ns === null) return { label: "", isOverdue: false, isToday: false };
  const ms = Number(ns / 1_000_000n);
  const now = Date.now();
  const diff = ms - now;
  const isOverdue = diff < 0;

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const absDiff = Math.abs(diff);

  let label: string;
  if (absDiff < 60_000) {
    label = isOverdue ? "Just now" : "In a moment";
  } else if (absDiff < 3600_000) {
    label = rtf.format(Math.round(diff / 60_000), "minute");
  } else if (absDiff < 86400_000) {
    label = rtf.format(Math.round(diff / 3600_000), "hour");
  } else if (absDiff < 7 * 86400_000) {
    label = rtf.format(Math.round(diff / 86400_000), "day");
  } else {
    label = new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    }).format(ms);
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday.getTime() + 86400_000);
  const isToday = ms >= startOfToday.getTime() && ms < endOfToday.getTime();

  return { label, isOverdue, isToday };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  index: number;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isTogglePending: boolean;
}

export default function TaskCard({
  task,
  index,
  onToggle,
  onDelete,
  onEdit,
  isTogglePending,
}: TaskCardProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const categoryConfig = CATEGORY_CONFIG[task.category];
  const deadline = formatDeadline(task.deadline);

  return (
    <motion.div
      data-ocid={`tasks.item.${index}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.04, 0.3),
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn(
        "glass rounded-2xl p-4 transition-smooth group",
        task.completed && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          data-ocid={`tasks.checkbox.${index}`}
          onClick={onToggle}
          disabled={isTogglePending}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          className={cn(
            "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-smooth",
            task.completed
              ? "gradient-primary border-transparent"
              : "border-border hover:border-primary",
          )}
        >
          {task.completed && (
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "font-medium text-foreground leading-snug truncate transition-smooth",
              task.completed && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Category badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium",
                categoryConfig.className,
              )}
            >
              <span>{categoryConfig.emoji}</span>
              <span>{categoryConfig.label}</span>
            </span>

            {/* Deadline */}
            {task.deadline !== null && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs",
                  deadline.isOverdue
                    ? "text-red-400"
                    : deadline.isToday
                      ? "text-amber-400"
                      : "text-muted-foreground",
                )}
              >
                <Clock className="w-3 h-3" />
                <span>{deadline.label}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: priority + menu */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full border font-semibold",
              priorityConfig.className,
            )}
          >
            {priorityConfig.label}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-ocid={`tasks.open_modal_button.${index}`}
                aria-label="Task options"
                className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-fast"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="glass-dark rounded-xl min-w-[140px]"
            >
              <DropdownMenuItem
                data-ocid={`tasks.edit_button.${index}`}
                onClick={onEdit}
                className="gap-2 cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                data-ocid={`tasks.delete_button.${index}`}
                onClick={onDelete}
                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}
