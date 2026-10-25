import { get, post, put } from "./api";

export const orders = {
  create: (data) => post("/order", data, { error: "Impossible d'enregistrer votre commande." }),
  mine: () => get("/order/mine", { error: "Impossible de charger vos commandes." }),
  cancelMine: (id) => put(`/order/${id}/cancel`, null, { error: "Impossible d'annuler cette commande." }),
  getAll: (status) => get("/order", { params: status ? { status } : {}, error: "Impossible de charger les commandes." }),
  setStatus: (id, status, reason) =>
    put(`/order/${id}/status`, { status, reason }, { error: "Impossible de mettre à jour cette commande." }),
  markPaid: (id) => put(`/order/${id}/paid`, null, { error: "Impossible d'enregistrer le paiement." }),
};
