import axios from "axios";
import { logTechnical } from "@/lib/notify";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      // Don't redirect during login/logout/heartbeat — let the caller handle it
      const isAuthAttempt =
        url.includes("/auth/login") ||
        url.includes("/auth/logout") ||
        url.includes("/auth/heartbeat");

      if (!isAuthAttempt && typeof window !== "undefined") {
        logTechnical("session.expired", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/connexion";
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

/**
 * Builds a technical snapshot from an Axios (or other) error for console debugging.
 */
export function getTechnicalError(error) {
  if (!error) return null;
  return {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method,
  };
}

/**
 * Prefer a clear user message. Never expose backend/technical text to the UI.
 * Logs the full technical payload to the console.
 */
export function fail(context, error, userMessage) {
  let sanitizedError = error;
  if (!error || (typeof error === "object" && Object.keys(error).length === 0)) {
    sanitizedError = new Error(`Échec de la requête détecté dans le contexte : ${context} (Erreur d'origine vide ou inconnue)`);
  }
  logTechnical(context, sanitizedError);
  return {
    success: false,
    error: userMessage || "Une erreur réseau ou serveur est survenue.",
    technical: getTechnicalError(error),
  };
}

/** @deprecated Prefer fail() — kept for gradual migration */
export const getErrorMessage = (error, defaultMessage = "Une erreur est survenue") => {
  let sanitizedError = error;
  if (!error || (typeof error === "object" && Object.keys(error).length === 0)) {
    sanitizedError = new Error("Erreur inconnue ou objet vide détecté");
  }
  logTechnical("getErrorMessage", sanitizedError);
  return defaultMessage;
};
