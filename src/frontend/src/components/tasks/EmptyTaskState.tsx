import { ClipboardList, Plus, SearchX } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../ui/button";

interface EmptyTaskStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreateTask: () => void;
}

export default function EmptyTaskState({
  hasFilters,
  onClearFilters,
  onCreateTask,
}: EmptyTaskStateProps) {
  return (
    <motion.div
      data-ocid="tasks.empty_state"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl gradient-primary opacity-15 absolute inset-0 blur-xl" />
        <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center relative shadow-elevated">
          {hasFilters ? (
            <SearchX className="w-10 h-10 text-primary" />
          ) : (
            <ClipboardList className="w-10 h-10 text-primary" />
          )}
        </div>
      </div>

      {/* Headline */}
      <h2 className="text-xl font-display font-bold gradient-text mb-2">
        {hasFilters ? "No matching tasks" : "You're all clear!"}
      </h2>

      {/* Subtext */}
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-8">
        {hasFilters
          ? "No tasks match your current filters or search. Try adjusting your criteria."
          : "You don't have any tasks yet. Create your first task to get started on your productivity journey."}
      </p>

      {/* CTA */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {hasFilters ? (
          <>
            <Button
              data-ocid="tasks.empty_state.clear_filters"
              onClick={onClearFilters}
              className="w-full gradient-primary text-white border-0 shadow-glow"
            >
              Clear Filters
            </Button>
            <Button
              data-ocid="tasks.empty_state.create_button"
              variant="outline"
              onClick={onCreateTask}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Task
            </Button>
          </>
        ) : (
          <Button
            data-ocid="tasks.empty_state.create_button"
            onClick={onCreateTask}
            className="w-full gradient-primary text-white border-0 shadow-glow gap-2"
          >
            <Plus className="w-4 h-4" />
            Create First Task
          </Button>
        )}
      </div>
    </motion.div>
  );
}
