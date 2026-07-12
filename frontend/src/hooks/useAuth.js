import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/services/auth";

/**
 * Hook to manage authentication state
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = auth.getToken();
    const currentUser = auth.getCurrentUser();

    if (token && currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const result = await auth.login(email, password);
    if (result.success) {
      setUser(result.data);
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
      setUser(result.data);
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
