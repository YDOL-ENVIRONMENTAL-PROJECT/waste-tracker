import { del, get, post, put } from "./api";

export const vehicles = {
  getAll: () => get("/vehicle", { error: "Impossible de charger la liste des véhicules." }),
  getCount: () => get("/vehicle/count", { error: "Impossible de récupérer le nombre de véhicules." }),
  nearby: (lat, lon, radius = 5000, availableOnly = true) =>
    get("/vehicle/nearby", { params: { lat, lon, radius, availableOnly }, error: "Impossible de trouver les véhicules proches." }),
  create: (data) => post("/vehicle", data, { error: "Impossible d'ajouter ce véhicule. Réessayez plus tard." }),
  update: (id, data) => put(`/vehicle/${id}`, data, { error: "Impossible de modifier ce véhicule." }),
  setStatus: (id, status) =>
    put(`/vehicle/${id}/status`, null, { params: { status }, error: "Impossible de changer le statut." }),
  releaseDevice: (id) => put(`/vehicle/${id}/release-device`, null, { error: "Impossible de dissocier ce téléphone." }),
  importMany: (rows, saveAsDraft) => post("/vehicle/import", { rows, saveAsDraft }, { error: "Import impossible." }),
  approve: (id) => put(`/vehicle/${id}/approve`, null, { error: "Impossible de valider ce véhicule." }),
  remove: (id) => del(`/vehicle/${id}`, { error: "Impossible de supprimer ce véhicule." }),
  archive: (id) => put(`/vehicle/${id}/archive`, null, { error: "Impossible de retirer ce véhicule." }),
  restore: (id) => put(`/vehicle/${id}/restore`, null, { error: "Impossible de restaurer ce véhicule." }),
};
