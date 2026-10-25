import { del, get, post, put } from "./api";

export const garbagebins = {
  getAll: () => get("/bin", { error: "Impossible de charger la liste des bacs." }),
  getArchived: () => get("/bin/archived", { error: "Impossible de charger les bacs archivés." }),
  getCount: () => get("/bin/count", { error: "Impossible de récupérer le nombre de bacs." }),
  getById: (id) => get(`/bin/${id}`, { error: "Impossible de charger ce bac." }),
  nearby: (lat, lon, radius = 1500) =>
    get("/bin/nearby", { params: { lat, lon, radius }, error: "Impossible de trouver les bacs à proximité." }),
  create: (data) => post("/bin", data, { error: "Impossible d'ajouter ce bac. Réessayez plus tard." }),
  update: (id, data) => put(`/bin/${id}`, data, { error: "Impossible de modifier ce bac." }),
  setStatus: (id, status) =>
    put(`/bin/${id}/status`, null, { params: { status }, error: "Impossible de changer le statut du bac." }),
  approve: (id) => put(`/bin/${id}/approve`, null, { error: "Impossible de valider ce bac." }),
  remove: (id) => del(`/bin/${id}`, { error: "Impossible de supprimer ce bac." }),
  archive: (id) => put(`/bin/${id}/archive`, null, { error: "Impossible de retirer ce bac." }),
  restore: (id) => put(`/bin/${id}/restore`, null, { error: "Impossible de restaurer ce bac." }),
};
