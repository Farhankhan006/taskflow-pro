import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Layout } from "../components/layout/Layout";
import EmptyTaskState from "../components/tasks/EmptyTaskState";
import TaskCard from "../components/tasks/TaskCard";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskSearch from "../components/tasks/TaskSearch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Skeleton } from "../components/ui/skeleton";
import {
  useDeleteTaskMutation,
  useTasksQuery,
  useToggleTaskMutation,
} from "../hooks/use-tasks";
import type { Task, TaskFilter } from "../lib/types";

// ─── Deadline helpers ─────────────────────────────────────────────────────────

function getDeadlineWindow(key: "today" | "week" | "month" | "overdue"): {
  from: bigint;
  to: bigint;
} {
  const now = Date.now();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const MS = 1_000_000n;

  if (key === "overdue") {
    return { from: 0n, to: BigInt(startOfDay.getTime()) * MS };
  }
  if (key === "today") {
    const end = new Date(startOfDay);
    end.setHours(23, 59, 59, 999);
    return {
      from: BigInt(startOfDay.getTime()) * MS,
      to: BigInt(end.getTime()) * MS,
    };
  }
  if (key === "week") {
    const end = new Date(now + 7 * 86400000);
    return {
      from: BigInt(startOfDay.getTime()) * MS,
      to: BigInt(end.getTime()) * MS,
    };
  }
  const end = new Date(now + 30 * 86400000);
  return {
    from: BigInt(startOfDay.getTime()) * MS,
    to: BigInt(end.getTime()) * MS,
  };
}

// ─── Sort tasks ───────────────────────────────────────────────────────────────

const PRIORITY_RANK: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Incomplete first
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // Deadline nearest first (null last)
    if (a.deadline !== b.deadline) {
      if (a.deadline === null) return 1;
      if (b.deadline === null) return -1;
      return a.deadline < b.deadline ? -1 : 1;
    }
    // Priority High > Medium > Low
    return (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1);
  });
}

// ─── Skeleton list ────────────────────────────────────────────────────────────

function TaskSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 space-y-3 animate-fade-in">
      <div className="flex items-start gap-3">
        <Skeleton className="w-5 h-5 rounded-md mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
        </div>
        <Skeleton className="w-14 h-5 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const navigate = useNavigate();

  // Search + deadline local state (not in URL to avoid noise)
  const [searchText, setSearchText] = useState("");
  const [deadlineKey, setDeadlineKey] = useState<
    "today" | "week" | "month" | "overdue" | null
  >(null);
  const [localFilter, setLocalFilter] = useState<
    Omit<TaskFilter, "searchText" | "deadlineFrom" | "deadlineTo">
  >({ priority: null, category: null, completed: null });

  // Build full filter for query
  const activeFilter = useMemo<TaskFilter>(() => {
    const deadlineWindow = deadlineKey ? getDeadlineWindow(deadlineKey) : null;
    return {
      ...localFilter,
      searchText: searchText.trim() || null,
      deadlineFrom: deadlineWindow?.from ?? null,
      deadlineTo: deadlineWindow?.to ?? null,
    };
  }, [localFilter, searchText, deadlineKey]);

  const isFilterActive = useMemo(() => {
    return (
      activeFilter.priority !== null ||
      activeFilter.category !== null ||
      activeFilter.completed !== null ||
      deadlineKey !== null ||
      (activeFilter.searchText !== null && activeFilter.searchText !== "")
    );
  }, [activeFilter, deadlineKey]);

  const { data: tasks, isLoading } = useTasksQuery(activeFilter);
  const toggleMutation = useToggleTaskMutation();
  const deleteMutation = useDeleteTaskMutation();

  const sortedTasks = useMemo(() => sortTasks(tasks ?? []), [tasks]);

  // Delete confirmation dialog
  const [pendingDeleteId, setPendingDeleteId] = useState<bigint | null>(null);

  const handleDeleteRequest = useCallback((taskId: bigint) => {
    setPendingDeleteId(taskId);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (pendingDeleteId === null) return;
    deleteMutation.mutate(pendingDeleteId, {
      onSuccess: () => toast.success("Task deleted"),
      onError: () => toast.error("Failed to delete task"),
    });
    setPendingDeleteId(null);
  }, [pendingDeleteId, deleteMutation]);

  const handleClearFilters = useCallback(() => {
    setLocalFilter({ priority: null, category: null, completed: null });
    setDeadlineKey(null);
    setSearchText("");
  }, []);

  const hasNoResults = !isLoading && sortedTasks.length === 0;

  return (
    <Layout>
      <div className="flex flex-col min-h-full pb-24">
        {/* Page header */}
        <div className="px-4 pt-4 pb-2">
          <h1
            className="text-2xl font-display font-bold gradient-text"
            data-ocid="tasks.page"
          >
            My Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Loading…"
              : `${sortedTasks.length} task${sortedTasks.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Search bar */}
        <div className="px-4 py-2">
          <TaskSearch value={searchText} onChange={setSearchText} />
        </div>

        {/* Filters */}
        <div className="px-4 py-2">
          <TaskFilters
            filter={localFilter}
            deadlineKey={deadlineKey}
            onFilterChange={setLocalFilter}
            onDeadlineChange={setDeadlineKey}
            onClearAll={handleClearFilters}
            isActive={isFilterActive}
          />
        </div>

        {/* Task list */}
        <div className="flex-1 px-4 py-2 space-y-3">
          {isLoading ? (
            <>
              {(["s1", "s2", "s3", "s4", "s5"] as const).map((id) => (
                <TaskSkeleton key={id} />
              ))}
            </>
          ) : hasNoResults ? (
            <EmptyTaskState
              hasFilters={isFilterActive}
              onClearFilters={handleClearFilters}
              onCreateTask={() => navigate({ to: "/tasks/new" })}
            />
          ) : (
            sortedTasks.map((task, index) => (
              <TaskCard
                key={task.id.toString()}
                task={task}
                index={index + 1}
                onToggle={() => toggleMutation.mutate(task.id)}
                onDelete={() => handleDeleteRequest(task.id)}
                onEdit={() =>
                  navigate({
                    to: "/tasks/$taskId/edit",
                    params: { taskId: task.id.toString() },
                  })
                }
                isTogglePending={
                  toggleMutation.isPending &&
                  toggleMutation.variables === task.id
                }
              />
            ))
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        type="button"
        data-ocid="tasks.add_button"
        onClick={() => navigate({ to: "/tasks/new" })}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-2xl gradient-primary shadow-glow flex items-center justify-center transition-smooth hover:scale-105 active:scale-95 z-40"
        aria-label="Create new task"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>

      {/* Delete confirmation */}
      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent
          data-ocid="tasks.delete_dialog"
          className="glass-dark mx-4 rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The task will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="tasks.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="tasks.confirm_button"
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
