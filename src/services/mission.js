import { get, post, put } from "./api";

export const missions = {
  getAll: (params = {}) => get("/mission", { params, error: "Impossible de charger la liste des missions." }),
  getCount: () => get("/mission/count", { error: "Impossible de récupérer le nombre de missions." }),
  getById: (id) => get(`/mission/${id}`, { error: "Impossible de charger cette mission." }),
  create: (data) => post("/mission", data, { error: "Impossible de créer cette mission. Réessayez plus tard." }),
  update: (id, data) => put(`/mission/${id}`, data, { error: "Impossible de modifier cette mission." }),
  cancel: (id, reason) => put(`/mission/${id}/cancel`, { reason }, { error: "Impossible d'annuler cette mission." }),
};
