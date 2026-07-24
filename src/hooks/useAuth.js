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
        const profileResult = await fetchCurrentUserProfile();
        if (profileResult.success) {
          const mergedUser = { ...currentUser, ...profileResult.data };
          setUser(mergedUser);
          setIsAuthenticated(true);

          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(mergedUser));
          }
        } else {
          console.error("[useAuth.loadUser]", profileResult.technical || profileResult.error);
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("[useAuth.loadUser]", error);
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
        const profileResult = await fetchCurrentUserProfile();
        const mergedUser = profileResult.success
          ? { ...result.data, ...profileResult.data }
          : result.data;
        setUser(mergedUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(mergedUser));
        }
      } catch (error) {
        console.error("[useAuth.login]", error);
        setUser(result.data);
      }
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = async () => {
    await auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData) => {
    const result = await auth.register(userData);
    if (result.success) {
      try {
        const profileResult = await fetchCurrentUserProfile();
        const mergedUser = profileResult.success
          ? { ...result.data, ...profileResult.data }
          : result.data;
        setUser(mergedUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(mergedUser));
        }
      } catch (error) {
        console.error("[useAuth.register]", error);
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
