import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function useAuth() {
  const {
    login,
    clear,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    loginStatus,
    identity,
  } = useInternetIdentity();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login();
      // Explicitly navigate after login() resolves — this is more reliable
      // than relying on the router guard racing against async auth state.
      navigate({ to: "/dashboard", replace: true });
    } catch {
      // login() may reject if the user closes the II popup — ignore silently
    }
  };

  const handleLogout = () => {
    clear();
    queryClient.clear();
    navigate({ to: "/login", replace: true });
  };

  return {
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    loginStatus,
    identity,
    principal: identity?.getPrincipal() ?? null,
  };
}
