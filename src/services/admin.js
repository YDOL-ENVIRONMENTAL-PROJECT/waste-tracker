import { apiClient, fail } from "./api";

export const admins = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/admin");
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "admins.getAll",
        error,
        "Impossible de charger la liste des administrateurs."
      );
    }
  },

  getCount: async () => {
    try {
      const response = await apiClient.get("/admin/count");
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "admins.getCount",
        error,
        "Impossible de récupérer le nombre d'administrateurs."
      );
    }
  },

  create: async (adminData) => {
    try {
      const response = await apiClient.post("/admin", adminData);
      console.info("[admins.create] success", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "admins.create",
        error,
        "Impossible d'ajouter cet administrateur. Réessayez plus tard."
      );
    }
  },

  archive: async (id) => {
    try {
      const response = await apiClient.put(`/admin/${id}/archive`);
      console.info("[admins.archive] success", { id });
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "admins.archive",
        error,
        "Impossible de retirer cet administrateur. Réessayez plus tard."
      );
    }
  },
};
