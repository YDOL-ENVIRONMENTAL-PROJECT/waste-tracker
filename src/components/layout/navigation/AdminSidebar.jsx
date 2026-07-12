"use client";

import Sidebar from "../Sidebar";
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import MapIcon from '@mui/icons-material/Map';
import { Bell } from "lucide-react"; 
import { RecycleIcon } from "lucide-react";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import { getDisplayName } from "@/services/user";

export default function AdminSidebar({ role, user }) {
  const userName = getDisplayName(user);
  const menuItems = [
    {
      href: "/admin/dashboard",
      label: "Tableau de bord",
      icon: <DashboardIcon/>
    },
    {
      href: "/admin/map",
      label: "Carte",
      icon: <MapIcon/>
    },
    {
      label: "Gestion des chauffeurs",
      icon: <PersonIcon/>,
      isDropdown: true,
      subItems: [
        { href: "/admin/driverList", label: "Liste des chauffeurs" },
        { href: "/admin/addDriver", label: "Ajouter un chauffeur" },
        { href: "/admin/missionList", label: "Missions" },
      ]
    },
    {
      label: "Gestion des véhicules",
      icon: <LocalShippingIcon/>,
      isDropdown: true,
      subItems: [
        { href: "/admin/vehicleList", label: "Liste des véhicules" },
        { href: "/admin/addVehicle", label: "Ajouter un véhicule" },
      ]
    },
    {
      label: "Bacs à ordures",
      icon: <RecycleIcon/>,
      isDropdown: true,
      subItems: [
        { href: "/admin/garbageBinList", label: "Liste des bacs à ordures" },
        { href: "/admin/addGarbageBin", label: "Ajouter un bac à ordures" },
      ]
    },
    {
      label: "Gestion des produits",
      icon: <InventoryIcon/>,
      isDropdown: true,
      subItems: [
        { href: "/admin/productList", label: "Liste des produits" },
        { href: "/admin/addProduct", label: "Ajouter un produit" },
      ]
    },
    {
      href: "/admin/clientList",
      label: "Clients",
      icon: <PeopleIcon/>
    },
    role === "SUPER_ADMIN"
      ? {
          label: "Administrateurs",
          icon: <AdminPanelSettings/>,
          isDropdown: true,
          subItems: [
            { href: "/admin/adminList", label: "Liste des administrateurs" },
            { href: "/admin/addAdmin", label: "Ajouter un administrateur" }
          ]
        }
      : {
          href: "/admin/adminList",
          label: "Liste des administrateurs",
          icon: <AdminPanelSettings/>
        },
    {
      href: "/admin/notificationCenter",
      label: "Centre des notifications",
      icon: <Bell/>
    },

  ];

  return (
    <Sidebar
      menuItems={menuItems}
      userName={userName}
    />
  );
}