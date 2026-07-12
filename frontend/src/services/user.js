import { auth } from "@/services/auth";

const BASE_URL = "http://localhost:8080/api";

async function apiGet(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: auth.getAuthHeaders(),
  });

  if (response.status === 401) {
    auth.logout();
    throw new Error("Session expirée");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Une erreur est survenue");
  }

  return response.json();
}

async function apiPut(endpoint, body) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: auth.getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    auth.logout();
    throw new Error("Session expirée");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Une erreur est survenue");
  }

  return response.json();
}

function normalizeProfile(profile, authUser) {
  if (!profile) return authUser;

  const userRole = profile.userRole || authUser?.role;

  return {
    id: profile.id,
    userRole,
    accountType: profile.accountType,
    firstName: profile.firstName,
    lastName: profile.lastName,
    name: profile.name,
    surname: profile.lastName,
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
  if (!user) return "Utilisateur";

  if (user.firstName || user.lastName) {
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }

  if (user.name) {
    return `${user.name} ${user.surname || ""}`.trim();
  }

  return user.email?.split("@")[0] || "Utilisateur";
}

export function getInitials(user) {
  const first = user?.firstName || user?.name || "";
  const last = user?.lastName || user?.surname || "";

  if (first && last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }

  if (first) {
    return first.charAt(0).toUpperCase();
  }

  return "U";
}

export async function fetchCurrentUserProfile() {
  const authUser = auth.getCurrentUser();
  if (!authUser?.email || !authUser?.role) {
    return null;
  }

  const profile = await apiGet("/auth/profile");
  return normalizeProfile(profile, authUser);
}

export async function updateProfile(data) {
  const updated = await apiPut("/auth/profile", data);
  const authUser = auth.getCurrentUser();
  return normalizeProfile(updated, authUser);
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

export async function updateAdminProfile(id, data) {
  const updated = await apiPut(`/admins/${id}`, data);
  const authUser = auth.getCurrentUser();
  return normalizeAdmin(updated, authUser);
}
