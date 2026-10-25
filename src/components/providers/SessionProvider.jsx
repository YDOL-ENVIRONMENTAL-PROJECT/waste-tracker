"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/services/auth";
import { notifications } from "@/services/notification";
import { LoadingScreen } from "@/components/ui/Loading";

const SessionContext = createContext(null);
const HEARTBEAT_INTERVAL_MS = 60_000;

export const isAdminRole = (role) => role === "ADMIN" || role === "SUPER_ADMIN";

export function homeFor(role) {
  if (isAdminRole(role)) return "/admin/dashboard";
  if (role === "CLIENT") return "/client/dashboard";
  if (role === "DRIVER") return "/driver";
  return "/connexion";
}

/** Garde d'accès de l'espace connecté : authentification, rôle, présence et compteur de notifications. */
export function SessionProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, logout, setUser } = useAuth();
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(async () => {
    const r = await notifications.unreadCount();
    if (r.success) setUnread(r.data || 0);
  }, []);

  // Redirections selon l'authentification et le rôle
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`/connexion?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    const role = user?.role;
    const wrongArea =
      (pathname.startsWith("/admin") && !isAdminRole(role)) ||
      (pathname.startsWith("/client") && role !== "CLIENT") ||
      (pathname.startsWith("/driver") && role !== "DRIVER");
    if (wrongArea) router.replace(homeFor(role));
  }, [isLoading, isAuthenticated, user, pathname, router]);

  // Présence (heartbeat) et notifications non lues
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const tick = () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      auth.heartbeat();
      refreshUnread();
    };
    tick();
    const id = setInterval(tick, HEARTBEAT_INTERVAL_MS);
    window.addEventListener("online", tick);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", tick);
    };
  }, [isAuthenticated, refreshUnread]);

  const signOut = useCallback(async () => {
    await logout();
    router.replace("/connexion");
  }, [logout, router]);

  if (isLoading || !isAuthenticated) {
    return <LoadingScreen message="Chargement de votre espace…" />;
  }

  return (
    <SessionContext.Provider value={{ user, setUser, signOut, unread, setUnread, refreshUnread, isAdmin: isAdminRole(user?.role) }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession doit être utilisé dans SessionProvider");
  return ctx;
}
