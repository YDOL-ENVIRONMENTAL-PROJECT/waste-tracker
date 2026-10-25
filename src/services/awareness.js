import { get, post, put } from "./api";

export const awareness = {
  today: () => get("/awareness/today", { error: "Impossible de charger la capsule du jour." }),
  library: () => get("/awareness/library", { error: "Impossible de charger la médiathèque." }),
  getById: (id) => get(`/awareness/${id}`, { error: "Impossible de charger cette capsule." }),
  view: (id, completed, understood) =>
    post(`/awareness/${id}/view`, { completed, understood }, { error: "Impossible d'enregistrer votre lecture." }),
  getAll: () => get("/awareness", { error: "Impossible de charger les capsules." }),
  stats: () => get("/awareness/stats", { error: "Impossible de charger les statistiques." }),
  create: (data) => post("/awareness", data, { error: "Impossible d'enregistrer cette capsule." }),
  update: (id, data) => put(`/awareness/${id}`, data, { error: "Impossible de modifier cette capsule." }),
  archive: (id) => put(`/awareness/${id}/archive`, null, { error: "Impossible d'archiver cette capsule." }),
};
