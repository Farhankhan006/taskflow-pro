import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertCircle, CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import {
  CATEGORIES,
  CATEGORY_CONFIG,
  type Category,
  type CreateTaskInput,
  PRIORITIES,
  PRIORITY_CONFIG,
  type Priority,
  type Task,
} from "../../lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
  title: string;
  description: string;
  category: Category | "";
  priority: Priority | "";
  deadlineDate: Date | undefined;
  deadlineTime: string;
}

interface FormErrors {
  title?: string;
  priority?: string;
  category?: string;
}

interface TaskFormProps {
  task?: Task;
  isLoading?: boolean;
  onSubmit: (input: CreateTaskInput) => void;
  onCancel: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dateToNanoseconds(date: Date): bigint {
  return BigInt(date.getTime()) * 1_000_000n;
}

function parseDeadline(date: Date | undefined, time: string): bigint | null {
  if (!date) return null;
  const [h, m] = (time || "00:00").split(":").map(Number);
  const d = new Date(date);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return dateToNanoseconds(d);
}

function nsToDate(ns: bigint): Date {
  return new Date(Number(ns / 1_000_000n));
}

// ─── Field Error ─────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5 animate-slide-down"
      data-ocid="task_form.field_error"
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  );
}

// ─── Priority Selector ────────────────────────────────────────────────────────

function PrioritySelector({
  value,
  onChange,
  error,
}: {
  value: Priority | "";
  onChange: (p: Priority) => void;
  error?: string;
}) {
  const configs: { priority: Priority; dot: string; ring: string }[] = [
    { priority: "High", dot: "bg-red-400", ring: "ring-red-400/40" },
    { priority: "Medium", dot: "bg-amber-400", ring: "ring-amber-400/40" },
    { priority: "Low", dot: "bg-emerald-400", ring: "ring-emerald-400/40" },
  ];

  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5 block">
        Priority <span className="text-red-400">*</span>
      </Label>
      <div
        className="grid grid-cols-3 gap-2.5"
        data-ocid="task_form.priority_selector"
      >
        {configs.map(({ priority, dot, ring }) => {
          const cfg = PRIORITY_CONFIG[priority];
          const isSelected = value === priority;
          return (
            <button
              key={priority}
              type="button"
              onClick={() => onChange(priority)}
              data-ocid={`task_form.priority.${priority.toLowerCase()}`}
              className={cn(
                "relative flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border transition-smooth",
                "min-h-[72px] focus-visible:outline-none focus-visible:ring-2",
                isSelected
                  ? `${cfg.className} border-current ring-2 ${ring} shadow-glow-sm`
                  : "bg-card/50 border-border/40 hover:border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <span className={cn("w-3 h-3 rounded-full", dot)} />
              <span className="text-xs font-semibold">{priority}</span>
            </button>
          );
        })}
      </div>
      <FieldError message={error} />
    </div>
  );
}

// ─── Category Selector ────────────────────────────────────────────────────────

function CategorySelector({
  value,
  onChange,
  error,
}: {
  value: Category | "";
  onChange: (c: Category) => void;
  error?: string;
}) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5 block">
        Category <span className="text-red-400">*</span>
      </Label>
      <div
        className="grid grid-cols-3 gap-2"
        data-ocid="task_form.category_selector"
      >
        {CATEGORIES.map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const isSelected = value === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              data-ocid={`task_form.category.${cat.toLowerCase()}`}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-smooth",
                "min-h-[64px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? `${cfg.className} border-current shadow-glow-sm`
                  : "bg-card/50 border-border/40 hover:border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="text-lg leading-none">{cfg.emoji}</span>
              <span className="text-xs font-medium">{cfg.label}</span>
            </button>
          );
        })}
      </div>
      <FieldError message={error} />
    </div>
  );
}

// ─── Deadline Picker ─────────────────────────────────────────────────────────

function DeadlinePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
}: {
  date: Date | undefined;
  time: string;
  onDateChange: (d: Date | undefined) => void;
  onTimeChange: (t: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5 block">
        Deadline <span className="text-muted-foreground/50">(optional)</span>
      </Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              data-ocid="task_form.deadline_date_button"
              className={cn(
                "flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-smooth",
                "bg-card/50 border-border/40 hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium">
                {date ? format(date, "MMM dd, yyyy") : "Pick a date"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 glass border-border/40"
            align="start"
            data-ocid="task_form.calendar_popover"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                onDateChange(d);
                setOpen(false);
              }}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {date && (
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              data-ocid="task_form.deadline_time_input"
              className={cn(
                "px-3 py-3 rounded-xl border text-sm font-medium transition-smooth",
                "bg-card/50 border-border/40 text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              )}
            />
            <button
              type="button"
              onClick={() => onDateChange(undefined)}
              data-ocid="task_form.deadline_clear_button"
              className="p-2.5 rounded-xl border border-border/40 bg-card/50 hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive transition-smooth"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Task Form ────────────────────────────────────────────────────────────────

export function TaskForm({
  task,
  isLoading = false,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const isEdit = !!task;

  const getInitialDeadlineDate = () => {
    if (!task?.deadline) return undefined;
    return nsToDate(task.deadline);
  };

  const getInitialDeadlineTime = () => {
    if (!task?.deadline) return "09:00";
    const d = nsToDate(task.deadline);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const [values, setValues] = useState<FormValues>({
    title: task?.title ?? "",
    description: task?.description ?? "",
    category: task?.category ?? "",
    priority: task?.priority ?? "",
    deadlineDate: getInitialDeadlineDate(),
    deadlineTime: getInitialDeadlineTime(),
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function validate(vals: FormValues): FormErrors {
    const errs: FormErrors = {};
    if (!vals.title.trim()) {
      errs.title = "Title is required";
    } else if (vals.title.trim().length < 3) {
      errs.title = "Title must be at least 3 characters";
    }
    if (!vals.priority) errs.priority = "Please select a priority";
    if (!vals.category) errs.category = "Please select a category";
    return errs;
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validate(values);
    setErrors(errs);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = { title: true, priority: true, category: true };
    setTouched(allTouched);
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const input: CreateTaskInput = {
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category as Category,
      priority: values.priority as Priority,
      deadline: parseDeadline(values.deadlineDate, values.deadlineTime),
    };
    onSubmit(input);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 animate-fade-in"
    >
      {/* Title */}
      <div className="space-y-1.5">
        <Label
          htmlFor="task-title"
          className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
        >
          Task Title <span className="text-red-400">*</span>
        </Label>
        <div className="relative">
          <Input
            id="task-title"
            value={values.title}
            onChange={(e) => {
              setValues((v) => ({ ...v, title: e.target.value }));
              if (touched.title)
                setErrors(validate({ ...values, title: e.target.value }));
            }}
            onBlur={() => handleBlur("title")}
            placeholder="What needs to be done?"
            maxLength={100}
            data-ocid="task_form.title_input"
            className={cn(
              "h-12 px-4 rounded-xl bg-card/50 border-border/40 text-base placeholder:text-muted-foreground/50",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-smooth",
              touched.title && errors.title
                ? "border-red-500/50 focus-visible:ring-red-400/40"
                : "",
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40">
            {values.title.length}/100
          </span>
        </div>
        {touched.title && <FieldError message={errors.title} />}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label
          htmlFor="task-desc"
          className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
        >
          Description{" "}
          <span className="text-muted-foreground/50">(optional)</span>
        </Label>
        <Textarea
          id="task-desc"
          value={values.description}
          onChange={(e) =>
            setValues((v) => ({ ...v, description: e.target.value }))
          }
          placeholder="Add details, notes, or context…"
          maxLength={500}
          rows={3}
          data-ocid="task_form.description_textarea"
          className={cn(
            "px-4 py-3 rounded-xl bg-card/50 border-border/40 text-sm placeholder:text-muted-foreground/50",
            "resize-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-smooth",
          )}
        />
      </div>

      {/* Priority */}
      <PrioritySelector
        value={values.priority}
        onChange={(p) => {
          setValues((v) => ({ ...v, priority: p }));
          if (touched.priority) setErrors(validate({ ...values, priority: p }));
        }}
        error={touched.priority ? errors.priority : undefined}
      />

      {/* Category */}
      <CategorySelector
        value={values.category}
        onChange={(c) => {
          setValues((v) => ({ ...v, category: c }));
          if (touched.category) setErrors(validate({ ...values, category: c }));
        }}
        error={touched.category ? errors.category : undefined}
      />

      {/* Deadline */}
      <DeadlinePicker
        date={values.deadlineDate}
        time={values.deadlineTime}
        onDateChange={(d) => setValues((v) => ({ ...v, deadlineDate: d }))}
        onTimeChange={(t) => setValues((v) => ({ ...v, deadlineTime: t }))}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-2 pb-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-ocid="task_form.cancel_button"
          className="flex-1 h-12 rounded-xl border-border/40 bg-card/50 hover:bg-muted/60 text-foreground transition-smooth"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          data-ocid="task_form.submit_button"
          className={cn(
            "flex-1 h-12 rounded-xl font-semibold transition-smooth",
            "gradient-primary text-white shadow-glow hover:shadow-glow hover:opacity-90",
            "disabled:opacity-60 disabled:cursor-not-allowed",
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              {isEdit ? "Saving…" : "Creating…"}
            </span>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Task"
          )}
        </Button>
      </div>
    </form>
  );
}
