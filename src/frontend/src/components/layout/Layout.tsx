import { Toaster } from "@/components/ui/sonner";
import { type ReactNode, createContext, useContext, useState } from "react";
import {
  type Theme,
  toggleTheme as doToggleTheme,
  getStoredTheme,
} from "../../lib/theme";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";

// ─── Theme Context ────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

// ─── Layout ───────────────────────────────────────────────────────────────────

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showHeader?: boolean;
  displayName?: string;
  title?: string;
}

export function Layout({
  children,
  showNav = true,
  showHeader = true,
  displayName,
  title,
}: LayoutProps) {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  const toggleTheme = () => {
    const next = doToggleTheme(theme);
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
        {showHeader && <AppHeader title={title} displayName={displayName} />}
        <main
          className={`flex-1 overflow-y-auto scrollbar-hide ${showNav ? "pb-24" : ""}`}
          data-ocid="main_content"
        >
          {children}
        </main>
        {showNav && <BottomNav />}
        <Toaster position="top-center" richColors />
      </div>
    </ThemeContext.Provider>
  );
}
