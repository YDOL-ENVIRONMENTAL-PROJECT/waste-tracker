"use client";

import { useState, useEffect } from "react";
import { Filter, Loader2, MapPin, Trash2, FileText } from "lucide-react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { garbagebins } from "@/services/garbagebin";
import { notify } from "@/lib/notify";
import BinDetails from "@/components/layout/Modals/BinDetails";

// Reflète l'enum GarbageBinStatus côté backend — même mapping que dans BinDetails
const STATUS_META = {
  EMPTY: { label: "Vide", classes: "bg-green-50 text-green-700 border-green-200" },
  FULL: { label: "Plein", classes: "bg-red-50 text-red-700 border-red-200" },
  OUT_OF_SERVICE: { label: "Hors service", classes: "bg-gray-100 text-gray-600 border-gray-200" },
  ARCHIVED: { label: "Archivé", classes: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function GarbageBinList() {
  const { user } = useAuth();
  const role = user?.role;

  // États pour la gestion des données réelles
  const [binList, setBinList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");

  // État pour la modale de détails / édition
  const [selectedBin, setSelectedBin] = useState(null);

  // Récupération des bacs depuis le backend au chargement du composant
  useEffect(() => {
    const fetchBins = async () => {
      setIsLoading(true);

      const result = await garbagebins.getAll();

      console.log("[Backend Response] Liste des bacs à ordures :", result);

      if (result.success) {
        setBinList(result.data || []);
      } else {
        notify.error(
          result.error || "Impossible de charger les bacs à ordures",
          result.technical
        );
      }
      setIsLoading(false);
    };

    fetchBins();
  }, []);

  // Handler pour la suppression/archivage
  const handleArchive = async (id, code) => {
    if (confirm(`Voulez-vous vraiment supprimer le bac à ordures avec le code ${code} ?`)) {
      const result = await garbagebins.archive(id);
      if (result.success) {
        setBinList((prev) => prev.filter((bin) => bin.id !== id));
        notify.success("Bac archivé");
      } else {
        notify.error(
          result.error || "Impossible de supprimer ce bac",
          result.technical
        );
      }
    }
  };

  // Callback appelé par BinDetails après une édition réussie : on synchronise la liste
  const handleBinUpdated = (updatedBin) => {
    setBinList((prev) => prev.map((bin) => (bin.id === updatedBin.id ? updatedBin : bin)));
    setSelectedBin(updatedBin);
  };

  // Villes uniques calculées sur les données dynamiques
  const cities = [...new Set(binList.map((b) => b.town).filter(Boolean))];

  // Format date (FR)
  const formatDate = (date) => {
    if (!date) return "Date inconnue";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
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
      {/* SEARCH + FILTER */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* SEARCH */}
        <input
          type="text"
          placeholder="Rechercher par code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />

        {/* FILTER */}
        <div className="flex items-center gap-2 text-gray-600">
          <Filter size={18} />
          <span className="font-medium text-sm">Ville :</span>
        </div>

        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="border rounded-lg px-4 py-2 bg-green-600 text-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
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
            <Plus size={22} />
          </Link>
        </div>
      </div>

      {/* LIST / EMPTY STATE */}
      {filteredBins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-green-50/50 rounded-2xl border-2 border-dashed border-green-300 space-y-3">
          <DeleteOutlinedIcon className="text-green-600" style={{ fontSize: 100 }} />
          <p className="text-green-700 font-semibold text-lg">Aucun bac trouvé.</p>
          <p className="text-green-600/70 text-sm">
            Modifiez vos filtres ou ajoutez un nouveau bac pour commencer.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBins.map((bin) => {
            const statusMeta = STATUS_META[bin.status];
            return (
              <div
                key={bin.id}
                className="group relative flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-green-200 transition-all duration-200"
              >
                {/* IMAGE */}
                <div className="w-32 h-32 sm:w-36 sm:h-36 shrink-0 self-center ml-4 my-4 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                  {bin.photo ? (
                    <img
                      src={bin.photo}
                      alt={`Bac ${bin.code}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-300">
                      <ImageOutlinedIcon style={{ fontSize: 32 }} />
                      <span className="text-[11px] font-medium text-gray-400">
                        Pas de photo
                      </span>
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="flex flex-col justify-center gap-2.5 p-6 flex-1 min-w-0">
                  {/* CODE + STATUT */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 font-mono text-sm font-semibold px-2.5 py-1 rounded-md border border-green-100">
                      <Trash2 size={14} />
                      {bin.code}
                    </span>
                    {statusMeta && (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.classes}`}>
                        {statusMeta.label}
                      </span>
                    )}
                  </div>

                  {/* Location badges */}
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400" />
                      {bin.town || "Ville inconnue"}
                      {bin.quarter ? `, ${bin.quarter}` : ""}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="flex items-start gap-1.5 text-sm text-gray-500">
                    <FileText size={14} className="text-gray-300 mt-0.5 shrink-0" />
                    {bin.description ? (
                      <p className="line-clamp-2">{bin.description}</p>
                    ) : (
                      <p className="italic text-gray-400">Aucune description renseignée.</p>
                    )}
                  </div>

                  {/* Date */}
                  <p className="text-xs text-gray-400 pt-1">
                    Créé le {formatDate(bin.createdAt)}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex items-start gap-2 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {/* VOIR DÉTAILS — accessible à tous les rôles */}
                  <button
                    onClick={() => setSelectedBin(bin)}
                    title="Voir les détails"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                  >
                    <VisibilityIcon fontSize="small" />
                  </button>

                  {/* SUPPRIMER — réservé au SUPER_ADMIN */}
                  {role === "SUPER_ADMIN" && (
                    <button
                      onClick={() => handleArchive(bin.id, bin.code)}
                      title="Supprimer"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-600 transition"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALE DE DÉTAILS / ÉDITION */}
      {selectedBin && (
        <BinDetails
          bin={selectedBin}
          onClose={() => setSelectedBin(null)}
          onUpdated={handleBinUpdated}
        />
      )}
    </div>
  );
}