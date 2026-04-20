import { useMatchRoute, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  CheckSquare,
  LayoutDashboard,
  Plus,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  {
    icon: LayoutDashboard,
    label: "Home",
    path: "/dashboard",
    ocid: "nav_dashboard",
    isAction: false,
  },
  {
    icon: CheckSquare,
    label: "Tasks",
    path: "/tasks",
    ocid: "nav_tasks",
    isAction: false,
  },
  {
    icon: Plus,
    label: "Add",
    path: "/tasks/create",
    ocid: "nav_add",
    isAction: true,
  },
  {
    icon: BarChart3,
    label: "Stats",
    path: "/productivity",
    ocid: "nav_productivity",
    isAction: false,
  },
  {
    icon: User,
    label: "Profile",
    path: "/profile",
    ocid: "nav_profile",
    isAction: false,
  },
] as const;

export function BottomNav() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-border/30 safe-bottom"
      data-ocid="bottom_nav"
    >
      <div className="flex items-center justify-around px-2 h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = !!matchRoute({ to: item.path, fuzzy: false });
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate({ to: item.path })}
                className="flex flex-col items-center justify-center -mt-6"
                data-ocid={item.ocid}
                aria-label={item.label}
              >
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow transition-smooth active:scale-95">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate({ to: item.path })}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition-fast ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={item.ocid}
              aria-label={item.label}
            >
              <div
                className={`p-1.5 rounded-xl transition-fast ${isActive ? "bg-primary/15" : ""}`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span
                className={`text-[10px] font-medium leading-none ${isActive ? "font-semibold" : ""}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
