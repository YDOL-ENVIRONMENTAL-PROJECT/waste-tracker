"use client";

import { useEffect } from "react";
import Header from "@/components/layout/Header";
import AdminSidebar from "@/components/layout/navigation/AdminSidebar";
import ClientSidebar from "@/components/layout/navigation/ClientSidebar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/services/auth";
import { LoadingScreen } from "@/components/ui/Loading";

const HEARTBEAT_INTERVAL_MS = 60_000;

export default function DashboardLayout({ children }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  // Single presence loop for the authenticated app shell
  useEffect(() => {
    if (!isAuthenticated) return;

    const sendHeartbeat = () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      auth.heartbeat();
    };

    sendHeartbeat();
    const intervalId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    const handleOnline = () => {
      auth.heartbeat();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("online", handleOnline);
    };
  }, [isAuthenticated]);

  const getSidebar = () => {
    if (!user) return null;

    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      return <AdminSidebar role={user.role} user={user} />;
    }

    return <ClientSidebar user={user} />;
  };

  if (isLoading) {
    return <LoadingScreen message="Chargement..." />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="h-screen sticky top-0 overflow-y-auto">
        {getSidebar()}
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="sticky top-0 z-10 w-full">
          <Header user={user} onLogout={logout} />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in">{children}</div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
