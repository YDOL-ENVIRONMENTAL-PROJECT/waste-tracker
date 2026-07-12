import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/services/auth";
import { fetchCurrentUserProfile } from "@/services/user";

/**
 * Hook to manage authentication state
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const token = auth.getToken();
      const currentUser = auth.getCurrentUser();

      if (!token || !currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await fetchCurrentUserProfile();
        const mergedUser = { ...currentUser, ...profile };
        setUser(mergedUser);
        setIsAuthenticated(true);

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(mergedUser));
        }
      } catch {
        setUser(currentUser);
        setIsAuthenticated(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const result = await auth.login(email, password);
    if (result.success) {
      try {
        const profile = await fetchCurrentUserProfile();
        const mergedUser = { ...result.data, ...profile };
        setUser(mergedUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(mergedUser));
        }
      } catch {
        setUser(result.data);
      }
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData) => {
    const result = await auth.register(userData);
    if (result.success) {
      try {
        const profile = await fetchCurrentUserProfile();
        const mergedUser = { ...result.data, ...profile };
        setUser(mergedUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(mergedUser));
        }
      } catch {
        setUser(result.data);
      }
      setIsAuthenticated(true);
    }
    return result;
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
  };
}

/**
 * Hook to protect routes - redirects to login if not authenticated
 * @param {string[]} allowedRoles - Array of roles that are allowed to access the page
 */
export function useProtectedRoute(allowedRoles = []) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/connexion?redirect=${pathname}`);
      return;
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      router.push("/");
      return;
    }
  }, [isAuthenticated, isLoading, user, router, pathname, allowedRoles]);

  return { user, isLoading, isAuthenticated };
}
