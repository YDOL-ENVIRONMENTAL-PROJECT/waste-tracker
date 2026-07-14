import { apiClient, getErrorMessage } from "./api";

export const garbagebins = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/bin");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de la récupération des bacs à ordures") };
    }
  },

  getCount: async () => {
    try {
      const response = await apiClient.get("/bins/count");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de la récupération du nombre de bacs à ordures") };
    }
  },

  create: async (binData) => {
    try {
      const response = await apiClient.post("/bin", binData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de l'ajout du bac à ordures") };
    }
  },

  update: async (id, binData) => {
    try {
      const response = await apiClient.put(`/bin/${id}`, binData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de la mise à jour du bac à ordures") };
    }
  },

  archive: async (id) => {
    try {
      const response = await apiClient.put(`/bin/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de l'archivage du bac à ordures.") };
    }
  },
};