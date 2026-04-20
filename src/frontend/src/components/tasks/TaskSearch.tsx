import { Search, X } from "lucide-react";
import { useCallback } from "react";
import { cn } from "../../lib/utils";

interface TaskSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TaskSearch({ value, onChange }: TaskSearchProps) {
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        data-ocid="tasks.search_input"
        value={value}
        onChange={handleInput}
        placeholder="Search tasks…"
        className={cn(
          "w-full pl-10 pr-10 py-3 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground",
          "border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
          "outline-none transition-smooth bg-transparent",
        )}
        aria-label="Search tasks"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          data-ocid="tasks.search_clear"
          className="absolute right-3.5 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-fast"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
