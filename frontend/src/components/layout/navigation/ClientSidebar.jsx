"use client";

import Sidebar from "../Sidebar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MapIcon from "@mui/icons-material/Map";
import { Bell, MapPin, Truck } from "lucide-react";
import { getDisplayName } from "@/services/user";

export default function ClientSidebar({ user }) {
  const userName = getDisplayName(user);
  const menuItems = [
    {
      href: "/client/dashboard",
      label: "Tableau de bord",
      icon: <DashboardIcon style={{ fontSize: 20 }} />,
    },
    {
      href: "/client/map",
      label: "Carte",
      icon: <MapIcon style={{ fontSize: 20 }} />,
    },
    {
      href: "/client/BinLocationList",
      label: "Bacs à proximité",
      icon: <MapPin size={20} />,
    },
    {
      href: "/client/DriverList",
      label: "Chauffeurs",
      icon: <Truck size={20} />,
    },
    {
      href: "/client/notificationsCenter",
      label: "Notifications",
      icon: <Bell size={20} />,
    },
  ];

  return (
    <Sidebar
      menuItems={menuItems}
      userName={userName}
    />
  );
}