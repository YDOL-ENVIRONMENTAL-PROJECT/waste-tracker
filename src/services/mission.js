import { apiClient, getErrorMessage } from "./api";

export const missions = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/mission");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de la récupération des missions.") };
    }
  },

  getCount: async () => {
    try {
      const response = await apiClient.get("/mission/count");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de la récupération du nombre de missions.") };
    }
  },

  create: async (missionData) => {
    try {
      const response = await apiClient.post("/mission", missionData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de l'ajout d'une mission.") };
    }
  },

  update: async (id, missionData) => {
    try {
      const response = await apiClient.put(`/mission/${id}`, missionData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de la mise à jour de la mission.") };
    }
  },

  archive: async (id) => {
    try {
      const response = await apiClient.put(`/mission/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, "Erreur lors de l'archivage de la mission.") };
    }
  },
};