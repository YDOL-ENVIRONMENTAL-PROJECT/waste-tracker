import { apiClient, getErrorMessage } from "./api";

export const clients = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/client");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de la récupération des clients") };
    }
  },

  getCount: async () => {
    try {
      const response = await apiClient.get("/client/count");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de la récupération du nombre de clients.") };
    }
  },

  archive: async (id) => {
    try {
      const response = await apiClient.put(`/client/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de l'archivage d'un client.") };
    }
  },
};