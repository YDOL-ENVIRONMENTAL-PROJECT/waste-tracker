"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Plus, ArrowUp, ArrowDown, Filter, Loader2 } from "lucide-react";
import { PersonOff } from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import { drivers } from "@/services/driver"; // Adaptez le chemin d'importation exact

export default function DriverList() {
  const { user } = useAuth();
  const role = user?.role;

  // États pour les données issues de l'API
  const [driverList, setDriverList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("ville"); // "ville" ou "site"
  const [filterValue, setFilterValue] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Récupération des données réelles
  useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoading(true);
      setApiError("");

      const result = await drivers.getAll();

      // 🟢 AFFICHAGE DE LA RÉPONSE BACKEND DANS LA CONSOLE
      console.log("[Backend Response] Liste des conducteurs :", result);

      if (result.success) {
        setDriverList(result.data || []);
      } else {
        setApiError(result.error || "Impossible de charger les conducteurs.");
      }
      setIsLoading(false);
    };

    fetchDrivers();
  }, []);

  // Action d'archivage d'un conducteur
  const handleArchive = async (id, firstName, lastName) => {
    if (confirm(`Voulez-vous vraiment archiver le conducteur ${firstName} ${lastName} ?`)) {
      const result = await drivers.archive(id);
      if (result.success) {
        // Filtrer localement pour retirer le conducteur archivé de l'affichage
        setDriverList((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert(result.error || "Une erreur est survenue lors de l'archivage.");
      }
    }
  };

  // Villes et Sites uniques calculés dynamiquement sur les données réelles
  const uniqueCities = [...new Set(driverList.map((d) => d.city).filter(Boolean))];
  const uniqueSites = [...new Set(driverList.map((d) => d.site).filter(Boolean))];
  const filterOptions = filterBy === "ville" ? uniqueCities : uniqueSites;

  // Filtrage
  const filteredDrivers = driverList.filter((driver) => {
    const fullName = `${driver.firstName || ""} ${driver.lastName || ""}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase());

    const matchesFilter = filterValue === "" || 
      (filterBy === "ville" ? driver.city === filterValue : driver.site === filterValue);

    return matchesSearch && matchesFilter;
  });

  // Tri
  const sortedDrivers = [...filteredDrivers].sort((a, b) => {
    if (sortBy === "created_at") {
      const dateA = new Date(a.created_at || a.createdAt);
      const dateB = new Date(b.created_at || b.createdAt);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }

    if (sortBy === "alphabetical") {
      const nameA = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
      const nameB = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
      return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    }

    return 0;
  });

  // ÉCRAN DE CHARGEMENT
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        <p className="text-gray-500 font-medium">Chargement des conducteurs...</p>
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* RENDER DES ERREURS D'API */}
      {apiError && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {apiError}
        </div>
      )}

      {/* SEARCH + FILTERS */}
      <div className="flex gap-4 mb-6 flex-wrap items-center">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Rechercher un chauffeur"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full sm:w-64"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <Filter size={16} />
            Filtrer par:
          </span>

          <select
            value={filterBy}
            onChange={(e) => {
              setFilterBy(e.target.value);
              setFilterValue("");
            }}
            className="border rounded-lg px-3 py-2 bg-white"
          >
            <option value="ville">Ville</option>
            <option value="site">Site</option>
          </select>
        </div>

        {/* FILTRE DYNAMIQUE (Ville ou Site) */}
        <select
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="border rounded-lg px-4 py-2 bg-green-600 text-white font-medium cursor-pointer min-w-48"
          disabled={filterOptions.length === 0}
        >
          <option value="" className="bg-white text-black">
            Toutes les {filterBy === "ville" ? "villes" : "sites"}
          </option>

          {filterOptions.map((option) => (
            <option key={option} value={option} className="bg-white text-black">
              {option}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-3">

          {/* ORDER BY */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
              Trier par:
            </span>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="created_at">
                Ancienneté
              </option>
              <option value="alphabetical">
                Ordre alphabétique
              </option>
            </select>

            {/* ORDER BUTTONS */}
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setSortOrder("asc")}
                className={`w-9 h-9 flex items-center justify-center transition
                  ${sortOrder === "asc"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"}
                `}
              >
                <ArrowUp size={18}/>
              </button>

              <button
                onClick={() => setSortOrder("desc")}
                className={`w-9 h-9 flex items-center justify-center transition
                  ${sortOrder === "desc"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"}
                `}
              >
                <ArrowDown size={18}/>
              </button>
            </div>
          </div>

          {/* ADD DRIVER */}
          <Link
            href="/admin/addDriver"
            className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 hover:scale-110 transition-all"
            title="Ajouter un chauffeur"
          >
            <Plus size={22}/>
          </Link>

        </div>
      </div>

      {sortedDrivers.length === 0 ? (

        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
          <div className="w-40 h-40 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <PersonOff sx={{ fontSize: 80 }} className="text-green-600"/>
          </div>

          <h3 className="text-lg font-semibold text-gray-800">
            Aucun chauffeur trouvé
          </h3>

          <p className="text-gray-500 mb-6 text-center max-w-xs">
            Aucun chauffeur ne correspond à vos critères.
          </p>

          <Link
            href="/admin/addDriver"
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow-md"
          >
            <Plus size={20}/>
            Ajouter un chauffeur
          </Link>
        </div>

      ) : (

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-sm">
            {/* HEADER */}
            <thead className="bg-green-600 text-gray-200">
              <tr className="text-left">
                <th className="px-6 py-4 font-semibold">
                  Nom complet
                </th>
                <th className="px-6 py-4 font-semibold">
                  Ville
                </th>
                <th className="px-6 py-4 font-semibold">
                  Quartier
                </th>
                <th className="px-6 py-4 font-semibold">
                  Téléphone
                </th>
                {role === "SUPER_ADMIN" && (
                  <th className="px-6 py-4 font-semibold text-center">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {sortedDrivers.map((driver) => (
                <tr
                  key={driver.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {driver.firstName} {driver.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {driver.city || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {driver.district || driver.quarter || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {driver.phone || "N/A"}
                  </td>

                  {role === "SUPER_ADMIN" && (
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        {/* EDIT LINK */}
                        <Link
                          href={`/admin/editDriver/${driver.id}`}
                          title="éditer"
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                        >
                          <EditIcon fontSize="small"/>
                        </Link>

                        {/* DELETE/ARCHIVE BUTTON */}
                        <button
                          onClick={() => handleArchive(driver.id, driver.firstName, driver.lastName)}
                          title="archiver"
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition"
                        >
                          <DeleteIcon fontSize="small"/>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}