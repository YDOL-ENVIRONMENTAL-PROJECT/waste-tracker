const BASE_URL = "http://localhost:8080/api";

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const auth = {
  /**
   * Login user with email and password
   * POST /api/auth/login
   */
  login: async (email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur de connexion");
      }

      const data = await response.json();
      const normalizedData = {
        ...data,
        role: data.role?.replace(/^ROLE_/, ""),
      };

      // Store token and user info
      if (typeof window !== "undefined") {
        localStorage.setItem("token", normalizedData.token);
        localStorage.setItem("user", JSON.stringify(normalizedData));
      }

      return { success: true, data: normalizedData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Register new user
   * POST /api/auth/register
   */
  register: async (userData) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur d'inscription");
      }

      const data = await response.json();
      const normalizedData = {
        ...data,
        role: data.role?.replace(/^ROLE_/, ""),
      };

      // Store token and user info after successful registration
      if (typeof window !== "undefined") {
        localStorage.setItem("token", normalizedData.token);
        localStorage.setItem("user", JSON.stringify(normalizedData));
      }

      return { success: true, data: normalizedData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  forgotPassword: async (email) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la demande de réinitialisation"
        );
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  resetPassword: async (token, newPassword, confirmPassword) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la réinitialisation du mot de passe"
        );
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  /**
   * Get stored authentication token
   */
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("token");
    }
    return false;
  },

  /**
   * Get authorization headers for API requests
   */
  getAuthHeaders: () => {
    const token = auth.getToken();
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  },
};