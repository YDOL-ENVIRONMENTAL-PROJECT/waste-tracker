import { get, post, put } from "./api";

export const admins = {
  getAll: () => get("/admin", { error: "Impossible de charger la liste des administrateurs." }),
  getCount: () => get("/admin/count", { error: "Impossible de récupérer le nombre d'administrateurs." }),
  create: (data) => post("/admin", data, { error: "Impossible d'ajouter cet administrateur. Réessayez plus tard." }),
  archive: (id) => put(`/admin/${id}/archive`, null, { error: "Impossible de retirer cet administrateur." }),
  restore: (id) => put(`/admin/${id}/restore`, null, { error: "Impossible de restaurer cet administrateur." }),
};
