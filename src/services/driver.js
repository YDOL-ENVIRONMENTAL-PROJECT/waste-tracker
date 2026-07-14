import { apiClient, getErrorMessage } from "./api";

export const drivers = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/driver");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de la récupération des conducteurs") };
    }
  },

  getCount: async () => {
    try {
      const response = await apiClient.get("/driver/count");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de la récupération du nombre de conducteurs.") };
    }
  },

  create: async (driverData) => {
    try {
      const response = await apiClient.post("/driver", driverData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de l'ajout d'un conducteur.") };
    }
  },

  archive: async (id) => {
    try {
      const response = await apiClient.put(`/driver/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de l'archivage d'un conducteur.") };
    }
  },
};