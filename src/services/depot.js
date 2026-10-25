import { get, post, put } from "./api";

export const depots = {
  getAll: () => get("/depot", { error: "Impossible de charger les casernes." }),
  create: (data) => post("/depot", data, { error: "Impossible d'ajouter cette caserne." }),
  update: (id, data) => put(`/depot/${id}`, data, { error: "Impossible de modifier cette caserne." }),
  archive: (id) => put(`/depot/${id}/archive`, null, { error: "Impossible d'archiver cette caserne." }),
};
