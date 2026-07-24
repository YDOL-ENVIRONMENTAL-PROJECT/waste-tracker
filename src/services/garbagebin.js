import { apiClient, fail } from "./api";

export const garbagebins = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/bin");
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "garbagebins.getAll",
        error,
        "Impossible de charger la liste des bacs."
      );
    }
  },

  getCount: async () => {
    try {
      const response = await apiClient.get("/bin/count");
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "garbagebins.getCount",
        error,
        "Impossible de récupérer le nombre de bacs."
      );
    }
  },

  create: async (binData) => {
    try {
      const response = await apiClient.post("/bin", binData);
      console.info("[garbagebins.create] success", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "garbagebins.create",
        error,
        "Impossible d'ajouter ce bac. Réessayez plus tard."
      );
    }
  },

  update: async (id, binData) => {
    try {
      const response = await apiClient.put(`/bin/${id}`, binData);
      console.info("[garbagebins.update] success", { id });
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "garbagebins.update",
        error,
        "Impossible de modifier ce bac. Réessayez plus tard."
      );
    }
  },

  archive: async (id) => {
    try {
      const response = await apiClient.put(`/bin/${id}/archive`);
      console.info("[garbagebins.archive] success", { id });
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "garbagebins.archive",
        error,
        "Impossible de retirer ce bac. Réessayez plus tard."
      );
    }
  },
};
