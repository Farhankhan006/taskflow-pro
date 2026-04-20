import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun, Zap } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "./Layout";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  displayName?: string;
}

export function AppHeader({
  title = "TaskFlow Pro",
  displayName,
}: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-50 glass-dark border-b border-border/30"
      data-ocid="app_header"
    >
      <div className="flex items-center justify-between px-4 h-14 safe-top">
        {/* Logo + Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-base text-foreground tracking-tight">
              {title}
            </span>
            {displayName && (
              <p className="text-xs text-muted-foreground leading-none mt-0.5 truncate max-w-[120px]">
                {displayName}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl transition-fast hover:bg-muted/50"
            aria-label="Toggle theme"
            data-ocid="theme_toggle"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              toast.info("No new notifications", { duration: 3000 })
            }
            className="h-9 w-9 rounded-xl relative transition-fast hover:bg-muted/50"
            aria-label="Notifications"
            data-ocid="notifications_button"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-background" />
          </Button>
        </div>
      </div>
    </header>
  );
}
