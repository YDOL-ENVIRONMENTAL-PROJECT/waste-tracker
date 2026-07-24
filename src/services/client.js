import { apiClient, fail } from "./api";

export const clients = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/client");
      return { success: true, data: response.data };
    } catch (error) {
      return fail("clients.getAll", error, "Impossible de charger la liste des clients.");
    }
  },

  getCount: async () => {
    try {
      const response = await apiClient.get("/client/count");
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "clients.getCount",
        error,
        "Impossible de récupérer le nombre de clients."
      );
    }
  },

  archive: async (id) => {
    try {
      const response = await apiClient.put(`/client/${id}/archive`);
      console.info("[clients.archive] success", { id });
      return { success: true, data: response.data };
    } catch (error) {
      return fail(
        "clients.archive",
        error,
        "Impossible de retirer ce client. Réessayez plus tard."
      );
    }
  },
};
