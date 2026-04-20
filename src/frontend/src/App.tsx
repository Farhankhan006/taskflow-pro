import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ProductivityPage from "./pages/ProductivityPage";
import ProfilePage from "./pages/ProfilePage";
import { CreateTaskPage, EditTaskPage } from "./pages/TaskFormPage";
import TasksPage from "./pages/TasksPage";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        </div>
        <p className="text-muted-foreground text-sm">Loading TaskFlow Pro…</p>
      </div>
    </div>
  );
}

// ─── Auth guards ──────────────────────────────────────────────────────────────
// Guards live in component bodies and use useEffect + useNavigate so that
// navigation only fires after React has fully committed the render and auth
// state has settled. Using `throw redirect()` inside a component body (not
// beforeLoad) races against async state updates and leaks a raw 307 Response.

function ProtectedLayout() {
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  // While initializing, or while we're about to redirect, show the loader
  if (isInitializing) return <LoadingScreen />;
  if (!isAuthenticated) return <LoadingScreen />;

  return <Outlet />;
}

function PublicLayout() {
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  // While initializing, or while we're about to redirect authenticated users
  if (isInitializing) return <LoadingScreen />;
  if (isAuthenticated) return <LoadingScreen />;

  return <Outlet />;
}

// ─── Route tree ───────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: Outlet,
});

// Public routes
const publicRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public",
  component: PublicLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: "/login",
  component: LoginPage,
});

// Protected routes
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  component: ProtectedLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const tasksRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/tasks",
  component: TasksPage,
});

const tasksCreateRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/tasks/new",
  component: CreateTaskPage,
});

const tasksCreateLegacyRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/tasks/create",
  component: CreateTaskPage,
});

const tasksEditRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/tasks/$taskId/edit",
  component: EditTaskPage,
});

const productivityRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/productivity",
  component: ProductivityPage,
});

const profileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/profile",
  component: ProfilePage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  component: () => null,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  publicRoute.addChildren([loginRoute]),
  protectedRoute.addChildren([
    dashboardRoute,
    tasksRoute,
    tasksCreateRoute,
    tasksCreateLegacyRoute,
    tasksEditRoute,
    productivityRoute,
    profileRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return <RouterProvider router={router} />;
}
