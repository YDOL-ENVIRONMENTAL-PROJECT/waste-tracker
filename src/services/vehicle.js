import { apiClient, getErrorMessage } from "./api";

export const vehicles = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/vehicle");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de la récupération des véhicules") };
    }
  },

  getCount: async () => {
    try {
      const response = await apiClient.get("/vehicle/count");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de la récupération du nombre de véhicules") };
    }
  },

  create: async (vehicleData) => {
    try {
      const response = await apiClient.post("/vehicle", vehicleData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de l'ajout du véhicule") };
    }
  },

  update: async (id, vehicleData) => {
    try {
      const response = await apiClient.put(`/vehicle/${id}`, vehicleData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de la mise à jour du véhicule") };
    }
  },

  archive: async (id) => {
    try {
      const response = await apiClient.put(`/vehicle/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de l'archivage du véhicule") };
    }
  },
};