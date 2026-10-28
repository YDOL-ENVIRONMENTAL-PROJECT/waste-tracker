import { get, post } from "./api";

export const premium = {
  me: () => get("/premium/me", { error: "Impossible de charger votre statut premium." }),
  activate: (operator, phone) => post("/premium/activate", { operator, phone }, { error: "Le paiement n'a pas pu être effectué. Réessayez." }),
  activations: () => get("/premium/activations", { error: "Impossible de charger les activations premium." }),
};
