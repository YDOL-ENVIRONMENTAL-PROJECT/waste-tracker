import { apiClient, fail } from "./api";

export const vehicles = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/vehicle");
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "vehicles.getAll",
        error,
        "Impossible de charger la liste des véhicules."
      );
    }
  },

  getCount: async () => {
    try {
      const response = await apiClient.get("/vehicle/count");
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "vehicles.getCount",
        error,
        "Impossible de récupérer le nombre de véhicules."
      );
    }
  },

  create: async (vehicleData) => {
    try {
      const response = await apiClient.post("/vehicle", vehicleData);
      console.info("[vehicles.create] success", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "vehicles.create",
        error,
        "Impossible d'ajouter ce véhicule. Réessayez plus tard."
      );
    }
  },

  update: async (id, vehicleData) => {
    try {
      const response = await apiClient.put(`/vehicle/${id}`, vehicleData);
      console.info("[vehicles.update] success", { id });
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "vehicles.update",
        error,
        "Impossible de modifier ce véhicule. Réessayez plus tard."
      );
    }
  },

  archive: async (id) => {
    try {
      const response = await apiClient.put(`/vehicle/${id}/archive`);
      console.info("[vehicles.archive] success", { id });
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "vehicles.archive",
        error,
        "Impossible de retirer ce véhicule. Réessayez plus tard."
      );
    }
  },
};
