"use client";

import { useState, useEffect } from "react";
import { Filter, Loader2 } from "lucide-react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalShippingIcon from "@mui/icons-material/LocalShipping"; // Importation de l'icône voiture MUI
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { vehicles } from "@/services/vehicle";

export default function VehicleList() {
  const { user } = useAuth();
  const role = user?.role;

  // États pour les données de l'API
  const [vehicleList, setVehicleList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // États pour la recherche et le filtrage
  const [search, setSearch] = useState("");
  const [filterBrand, setFilterBrand] = useState("");

  // Récupération des données au montage du composant
  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      setApiError("");
      
      const result = await vehicles.getAll();
      
      // 🟢 AFFICHAGE DE LA RÉPONSE BACKEND DANS LA CONSOLE
      console.log("[Backend Response] Liste des véhicules :", result);
      
      if (result.success) {
        setVehicleList(result.data || []);
      } else {
        setApiError(result.error || "Impossible de charger les véhicules.");
      }
      setIsLoading(false);
    };

    fetchVehicles();
  }, []);

  // Fonction pour gérer l'archivage/suppression d'un véhicule
  const handleArchive = async (id, plate) => {
    if (confirm(`Voulez-vous vraiment archiver le véhicule immatriculé ${plate} ?`)) {
      const result = await vehicles.archive(id);
      if (result.success) {
        setVehicleList((prev) => prev.filter((v) => v.id !== id));
      } else {
        alert(result.error || "Une erreur est survenue lors de l'archivage.");
      }
    }
  };

  // Extraction dynamique des marques uniques
  const brands = [...new Set(vehicleList.map((v) => v.brand).filter(Boolean))];

  // Filtrage et recherche
  const filteredVehicles = vehicleList.filter((v) => {
    const matchesSearch = (v.plate || "").toLowerCase().includes(search.toLowerCase());
    const matchesBrand = filterBrand === "" || v.brand === filterBrand;
    return matchesSearch && matchesBrand;
  });

  // ÉCRAN DE CHARGEMENT
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        <p className="text-gray-500 font-medium">Chargement des véhicules...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      
      {/* AFFICHAGE DES ERREURS API */}
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
          placeholder="Rechercher par immatriculation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full sm:w-64 border rounded-lg px-4 py-2"
        />

        {/* FILTER */}
        <div className="flex items-center gap-2 text-gray-600">
          <Filter size={18} />
          <span className="font-medium">Marque :</span>
        </div>

        <select
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          className="border rounded-lg px-4 py-2 bg-green-600 text-white cursor-pointer"
        >
          <option value="" className="bg-white text-black">
            Toutes les marques
          </option>
          {brands.map((brand) => (
            <option key={brand} value={brand} className="bg-white text-black">
              {brand}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-3">
          {/* ADD VEHICLE */}
          <Link
            href="/admin/addVehicle"
            className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 hover:scale-110 transition-all"
            title="Ajouter un véhicule"
          >
            <Plus size={22} />
          </Link>
        </div>
      </div>

      {/* LIST / EMPTY STATE */}
      {filteredVehicles.length === 0 ? (
        
        /* 🟢 NOUVEL AFFICHAGE VERT EN CAS DE LISTE VIDE */
        <div className="flex flex-col items-center justify-center py-20 bg-green-50/50 rounded-2xl border-2 border-dashed border-green-300 space-y-3">
          <LocalShippingIcon className="text-green-600" style={{ fontSize: 100 }} />
          <p className="text-green-700 font-semibold text-lg">
            Aucun véhicule trouvé.
          </p>
        </div>

      ) : (
        <div className="space-y-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="flex bg-green-50 rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              {/* IMAGE */}
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center shrink-0">
                {vehicle.photo ? (
                  <img
                    src={vehicle.photo}
                    alt="vehicle"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-2xl text-center">
                    存放<br />
                    <span className="text-xs">No Image</span>
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="flex flex-col justify-between p-6 flex-1">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {vehicle.plate}
                  </h2>
                  <p className="text-gray-600">
                    <span className="font-medium">Marque:</span> {vehicle.brand || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Modèle:</span> {vehicle.model || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Charge max:</span> {vehicle.maxLoad || "N/A"}
                  </p>
                </div>
              </div>

              {/* ACTIONS */}
              {(role === "SUPER_ADMIN" || role === "ADMIN") && (
                <div className="flex flex-col justify-between items-end p-6 border-l border-gray-100/50">
                  <div className="text-green-700 font-medium underline text-sm">
                    Actions
                  </div>

                  <div className="flex gap-3 mt-auto">
                    {/* EDIT BUTTON */}
                    <Link
                      href={`/admin/editVehicle/${vehicle.id}`}
                      title="éditer"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                    >
                      <EditIcon fontSize="small" />
                    </Link>

                    {/* DELETE/ARCHIVE BUTTON */}
                    <button
                      onClick={() => handleArchive(vehicle.id, vehicle.plate)}
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