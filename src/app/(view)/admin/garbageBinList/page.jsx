"use client";

import { useState, useEffect } from "react";
import { Filter, Loader2 } from "lucide-react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { garbagebins } from "@/services/garbagebin"; // Adaptez le chemin d'accès selon votre arborescence

export default function GarbageBinList() {
  const { user } = useAuth();
  const role = user?.role;

  // États pour la gestion des données réelles
  const [binList, setBinList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");

  // Récupération des bacs depuis le backend au chargement du composant
  useEffect(() => {
    const fetchBins = async () => {
      setIsLoading(true);
      setApiError("");
      
      const result = await garbagebins.getAll();
      
      // 🟢 AFFICHAGE DE LA RÉPONSE BACKEND DANS LA CONSOLE
      console.log("[Backend Response] Liste des bacs à ordures :", result);
      
      if (result.success) {
        setBinList(result.data || []);
      } else {
        setApiError(result.error || "Impossible de charger les bacs à ordures.");
      }
      setIsLoading(false);
    };

    fetchBins();
  }, []);

  // Handler pour la suppression/archivage
  const handleArchive = async (id, code) => {
    if (confirm(`Voulez-vous vraiment archiver le bac à ordures avec le code ${code} ?`)) {
      const result = await garbagebins.archive(id);
      if (result.success) {
        // Suppression visuelle instantanée de la liste locale
        setBinList((prev) => prev.filter((bin) => bin.id !== id));
      } else {
        alert(result.error || "Une erreur est survenue lors de l'archivage.");
      }
    }
  };

  // Villes uniques calculées sur les données dynamiques
  const cities = [...new Set(binList.map((b) => b.town).filter(Boolean))];

  // Format date (FR)
  const formatDate = (date) => {
    if (!date) return "Date inconnue";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Filtrage + Recherche appliqués sur les données dynamiques
  const filteredBins = binList.filter((bin) => {
    const matchesSearch = (bin.code || "").toLowerCase().includes(search.toLowerCase());
    const matchesCity = filterCity === "" || bin.town === filterCity;
    return matchesSearch && matchesCity;
  });

  // ÉCRAN DE CHARGEMENT TECHNIQUE (Design inchangé)
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        <p className="text-gray-500 font-medium">Chargement des bacs à ordures...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">

      {/* RENDER DES ERREURS D'API */}
      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {apiError}
        </div>
      )}

      {/* SEARCH + FILTER */}
      <div className="flex flex-wrap gap-4 items-center">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Rechercher par code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-64 border rounded-lg px-4 py-2"
        />

        {/* FILTER */}
        <div className="flex items-center gap-2 text-gray-600">
          <Filter size={18} />
          <span className="font-medium">Ville :</span>
        </div>

        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="border rounded-lg px-4 py-2 bg-green-600 text-white cursor-pointer"
        >
          <option value="" className="bg-white text-black">
            Toutes les villes
          </option>

          {cities.map((city) => (
            <option key={city} value={city} className="bg-white text-black">
              {city}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-3">
          {/* ADD GARBAGE BIN */}
          <Link
            href="/admin/addGarbageBin"
            className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 hover:scale-110 transition-all"
            title="Ajouter un bac"
          >
            <Plus size={22}/>
          </Link>
        </div>
      </div>

      {/* LIST */}
      {/* LIST / EMPTY STATE */}
      {filteredBins.length === 0 ? (
        
        /* 🟢 AFFICHAGE VERT EN CAS DE LISTE VIDE (MÊME DESIGN QUE VEHICLE) */
        <div className="flex flex-col items-center justify-center py-20 bg-green-50/50 rounded-2xl border-2 border-dashed border-green-300 space-y-3">
          <DeleteOutlinedIcon className="text-green-600" style={{ fontSize: 100 }} />
          <p className="text-green-700 font-semibold text-lg">
            Aucun bac trouvé.
          </p>
        </div>

      ) : (

        <div className="space-y-6">

          {filteredBins.map((bin) => (

            <div
              key={bin.id}
              className="flex bg-green-50 rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >

              {/* IMAGE */}
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center shrink-0">
                {bin.photo ? (
                  <img
                    src={bin.photo}
                    alt="bin"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-xs text-center">
                    📦<br />No Image
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="flex flex-col justify-between p-6 flex-1">

                <div className="space-y-2">

                  <h2 className="text-lg font-semibold text-gray-800">
                    CODE : {bin.code}
                  </h2>

                  <p className="text-gray-600">
                    <span className="font-medium">Ville:</span> {bin.town || "N/A"}
                  </p>

                  <p className="text-gray-600">
                    <span className="font-medium">Quartier:</span> {bin.quarter || "N/A"}
                  </p>

                  <p className="text-gray-500 text-sm">
                    Créé le: {formatDate(bin.createdAt)}
                  </p>

                </div>
              </div>

              {/* ACTIONS (Accessibles pour le rôle SUPER_ADMIN) */}
              {(role === "SUPER_ADMIN") && (
                <div className="flex flex-col justify-between items-end p-6">
                  <div className="text-green-700 font-medium underline text-sm">
                    Actions
                  </div>

                  <div className="flex gap-3 mt-auto">

                    {/* EDIT LINK */}
                    <Link 
                      href={`/admin/editGarbageBin/${bin.id}`}
                      title="éditer"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                    >
                      <EditIcon fontSize="small" />
                    </Link>

                    {/* DELETE/ARCHIVE BUTTON */}
                    <button 
                      onClick={() => handleArchive(bin.id, bin.code)}
                      title="supprimer"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>

                  </div>
                </div>
              )}

            </div>

          ))}

        </div>

      )}

    </div>
  );
}