import { apiClient, getErrorMessage } from "./api";

export const admins = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/admin");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de la récupération des administrateurs") };
    }
  },

  getCount: async () => {
    try {
      const response = await apiClient.get("/admin/count");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de la récupération du nombre d'administrateurs.") };
    }
  },

  create: async (adminData) => {
    try {
      const response = await apiClient.post("/admin", adminData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de l'ajout d'un administrateur.") };
    }
  },

  archive: async (id) => {
    try {
      const response = await apiClient.put(`/admin/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de l'archivage d'un administrateur.") };
    }
  },
};