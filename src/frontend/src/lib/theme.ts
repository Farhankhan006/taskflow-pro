// ─── Theme Management ─────────────────────────────────────────────────────────

export type Theme = "light" | "dark";

const THEME_KEY = "taskflow-theme";

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    // Default to dark for premium feel
    return "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme: Theme): void {
  const html = document.documentElement;
  if (theme === "dark") {
    html.classList.add("dark");
    html.classList.remove("light");
  } else {
    html.classList.remove("dark");
    html.classList.add("light");
  }
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore storage errors
  }
}

export function toggleTheme(current: Theme): Theme {
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

// Apply theme immediately on module load to prevent flash
applyTheme(getStoredTheme());
