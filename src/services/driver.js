import { apiClient, fail } from "./api";

export const drivers = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/driver");
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "drivers.getAll",
        error,
        "Impossible de charger la liste des chauffeurs."
      );
    }
  },

  getCount: async () => {
    try {
      const response = await apiClient.get("/driver/count");
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "drivers.getCount",
        error,
        "Impossible de récupérer le nombre de chauffeurs."
      );
    }
  },

  create: async (driverData) => {
    try {
      const response = await apiClient.post("/driver", driverData);
      console.info("[drivers.create] success", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "drivers.create",
        error,
        "Impossible d'ajouter ce chauffeur. Réessayez plus tard."
      );
    }
  },

  archive: async (id) => {
    try {
      const response = await apiClient.put(`/driver/${id}/archive`);
      console.info("[drivers.archive] success", { id });
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "drivers.archive",
        error,
        "Impossible de retirer ce chauffeur. Réessayez plus tard."
      );
    }
  },
};
