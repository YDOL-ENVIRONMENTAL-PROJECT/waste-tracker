import { apiClient, fail } from "./api";
import { auth } from "./auth";

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

export function getDisplayName(user) {
  const currentUser = user?.data || user;
  if (!currentUser) return "Utilisateur";
  if (currentUser.firstName || currentUser.lastName) {
    return `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();
  }
  if (currentUser.name) {
    return `${currentUser.name}`.trim();
  }
  return currentUser.email?.split("@")[0] || "Utilisateur";
}

export function getInitials(user) {
  const currentUser = user?.data || user;
  const first = currentUser?.firstName || currentUser?.name || "";
  const last = currentUser?.lastName || "";
  if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  if (first) return first.charAt(0).toUpperCase();
  return "U";
}

export async function fetchCurrentUserProfile() {
  try {
    const authUser = auth.getCurrentUser();
    if (!authUser?.email || !authUser?.role) {
      console.error("[user.fetchCurrentUserProfile] missing local auth user");
      return {
        success: false,
        error: "Votre session a expiré. Veuillez vous reconnecter.",
      };
    }

    const response = await apiClient.get("/auth/profile");
    const normalized = normalizeProfile(response.data, authUser);
    return { success: true, data: normalized };
  } catch (error) {
    return fail(
      "user.fetchCurrentUserProfile",
      error,
      "Impossible de charger votre profil pour le moment."
    );
  }
}

export async function updateProfile(data) {
  try {
    const response = await apiClient.put("/auth/profile", data);
    const authUser = auth.getCurrentUser();
    const normalized = normalizeProfile(response.data, authUser);
    console.info("[user.updateProfile] success", normalized);
    return { success: true, data: normalized };
  } catch (error) {
    return fail(
      "user.updateProfile",
      error,
      "Impossible d'enregistrer vos modifications. Réessayez plus tard."
    );
  }
}
