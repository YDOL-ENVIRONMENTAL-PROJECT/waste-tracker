import { apiClient, fail } from "./api";

export const missions = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/mission");
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "missions.getAll",
        error,
        "Impossible de charger la liste des missions."
      );
    }
  },

  getCount: async () => {
    try {
      const response = await apiClient.get("/mission/count");
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "missions.getCount",
        error,
        "Impossible de récupérer le nombre de missions."
      );
    }
  },

  create: async (missionData) => {
    try {
      const response = await apiClient.post("/mission", missionData);
      console.info("[missions.create] success", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "missions.create",
        error,
        "Impossible de créer cette mission. Réessayez plus tard."
      );
    }
  },

  update: async (id, missionData) => {
    try {
      const response = await apiClient.put(`/mission/${id}`, missionData);
      console.info("[missions.update] success", { id });
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "missions.update",
        error,
        "Impossible de modifier cette mission. Réessayez plus tard."
      );
    }
  },

  archive: async (id) => {
    try {
      const response = await apiClient.put(`/mission/${id}/archive`);
      console.info("[missions.archive] success", { id });
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "missions.archive",
        error,
        "Impossible de retirer cette mission. Réessayez plus tard."
      );
    }
  },
};
