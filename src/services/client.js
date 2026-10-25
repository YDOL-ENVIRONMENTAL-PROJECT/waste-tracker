import { get, put } from "./api";

export const clients = {
  getAll: () => get("/client", { error: "Impossible de charger la liste des clients." }),
  getCount: () => get("/client/count", { error: "Impossible de récupérer le nombre de clients." }),
  getById: (id) => get(`/client/${id}`, { error: "Impossible de charger ce client." }),
  archive: (id) => put(`/client/${id}/archive`, null, { error: "Impossible de retirer ce client." }),
  restore: (id) => put(`/client/${id}/restore`, null, { error: "Impossible de restaurer ce client." }),
  updateLocation: (id, latitude, longitude) =>
    put(`/client/${id}/location`, { latitude, longitude }, { error: "Impossible d'enregistrer votre position." }),
};
