import axios from "axios";
import { logTechnical } from "@/lib/notify";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
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
        const redirect = encodeURIComponent(window.location.pathname);
        window.location.href = `/connexion?expired=1&redirect=${redirect}`;
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
 * Le serveur renvoie des messages métier rédigés pour l'utilisateur sur les erreurs
 * 400 / 403 / 404 / 409 (ex. « Stock insuffisant… ») : on les affiche tels quels.
 * Pour les autres erreurs (réseau, 500), on garde le message générique fourni.
 * Le détail technique est toujours journalisé dans la console.
 */
export function fail(context, error, userMessage) {
  let sanitizedError = error;
  if (!error || (typeof error === "object" && Object.keys(error).length === 0)) {
    sanitizedError = new Error(`Échec de la requête détecté dans le contexte : ${context} (Erreur d'origine vide ou inconnue)`);
  }
  logTechnical(context, sanitizedError);
  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.message;
  const businessError = [400, 403, 404, 409].includes(status) && serverMessage;
  let message = businessError ? serverMessage : userMessage || "Une erreur réseau ou serveur est survenue.";
  if (!error?.response && error?.code !== "ERR_CANCELED") {
    message = "Impossible de joindre le serveur. Vérifiez votre connexion internet.";
  }
  return {
    success: false,
    status,
    error: message,
    technical: getTechnicalError(error),
  };
}

/** Appel générique renvoyant { success, data } ou { success: false, error }. */
export async function request(method, url, { data, params, error } = {}) {
  try {
    const response = await apiClient.request({ method, url, data, params });
    return { success: true, data: response.data, status: response.status };
  } catch (e) {
    return fail(`${method.toUpperCase()} ${url}`, e, error);
  }
}

export const get = (url, opts) => request("get", url, opts);
export const post = (url, data, opts) => request("post", url, { ...opts, data });
export const put = (url, data, opts) => request("put", url, { ...opts, data });
export const del = (url, opts) => request("delete", url, opts);

/** @deprecated Prefer fail() — kept for gradual migration */
export const getErrorMessage = (error, defaultMessage = "Une erreur est survenue") => {
  let sanitizedError = error;
  if (!error || (typeof error === "object" && Object.keys(error).length === 0)) {
    sanitizedError = new Error("Erreur inconnue ou objet vide détecté");
  }
  logTechnical("getErrorMessage", sanitizedError);
  return defaultMessage;
};
