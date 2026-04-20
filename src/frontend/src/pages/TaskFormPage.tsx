import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Layout } from "../components/layout/Layout";
import { TaskForm } from "../components/tasks/TaskForm";
import {
  useCreateTaskMutation,
  useTaskQuery,
  useUpdateTaskMutation,
} from "../hooks/use-tasks";
import type { CreateTaskInput } from "../lib/types";

// ─── Shared page shell ────────────────────────────────────────────────────────

function FormShell({
  title,
  subtitle,
  children,
  onBack,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBack: () => void;
}) {
  return (
    <Layout showNav={false} showHeader={false}>
      {/* Custom header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border/30 safe-top">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <button
            type="button"
            onClick={onBack}
            data-ocid="task_form.back_button"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-foreground leading-tight truncate font-display">
              {title}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
            {title.startsWith("Edit") ? (
              <Pencil className="w-4.5 h-4.5 text-white" />
            ) : (
              <Plus className="w-5 h-5 text-white" />
            )}
          </div>
        </div>
      </header>

      {/* Form content */}
      <div className="px-4 pt-6 pb-8 animate-slide-up">
        <div className="glass rounded-2xl p-5 shadow-elevated">{children}</div>
      </div>
    </Layout>
  );
}

// ─── Create Task Page ─────────────────────────────────────────────────────────

export function CreateTaskPage() {
  const navigate = useNavigate();
  const mutation = useCreateTaskMutation();

  function handleBack() {
    navigate({ to: "/tasks" });
  }

  function handleSubmit(input: CreateTaskInput) {
    mutation.mutate(input, {
      onSuccess: () => {
        toast.success("Task created!", {
          description: `"${input.title}" has been added to your list.`,
        });
        navigate({ to: "/tasks" });
      },
      onError: () => {
        toast.error("Failed to create task", {
          description: "Something went wrong. Please try again.",
        });
      },
    });
  }

  return (
    <FormShell
      title="New Task"
      subtitle="Fill in the details below"
      onBack={handleBack}
    >
      <TaskForm
        isLoading={mutation.isPending}
        onSubmit={handleSubmit}
        onCancel={handleBack}
      />
    </FormShell>
  );
}

// ─── Edit Task Page ───────────────────────────────────────────────────────────

export function EditTaskPage() {
  const navigate = useNavigate();
  const { taskId } = useParams({ strict: false }) as { taskId?: string };
  const parsedId = taskId ? BigInt(taskId) : null;

  const { data: task, isLoading } = useTaskQuery(parsedId);
  const mutation = useUpdateTaskMutation();

  // Redirect if task not found after loading
  useEffect(() => {
    if (!isLoading && task === null) {
      toast.error("Task not found");
      navigate({ to: "/tasks" });
    }
  }, [isLoading, task, navigate]);

  function handleBack() {
    navigate({ to: "/tasks" });
  }

  function handleSubmit(input: CreateTaskInput) {
    if (!parsedId) return;
    mutation.mutate(
      {
        taskId: parsedId,
        input: {
          title: input.title,
          description: input.description,
          category: input.category,
          priority: input.priority,
          deadline: input.deadline,
          completed: null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Task updated!", {
            description: "Your changes have been saved.",
          });
          navigate({ to: "/tasks" });
        },
        onError: () => {
          toast.error("Failed to update task", {
            description: "Something went wrong. Please try again.",
          });
        },
      },
    );
  }

  if (isLoading || !task) {
    return (
      <Layout showNav={false} showHeader={false}>
        <div
          className="min-h-screen flex items-center justify-center"
          data-ocid="task_form.loading_state"
        >
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Loading task…</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <FormShell
      title="Edit Task"
      subtitle="Update the details below"
      onBack={handleBack}
    >
      <TaskForm
        task={task}
        isLoading={mutation.isPending}
        onSubmit={handleSubmit}
        onCancel={handleBack}
      />
    </FormShell>
  );
}
