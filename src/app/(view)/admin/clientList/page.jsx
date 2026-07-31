"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { Filter, Loader2, History, Archive } from "lucide-react";
import { PersonOff } from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";
import { useAuth } from "@/hooks/useAuth";
import { clients } from "@/services/client";
import { notify } from "@/lib/notify";
import ClientDetails from "@/components/layout/Modals/ClientDetails";

export default function ClientList() {
  const { user } = useAuth();
  const role = user?.role;

  // États pour la liste des clients actifs
  const [clientList, setClientList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("ville");
  const [filterValue, setFilterValue] = useState("");

  // ÉTATS POUR LES CLIENTS ARCHIVÉS (EN BAS)
  const [archivedList, setArchivedList] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);

  // État pour la modale de détails (le composant ClientDetails gère son propre rendu)
  const [selectedClient, setSelectedClient] = useState(null);

  // Récupération des clients actifs au montage du composant
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      const result = await clients.getAll();
      if (result.success) {
        setClientList(result.data || []);
      } else {
        notify.error(
          result.error || "Impossible de charger les clients",
          result.technical
        );
      }
      setIsLoading(false);
    };
    fetchClients();
  }, []);

  // Déclencheur pour charger et afficher la liste des archivés
  const toggleArchivedSection = async () => {
    if (showArchived) {
      setShowArchived(false);
      return;
    }

    setShowArchived(true);

    if (typeof clients.getArchived === "function") {
      setIsLoadingArchived(true);
      const result = await clients.getArchived();
      if (result.success) {
        setArchivedList(result.data || []);
      }
      setIsLoadingArchived(false);
    } else {
      setArchivedList([]);
    }
  };

  // Fonction pour gérer l'archivage d'un client actif
  const handleArchive = async (id, displayName) => {
    if (confirm(`Voulez-vous vraiment supprimer le client ${displayName} ?`)) {
      const result = await clients.archive(id);
      if (result.success) {
        const archivedClient = clientList.find((c) => c.id === id);
        setClientList((prev) => prev.filter((c) => c.id !== id));

        if (archivedClient) {
          setArchivedList((prev) => [archivedClient, ...prev]);
        }
        notify.success("Client archivé");
      } else {
        notify.error(
          result.error || "Impossible de supprimer ce client",
          result.technical
        );
      }
    }
  };

  // Helper pour formater les données d'un client
  const getClientMeta = (client) => {
    const isParticulier = client.name === null || client.name === "string";
    return {
      categoryLabel: isParticulier ? "PARTICULIER" : "ENTREPRISE",
      displayName: isParticulier
        ? `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Particulier sans nom"
        : client.name,
    };
  };

  // Extraction dynamique des filtres basés sur les clients actifs
  const uniqueCities = [...new Set(clientList.map((c) => c.town).filter(Boolean))];
  const uniqueTypes = [...new Set(clientList.map((c) => c.type).filter(Boolean))];
  const uniqueCategories = ["PARTICULIER", "ENTREPRISE"];

  const filterOptions =
    filterBy === "ville" ? uniqueCities : filterBy === "category" ? uniqueCategories : uniqueTypes;

  // Filtrage des clients actifs
  const filteredClients = clientList.filter((client) => {
    const { displayName, categoryLabel } = getClientMeta(client);
    const matchesSearch = displayName.toLowerCase().includes(search.toLowerCase()) || (client.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterValue === "" || (filterBy === "ville" ? client.town === filterValue : filterBy === "category" ? categoryLabel === filterValue : client.type === filterValue);
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        <p className="text-gray-500 font-medium">Chargement des clients actifs...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">

      {/* BLOC PRINCIPAL : CLIENTS ACTIFS */}
      <div className="space-y-4">
        {/* SEARCH + FILTERS */}
        <div className="flex gap-4 flex-wrap items-center">
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
            <select
              value={filterBy}
              onChange={(e) => { setFilterBy(e.target.value); setFilterValue(""); }}
              className="border rounded-lg px-3 py-2 bg-white"
            >
              <option value="ville">Ville</option>
              <option value="category">Catégorie</option>
              <option value="type">Type</option>
            </select>
          </div>

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
                {option === "PARTICULIER" ? "Particulier" : option === "ENTREPRISE" ? "Entreprise" : option}
              </option>
            ))}
          </select>
        </div>

        {/* LISTE OU EMPTY STATE DE BASE */}
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
            <div className="w-40 h-40 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <PersonOff sx={{ fontSize: 80 }} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Aucun client trouvé</h3>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-green-600 text-gray-200">
                <tr className="text-left">
                  <th className="px-6 py-4">Photo</th>
                  <th className="px-6 py-4">Nom Complet</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Téléphone</th>
                  <th className="px-6 py-4">Ville</th>
                  <th className="px-6 py-4"></th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const { displayName } = getClientMeta(client);
                  return (
                    <tr key={client.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                          {displayName.charAt(0) || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{displayName}</td>
                      <td className="px-6 py-4 text-gray-600">{client.email || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-600">{client.phone || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-600">{client.town || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {client.type === "PREMIUM" && <StarIcon fontSize="small" className="text-amber-500" />}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => setSelectedClient(client)}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition cursor-pointer"
                            title="Voir les détails"
                          >
                            <VisibilityIcon fontSize="small" />
                          </button>
                          {role === "SUPER_ADMIN" && (
                            <button
                              onClick={() => handleArchive(client.id, displayName)}
                              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-100 hover:border-red-100 transition cursor-pointer"
                              title="Supprimer"
                            >
                              <DeleteIcon fontSize="small" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LIEN VERS LES ANCIENS CLIENTS */}
      <div className="flex justify-start pt-1">
        <button
          onClick={toggleArchivedSection}
          className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 hover:underline transition-all cursor-pointer bg-transparent border-none p-0"
        >
          <History size={16} />
          {showArchived ? "Masquer les anciens clients" : "Voir les anciens clients"}
        </button>
      </div>

      {/* BLOC SECONDAIRE : ANCIENS CLIENTS ARCHIVÉS */}
      {showArchived && (
        <div className="border-t border-dashed border-gray-200 pt-6 animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <Archive size={20} className="text-amber-600" />
            <h2 className="text-lg font-bold text-gray-800">Archives des clients</h2>
            <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-md px-2 py-0.5">
              Historique
            </span>
          </div>

          {isLoadingArchived ? (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
              Chargement des archives...
            </div>
          ) : archivedList.length === 0 ? (
            <div className="p-8 bg-gray-50 border rounded-2xl text-center text-gray-400 text-sm">
              Aucun ancien client archivé pour le moment.
            </div>
          ) : (
            <div className="bg-gray-50/50 rounded-2xl overflow-hidden border border-gray-200 opacity-85 shadow-xs">
              <table className="w-full text-sm">
                <thead className="bg-gray-600 text-gray-100">
                  <tr className="text-left">
                    <th className="px-6 py-4">Photo</th>
                    <th className="px-6 py-4">Nom Complet</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Téléphone</th>
                    <th className="px-6 py-4">Ville</th>
                    <th className="px-6 py-4 text-center">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedList.map((client) => {
                    const { displayName } = getClientMeta(client);
                    return (
                      <tr key={client.id} className="border-t border-gray-200 hover:bg-gray-100/70 transition grayscale-40 text-gray-600">
                        <td className="px-6 py-4">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                            {displayName.charAt(0) || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700">{displayName}</td>
                        <td className="px-6 py-4 text-xs">{client.email || "N/A"}</td>
                        <td className="px-6 py-4">{client.phone || "N/A"}</td>
                        <td className="px-6 py-4">{client.town || "N/A"}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedClient(client)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-white hover:bg-gray-200 border text-gray-600 shadow-2xs cursor-pointer"
                            title="Voir l'historique"
                          >
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODALE DE DÉTAILS (composant dédié, importé) */}
      {selectedClient && (
        <ClientDetails client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}

    </div>
  );
}