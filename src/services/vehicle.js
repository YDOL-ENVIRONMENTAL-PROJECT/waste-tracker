import { get, post, put } from "./api";

export const vehicles = {
  getAll: () => get("/vehicle", { error: "Impossible de charger la liste des véhicules." }),
  getCount: () => get("/vehicle/count", { error: "Impossible de récupérer le nombre de véhicules." }),
  nearby: (lat, lon, radius = 5000, availableOnly = true) =>
    get("/vehicle/nearby", { params: { lat, lon, radius, availableOnly }, error: "Impossible de trouver les véhicules proches." }),
  create: (data) => post("/vehicle", data, { error: "Impossible d'ajouter ce véhicule. Réessayez plus tard." }),
  update: (id, data) => put(`/vehicle/${id}`, data, { error: "Impossible de modifier ce véhicule." }),
  setStatus: (id, status) =>
    put(`/vehicle/${id}/status`, null, { params: { status }, error: "Impossible de changer le statut." }),
  archive: (id) => put(`/vehicle/${id}/archive`, null, { error: "Impossible de retirer ce véhicule." }),
  restore: (id) => put(`/vehicle/${id}/restore`, null, { error: "Impossible de restaurer ce véhicule." }),
};
