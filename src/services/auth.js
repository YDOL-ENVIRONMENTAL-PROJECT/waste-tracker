import { apiClient, fail } from "./api";

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

      console.info("[auth.login] success", { email: normalizedData.email, role: normalizedData.role });
      return { success: true, data: normalizedData };
    } catch (error) {
      return fail(
        "auth.login",
        error,
        "Impossible de vous connecter. Vérifiez votre email et votre mot de passe."
      );
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

      console.info("[auth.register] success", { email: normalizedData.email });
      return { success: true, data: normalizedData };
    } catch (error) {
      return fail(
        "auth.register",
        error,
        "Impossible de créer votre compte pour le moment. Réessayez plus tard."
      );
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      console.info("[auth.forgotPassword] success", { email });
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "auth.forgotPassword",
        error,
        "Impossible d'envoyer le lien de réinitialisation. Réessayez plus tard."
      );
    }
  },

  resetPassword: async (token, newPassword, confirmPassword) => {
    try {
      const response = await apiClient.post("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      console.info("[auth.resetPassword] success");
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "auth.resetPassword",
        error,
        "Impossible de réinitialiser le mot de passe. Le lien est peut-être expiré."
      );
    }
  },

  updatePassword: async (data) => {
    try {
      const response = await apiClient.put("/auth/update-password", data);
      console.info("[auth.updatePassword] success");
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "auth.updatePassword",
        error,
        "Impossible de modifier le mot de passe. Vérifiez l'ancien mot de passe."
      );
    }
  },

  heartbeat: async () => {
    try {
      await apiClient.post("/auth/heartbeat");
      return { success: true };
    } catch (error) {
      return fail("auth.heartbeat", error, "Connexion interrompue.");
    }
  },

  logout: async () => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("token")) {
        await apiClient.post("/auth/logout");
        console.info("[auth.logout] success");
      }
    } catch (error) {
      console.error("[auth.logout]", error?.response?.data || error?.message || error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
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
