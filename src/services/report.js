import { get, post, put } from "./api";

export const reports = {
  create: (data) => post("/report", data, { error: "Impossible d'envoyer votre signalement." }),
  mine: () => get("/report/mine", { error: "Impossible de charger vos signalements." }),
  getAll: (status) => get("/report", { params: status ? { status } : {}, error: "Impossible de charger les signalements." }),
  validate: (id) => put(`/report/${id}/validate`, null, { error: "Impossible de valider ce signalement." }),
  reject: (id, reason) => put(`/report/${id}/reject`, { reason }, { error: "Impossible de rejeter ce signalement." }),
  resolve: (id) => put(`/report/${id}/resolve`, null, { error: "Impossible de clôturer ce signalement." }),
};
