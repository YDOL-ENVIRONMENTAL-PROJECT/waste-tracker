"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Filter, Loader2 } from "lucide-react";
import { PersonOff } from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";
import { useAuth } from "@/hooks/useAuth";
import { clients } from "@/services/client"; // Assurez-vous que le chemin d'importation correspond à votre projet

export default function ClientList() {
  const { user } = useAuth();
  const role = user?.role;

  // États pour les données dynamiques de l'API
  const [clientList, setClientList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("ville");      // "ville" ou "category"
  const [filterValue, setFilterValue] = useState("");     // valeur sélectionnée

  // Récupération des données au montage du composant
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      setApiError("");

      const result = await clients.getAll();

      // 🟢 AFFICHAGE DE LA RÉPONSE BACKEND DANS LA CONSOLE
      console.log("[Backend Response] Liste des clients :", result);

      if (result.success) {
        setClientList(result.data || []);
      } else {
        setApiError(result.error || "Impossible de charger les clients.");
      }
      setIsLoading(false);
    };

    fetchClients();
  }, []);

  // Fonction pour gérer l'archivage/suppression d'un client
  const handleArchive = async (id, displayName) => {
    if (confirm(`Voulez-vous vraiment archiver le client ${displayName} ?`)) {
      const result = await clients.archive(id);
      if (result.success) {
        // Mise à jour de l'état local pour retirer le client archivé
        setClientList((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert(result.error || "Une erreur est survenue lors de l'archivage.");
      }
    }
  };

  // Extraction dynamique des filtres basés sur les données de l'API
  const uniqueCities = [...new Set(clientList.map((c) => c.town).filter(Boolean))];
  const uniqueCategories = [...new Set(clientList.map((c) => c.category).filter(Boolean))];
  const uniqueTypes = [...new Set(clientList.map((c) => c.type).filter(Boolean))];

  const filterOptions =
    filterBy === "ville"
      ? uniqueCities
      : filterBy === "category"
      ? uniqueCategories
      : uniqueTypes;

  // Filtrage
  const filteredClients = clientList.filter((client) => {
    // Recherche par nom
    const fullName =
      client.category === "INDIVIDUAL"
        ? `${client.firstName || ""} ${client.lastName || ""}`.toLowerCase()
        : (client.name || "").toLowerCase();

    const matchesSearch = fullName.includes(search.toLowerCase());

    // Filtre dynamique
    const matchesFilter =
      filterValue === "" ||
      (filterBy === "ville"
        ? client.town === filterValue
        : filterBy === "category"
        ? client.category === filterValue
        : client.type === filterValue);

    return matchesSearch && matchesFilter;
  });

  // ÉCRAN DE CHARGEMENT TECHNIQUE
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        <p className="text-gray-500 font-medium">Chargement des clients...</p>
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* AFFICHAGE DES ERREURS D'API */}
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
          placeholder="Rechercher par email ou nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full sm:w-64"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <Filter size={16} />
            Filtrer par:
          </span>

          {/* Choix du critère */}
          <select
            value={filterBy}
            onChange={(e) => {
              setFilterBy(e.target.value);
              setFilterValue(""); // Reset quand on change de type de filtre
            }}
            className="border rounded-lg px-3 py-2 bg-white"
          >
            <option value="ville">Ville</option>
            <option value="category">Catégorie</option>
            <option value="type">Type</option>
          </select>
        </div>

        {/* Valeur du filtre (villes, catégories ou types) */}
        <select
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="border rounded-lg px-4 py-2 bg-green-600 text-white font-medium cursor-pointer min-w-48"
          disabled={filterOptions.length === 0}
        >
          <option value="" className="bg-white text-black">
            Toutes les {filterBy === "ville" ? "villes" : filterBy === "category" ? "catégories" : "types"}
          </option>

          {filterOptions.map((option) => (
            <option key={option} value={option} className="bg-white text-black">
              {option === "INDIVIDUAL" ? "Individu" : option === "ENTERPRISE" ? "Entreprise" : option}
            </option>
          ))}
        </select>
      </div>

      {/* EMPTY STATE */}
      {filteredClients.length === 0 ? (

        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">

          <div className="w-40 h-40 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <PersonOff sx={{ fontSize: 80 }} className="text-green-600" />
          </div>

          <h3 className="text-lg font-semibold text-gray-800">
            Aucun client trouvé
          </h3>

          <p className="text-gray-500 mb-6 text-center max-w-xs">
            Aucun client ne correspond à vos critères.
          </p>

        </div>

      ) : (

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">

          <table className="w-full text-sm">

            {/* HEADER */}
            <thead className="bg-green-600 text-gray-200">
              <tr className="text-left">
                <th className="px-6 py-4">Photo</th>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Téléphone</th>
                <th className="px-6 py-4">Ville</th>
                <th className="px-6 py-4"></th>

                {role === "SUPER_ADMIN" && (
                  <th className="px-6 py-4 text-center">Actions</th>
                )}
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {filteredClients.map((client) => {
                const displayName =
                  client.category === "INDIVIDUAL"
                    ? `${client.firstName || ""} ${client.lastName || ""}`
                    : client.name || "—";

                return (
                  <tr
                    key={client.id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition"
                  >
                    {/* PHOTO / INITIAL */}
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                        {displayName.trim().charAt(0) || "—"}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-800">
                      {displayName}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {client.email || "N/A"}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {client.phone || "N/A"}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {client.town || "N/A"}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {client.type === "PREMIUM" && (
                        <StarIcon 
                          fontSize="small" 
                          className="text-amber-500"
                        />
                      )}
                    </td>

                    {role === "SUPER_ADMIN" && (
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          {/* EDIT BUTTON */}
                          <Link
                            href={`/admin/editClient/${client.id}`}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                            title="éditer"
                          >
                            <EditIcon fontSize="small" />
                          </Link>

                          {/* ARCHIVE BUTTON */}
                          <button
                            onClick={() => handleArchive(client.id, displayName)}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition"
                            title="supprimer"
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}