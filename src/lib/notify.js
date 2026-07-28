import toast from "react-hot-toast";

/**
 * Logs technical payloads for debugging — never shown to end users.
 */
export function logTechnical(context, payload) {
  if (typeof console === "undefined") return;

  if (payload instanceof Error || payload?.isAxiosError || (payload && payload === 'object')) {
    console.error(`[${context}]`, {
      message: payload.message || "Erreur inconnue ou non spécifiée",
      status: payload.response?.status,
      data: payload.response?.data,
      url: payload.config?.url,
      method: payload.config?.method,
    });
    return;
  }

  console.error(`[${context}]`, payload);
}

/**
 * User-facing notifications. Always pass simple, everyday language.
 * Optional `technical` is logged to the console only.
 */
export const notify = {
  success(message, technical) {
    if (technical !== undefined) {
      console.info(`[success] ${message}`, technical);
    }
    return toast.success(message, {
      duration: 4000,
    });
  },

  error(message, technical) {
    if (technical !== undefined) {
      logTechnical("notify.error", technical);
    }
    return toast.error(message, {
      duration: 5000,
    });
  },

  info(message, technical) {
    if (technical !== undefined) {
      console.info(`[info] ${message}`, technical);
    }
    return toast(message, {
      duration: 4000,
    });
  },

  warning(message, technical) {
    if (technical !== undefined) {
      console.warn(`[warning] ${message}`, technical);
    }
    return toast(message, {
      icon: "⚠️",
      duration: 4500,
    });
  },
};
