"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Logout, NotificationsOutlined } from "@mui/icons-material";
import { Search, ChevronRight } from "lucide-react";
import { auth } from "@/services/auth";
import { getDisplayName, getInitials } from "@/services/user";

export default function Header({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const pageTitles = {
    "/admin/dashboard": "Tableau de bord",
    "/admin/map": "Carte",
    "/admin/driverList": "Chauffeurs",
    "/admin/addDriver": "Ajouter un chauffeur",
    "/admin/missionList": "Missions",
    "/admin/newMission": "Nouvelle mission",
    "/admin/garbageBinList": "Bacs à ordures",
    "/admin/addGarbageBin": "Ajouter un bac",
    "/admin/vehicleList": "Véhicules",
    "/admin/addVehicle": "Ajouter un véhicule",
    "/admin/productList": "Produits",
    "/admin/addProduct": "Ajouter un produit",
    "/admin/productDetails": "Détails du produit",
    "/admin/clientList": "Clients",
    "/admin/adminList": "Administrateurs",
    "/admin/addAdmin": "Ajouter un administrateur",
    "/admin/profile": "Mon profil",
    "/admin/notificationCenter": "Notifications",
    "/forgottenPassword": "Mot de passe",
    "/client/dashboard": "Mon tableau de bord",
    "/client/profile": "Mon profil",
    "/client/map": "Carte",
    "/client/notificationsCenter": "Notifications",
  };

  const title = pageTitles[pathname] || "Waste Tracker";

  // Build breadcrumb
  const parts = pathname.split("/").filter(Boolean);
  const section = parts[0] === "admin" ? "Administration" : parts[0] === "client" ? "Espace client" : "";

  const roleLabel =
    user?.role === "SUPER_ADMIN"
      ? "Super Admin"
      : user?.role === "ADMIN"
        ? "Admin"
        : user?.role === "DRIVER"
          ? "Chauffeur"
          : "Client";

  const displayName = getDisplayName(user);
  const initials = getInitials(user);
  const profileHref = pathname.startsWith("/client") ? "/client/profile" : "/admin/profile";

  return (
    <header className="flex justify-between items-center h-16 px-6 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      {/* Left: Breadcrumb + Title */}
      <div className="flex items-center gap-2">
        {section && (
          <>
            <span className="hidden sm:inline text-xs text-gray-400 font-medium uppercase tracking-wide">
              {section}
            </span>
            <ChevronRight size={14} className="text-gray-300" />
          </>
        )}
        <h1 className="text-sm font-semibold text-gray-800">{title}</h1>
      </div>

      {/* Right: Search + Notification + User */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-400 w-56 hover:bg-gray-50 transition cursor-pointer border border-transparent hover:border-gray-200">
          <Search size={15} />
          <span>Rechercher...</span>
          <kbd className="ml-auto text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-400">⌘K</kbd>
        </div>

        {/* Notifications */}
        <Link
          href={pathname.startsWith("/client") ? "/client/notificationsCenter" : "/admin/notificationCenter"}
          className="relative p-2 rounded-xl hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
        >
          <NotificationsOutlined style={{ fontSize: 20 }} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </Link>

        {/* Separator */}
        <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

        {/* User */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-700 leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-gray-400">{roleLabel}</p>
            </div>
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-green-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
  {user?.profilePicture ? (
    <img
      src={user.profilePicture}
      alt={displayName}
      className="w-full h-full object-cover"
    />
  ) : (
    initials
  )}
</div>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-slide-down">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">
                  {displayName}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <Link
                href={profileHref}
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Mon profil
              </Link>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  auth.logout();
                  router.push("/connexion");
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition w-full text-left"
              >
                <Logout style={{ fontSize: 16 }} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}