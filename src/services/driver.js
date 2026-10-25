import { del, get, post, put } from "./api";

export const drivers = {
  getAll: () => get("/driver", { error: "Impossible de charger la liste des chauffeurs." }),
  getCount: () => get("/driver/count", { error: "Impossible de récupérer le nombre de chauffeurs." }),
  getById: (id) => get(`/driver/${id}`, { error: "Impossible de charger ce chauffeur." }),
  create: (data) => post("/driver", data, { error: "Impossible d'ajouter ce chauffeur. Réessayez plus tard." }),
  update: (id, data) => put(`/driver/${id}`, data, { error: "Impossible de modifier ce chauffeur." }),
  importMany: (rows) => post("/driver/import", rows, { error: "Import impossible." }),
  resendActivation: (id) => post(`/driver/${id}/resend-activation`, null, { error: "Impossible de renvoyer le lien d'activation." }),
  remove: (id) => del(`/driver/${id}`, { error: "Impossible de supprimer ce compte." }),
  archive: (id) => put(`/driver/${id}/archive`, null, { error: "Impossible de retirer ce chauffeur." }),
  restore: (id) => put(`/driver/${id}/restore`, null, { error: "Impossible de restaurer ce chauffeur." }),
};
