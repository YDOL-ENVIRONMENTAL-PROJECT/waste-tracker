import { get, post, put } from "./api";

export const collectionRequests = {
  create: (data) => post("/collection-request", data, { error: "Impossible d'envoyer votre demande." }),
  mine: () => get("/collection-request/mine", { error: "Impossible de charger vos demandes." }),
  cancel: (id) => put(`/collection-request/${id}/cancel`, null, { error: "Impossible d'annuler cette demande." }),
  getAll: (status) => get("/collection-request", { params: status ? { status } : {}, error: "Impossible de charger les demandes." }),
  reject: (id, reason) => put(`/collection-request/${id}/reject`, { reason }, { error: "Impossible de refuser cette demande." }),
};
