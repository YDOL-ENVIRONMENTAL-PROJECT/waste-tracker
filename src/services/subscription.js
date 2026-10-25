import { get, post, put } from "./api";

export const subscriptions = {
  quote: (latitude, longitude, frequencyPerWeek) =>
    post("/subscription/quote", { latitude, longitude, frequencyPerWeek }, { error: "Impossible de calculer le prix." }),
  subscribe: (data) => post("/subscription", data, { error: "Impossible d'enregistrer votre souscription." }),
  mine: () => get("/subscription/mine", { error: "Impossible de charger votre abonnement." }),
  cancelMine: () => put("/subscription/mine/cancel", null, { error: "Impossible de résilier votre abonnement." }),
  getAll: (status) => get("/subscription", { params: status ? { status } : {}, error: "Impossible de charger les abonnements." }),
  activate: (id) => put(`/subscription/${id}/activate`, null, { error: "Impossible d'activer cet abonnement." }),
  suspend: (id, reason) => put(`/subscription/${id}/suspend`, { reason }, { error: "Impossible de suspendre cet abonnement." }),
  cancel: (id, reason) => put(`/subscription/${id}/cancel`, { reason }, { error: "Impossible de résilier cet abonnement." }),
};
