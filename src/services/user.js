import { apiClient, getErrorMessage } from "./api";
import { auth } from "./auth";

// --- Utilitaires de Normalisation et Formatage (Inchangés) ---

function normalizeProfile(profile, authUser) {
  if (!profile) return authUser;
  const userRole = profile.userRole || authUser?.role;
  return {
    id: profile.id,
    userRole,
    accountType: profile.accountType,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    town: profile.town,
    quarter: profile.quarter,
    site: profile.site,
    type: profile.type,
    role: profile.role || userRole,
    profilePicture: profile.profilePicture,
  };
}

function normalizeAdmin(admin, authUser) {
  return normalizeProfile(
    {
      id: admin.id,
      userRole: authUser?.role,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phone,
      site: admin.site,
      role: admin.role,
      profilePicture: admin.profilePicture,
    },
    authUser
  );
}

export function getDisplayName(user) {
  const currentUser = user.data;
  if (!currentUser) return "Utilisateur";
  if (currentUser.firstName || currentUser.lastName) {
    return `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();
  }
  if (user.name) {
    return `${currentUser.name}`.trim();
  }
  return currentUser.email?.split("@")[0] || "Utilisateur";
}

export function getInitials(user) {
  const currentUser = user.data;
  const first = currentUser?.firstName || currentUser?.name || "";
  const last = currentUser?.lastName || "";
  if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  if (first) return first.charAt(0).toUpperCase();
  return "U";
}

// --- Appels API Re-configurés au format standardisé ---

export async function fetchCurrentUserProfile() {
  try {
    const authUser = auth.getCurrentUser();
    if (!authUser?.email || !authUser?.role) {
      return { success: false, error: "Aucun utilisateur authentifié trouvé localement" };
    }

    const response = await apiClient.get("/auth/profile");
    const normalized = normalizeProfile(response.data, authUser);
    return { success: true, data: normalized };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, "Impossible de récupérer le profil") };
  }
}

export async function updateProfile(data) {
  try {
    const response = await apiClient.put("/auth/profile", data);
    const authUser = auth.getCurrentUser();
    const normalized = normalizeProfile(response.data, authUser);
    return { success: true, data: normalized };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, "Erreur lors de la mise à jour du profil") };
  }
}

export async function updateAdminProfile(id, data) {
  try {
    const response = await apiClient.put(`/admin/${id}`, data);
    const authUser = auth.getCurrentUser();
    const normalized = normalizeAdmin(response.data, authUser);
    return { success: true, data: normalized };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, "Erreur lors de la mise à jour du profil administrateur") };
  }
}