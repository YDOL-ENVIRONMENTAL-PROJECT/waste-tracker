import { del, get, post, put } from "./api";

export const products = {
  getAll: (includeArchived = false) =>
    get("/product", { params: { includeArchived }, error: "Impossible de charger les produits." }),
  getById: (id) => get(`/product/${id}`, { error: "Impossible de charger ce produit." }),
  create: (data) => post("/product", data, { error: "Impossible d'ajouter ce produit." }),
  update: (id, data) => put(`/product/${id}`, data, { error: "Impossible de modifier ce produit." }),
  approve: (id) => put(`/product/${id}/approve`, null, { error: "Impossible de valider ce produit." }),
  remove: (id) => del(`/product/${id}`, { error: "Impossible de supprimer ce produit." }),
  archive: (id) => put(`/product/${id}/archive`, null, { error: "Impossible d'archiver ce produit." }),
};
