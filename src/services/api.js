import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Création de l'instance unique partagée
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour injecter automatiquement le token Bearer
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse pour gérer la déconnexion automatique sur erreur 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/connexion";
      }
      return Promise.reject(new Error("Session expirée"));
    }
    return Promise.reject(error);
  }
);

/**
 * Helper générique pour formater les messages d'erreur d'Axios
 */
export const getErrorMessage = (error, defaultMessage = "Une erreur est survenue") => {
  return error.response?.data?.message || error.message || defaultMessage;
};