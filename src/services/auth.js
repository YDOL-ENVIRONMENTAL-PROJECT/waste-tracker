import { apiClient, getErrorMessage } from "./api";

export const auth = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const data = response.data;

      const normalizedData = {
        ...data,
        role: data.role?.replace(/^ROLE_/, ""),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("token", normalizedData.token);
        localStorage.setItem("user", JSON.stringify(normalizedData));
      }

      return { success: true, data: normalizedData };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur de connexion") };
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      const data = response.data;

      const normalizedData = {
        ...data,
        role: data.role?.replace(/^ROLE_/, ""),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("token", normalizedData.token);
        localStorage.setItem("user", JSON.stringify(normalizedData));
      }

      return { success: true, data: normalizedData };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur d'inscription") };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur de réinitialisation") };
    }
  },

  resetPassword: async (token, newPassword, confirmPassword) => {
    try {
      const response = await apiClient.post("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur de réinitialisation du mot de passe") };
    }
  },

  updatePassword: async (data) => {
    try {
      const response = await apiClient.put("/auth/update-password", data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur de mise à jour du mot de passe") };
    }
  },
  
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getToken: () => {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  },

  getCurrentUser: () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  isAuthenticated: () => {
    return typeof window !== "undefined" ? !!localStorage.getItem("token") : false;
  },

  getAuthHeaders: () => {
    const token = auth.getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  },
};