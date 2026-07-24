"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { PersonOff } from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import { admins } from "@/services/admin"; 

export default function AdminList() {
  const { user } = useAuth();
  const currentUserId = user?.id; 
  const role = user?.role;

  // États pour les données issues de l'API
  const [adminList, setAdminList] = useState([]);
  const [archivedAdmins, setArchivedAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  // États pour la suppression multiple et l'affichage des archives
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedAdminIds, setSelectedAdminIds] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Récupération des administrateurs depuis le backend
  const fetchAdmins = async () => {
    setIsLoading(true);
    setApiError("");
    const result = await admins.getAll();

    if (result.success) {
      const active = (result.data || []).filter(a => a.status !== "ARCHIVED");
      const archived = (result.data || []).filter(a => a.status === "ARCHIVED");
      
      setAdminList(active);
      setArchivedAdmins(archived);
    } else {
      setApiError(result.error || "Impossible de charger les administrateurs.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSelectAdmin = (id) => {
    setSelectedAdminIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    setIsArchiving(true);
    
    try {
      const deletePromises = selectedAdminIds.map(id => admins.archive(id));
      await Promise.all(deletePromises);
      
      setSelectedAdminIds([]);
      setIsDeleteMode(false);
      await fetchAdmins();
    } catch (err) {
      alert("Une erreur est survenue lors de la suppression de certains administrateurs.");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleCancelDeleteMode = () => {
    setIsDeleteMode(false);
    setSelectedAdminIds([]);
  };

  const uniqueCities = [
    ...new Set(adminList.map((a) => a.site).filter(Boolean))
  ];

  const filteredAdmins = adminList.filter((admin) => {
    const fullName = `${admin.firstName || ""} ${admin.lastName || ""}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || (admin.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === "" || admin.site === cityFilter;

    return matchesSearch && matchesCity;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        <p className="text-gray-500 font-medium">Chargement des administrateurs...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {apiError && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {apiError}
        </div>
      )}

      {/* SEARCH + FILTER */}
      <div className="flex gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Rechercher un administrateur"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-green-600"
        />

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-lg px-4 py-2 bg-green-600 text-white font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
        >
          <option value="" className="bg-white text-black">
            Toutes les villes
          </option>
          {uniqueCities.map((city) => (
            <option key={city} value={city} className="bg-white text-black">
              {city}
            </option>
          ))}
        </select>

        {role === "SUPER_ADMIN" && (
          <Link 
            href="/admin/addAdmin" 
            className="ml-auto flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 hover:scale-110 transition-all active:scale-95 cursor-pointer"          
            title="Ajouter un administrateur"
          >
            <Plus size={24} />
          </Link>
        )}
      </div>

      {filteredAdmins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
          <div className="w-40 h-40 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <PersonOff sx={{ fontSize: 80 }} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Aucun administrateur trouvé</h3>
          <p className="text-gray-500 mb-6 text-center max-w-xs">
            Il semble qu'aucun administrateur ne corresponde à vos critères.
          </p>
        </div>
      ) : (
        /* TABLEAU */
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-sm">
            {/* HEADER */}
            <thead className="bg-green-600 text-gray-200">
              <tr className="text-left">
                {isDeleteMode && <th className="px-6 py-4 w-12 text-center">Sél.</th>}
                <th className="px-6 py-4 font-semibold">Photo</th>
                <th className="px-6 py-4 font-semibold">Nom complet</th>
                <th className="px-6 py-4 font-semibold">Rôle</th>
                <th className="px-6 py-4 font-semibold">Site</th>
                <th className="px-6 py-4 font-semibold">Adresse mail</th>
                <th className="px-6 py-4 font-semibold">Téléphone</th>
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>

            <tbody>
              {filteredAdmins.map((admin) => {
                const displayName = `${admin.firstName || ""} ${admin.lastName || ""}`;
                
                return (
                  <tr key={admin.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                    {/* CASE À COCHER (Mode Suppression) */}
                    {isDeleteMode && (
                      <td className="px-6 py-4 text-center">
                        {admin.id !== currentUserId ? (
                          <input
                            type="checkbox"
                            checked={selectedAdminIds.includes(admin.id)}
                            onChange={() => handleSelectAdmin(admin.id)}
                            className="w-4 h-4 accent-red-600 cursor-pointer"
                          />
                        ) : (
                          <span className="text-xs text-gray-400 italic">Moi</span>
                        )}
                      </td>
                    )}

                    {/* REINTEGRATION DE LA PHOTO / INITIALE */}
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                        {displayName.trim().charAt(0) || "—"}
                      </div>
                    </td>

                    {/* NOM COMPLET */}
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {displayName}
                    </td>

                    {/* BADGE RÔLE */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        admin.role === "SUPER_ADMIN" 
                          ? "bg-purple-100 text-purple-700 border border-purple-200" 
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                      }`}>
                        {admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600">{admin.site || "N/A"}</td>
                    <td className="px-6 py-4 text-gray-600">{admin.email || "N/A"}</td>
                    <td className="px-6 py-4 text-gray-600">{admin.phone || "N/A"}</td>

                    {/* LED DE STATUT A L'EXTRÊME DROITE */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end">
                        <span 
                          className={`w-3 h-3 rounded-full shadow-xs ${
                            admin.status === "ONLINE" ? "bg-green-500 animate-pulse" : "bg-gray-400"
                          }`}
                          title={admin.status === "ONLINE" ? "En ligne" : "Déconnecté"}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION DU BAS : RÔLE SUPER_ADMIN EXCLUSIF */}
      {role === "SUPER_ADMIN" && (
        <div className="mt-8 flex justify-between items-center flex-wrap gap-4">
          
          {/* LIEN DE GAUCHE : ARCHIVES */}
          <div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="text-sm text-gray-500 hover:text-gray-800 italic underline cursor-pointer transition-colors"
            >
              {showArchived ? "Masquer les anciens administrateurs" : "Voir anciens administrateurs"}
            </button>
          </div>

          {/* BOUTONS DE DROITE : INTERFACE DYNAMIQUE DE SUPPRESSION */}
          <div>
            {!isDeleteMode ? (
              <button
                onClick={() => setIsDeleteMode(true)}
                className="px-5 py-2.5 bg-white border border-red-600 text-red-600 rounded-lg font-semibold text-sm hover:bg-red-50 transition-all shadow-xs cursor-pointer"
              >
                Supprimer des administrateurs
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDeleteMode}
                  className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  disabled={selectedAdminIds.length === 0 || isArchiving}
                  onClick={() => setShowConfirmModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-all shadow-xs disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isArchiving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmer la suppression ({selectedAdminIds.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LISTE RENDER DES ANCIENS ADMINISTRATEURS */}
      {role === "SUPER_ADMIN" && showArchived && (
        <div className="mt-6 p-6 bg-gray-50 border rounded-2xl transition-all">
          <h4 className="text-gray-700 font-bold mb-3 text-sm">Historique des administrateurs supprimés</h4>
          {archivedAdmins.length === 0 ? (
            <p className="text-gray-400 italic text-xs">Aucun ancien administrateur archivé dans le système.</p>
          ) : (
            <ul className="divide-y divide-gray-200 text-xs text-gray-600">
              {archivedAdmins.map((archived) => (
                <li key={archived.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-gray-800">{archived.firstName} {archived.lastName}</span>
                    <span className="ml-2 text-gray-400">({archived.email})</span>
                  </div>
                  <span className="text-gray-400 italic">Archivé le {new Date(archived.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* MODALE DE CONFIRMATION */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border mx-4 transform transition-all scale-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmation requise</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement les <strong>{selectedAdminIds.length}</strong> administrateurs sélectionnés ? Cette action déplacera ces profils vers l'historique d'archivage.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
              >
                Retour
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-xs"
              >
                Confirmer l'archivage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}