import { get } from "./api";

export const dashboard = {
  admin: () => get("/dashboard/admin", { error: "Impossible de charger le tableau de bord." }),
  client: () => get("/dashboard/client", { error: "Impossible de charger votre tableau de bord." }),
};
