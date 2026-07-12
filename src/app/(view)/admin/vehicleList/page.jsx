"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function VehicleList() {
  const { user } = useAuth();
  const role = user?.role;

  const [search, setSearch] = useState("");
  const [filterBrand, setFilterBrand] = useState("");

  // MOCK DATA
  const vehiclesMock = [
    {
      id: 1,
      plate: "LT-123-AB",
      brand: "Toyota",
      model: "Hilux",
      maxLoad: "3 tonnes",
      photo: ""
    },
    {
      id: 2,
      plate: "CE-456-CD",
      brand: "Isuzu",
      model: "NPR",
      maxLoad: "5 tonnes",
      photo: ""
    },
    {
      id: 3,
      plate: "DU-789-EF",
      brand: "Mercedes",
      model: "Actros",
      maxLoad: "10 tonnes",
      photo: ""
    }
  ];

  // Marques uniques
  const brands = [...new Set(vehiclesMock.map(v => v.brand))];

  // FILTER + SEARCH
  const filteredVehicles = vehiclesMock.filter(v => {
    const matchesSearch = v.plate.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = filterBrand === "" || v.brand === filterBrand;
    return matchesSearch && matchesBrand;
  });

  return (
    <div className="p-8 space-y-6">

      {/* SEARCH + FILTER */}
      <div className="flex flex-wrap gap-4 items-center">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Rechercher par immatriculation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-64"
        />

        {/* FILTER */}
        <div className="flex items-center gap-2 text-gray-600">
          <Filter size={18} />
          <span className="font-medium">Marque :</span>
        </div>

        <select
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          className="border rounded-lg px-4 py-2 bg-green-600 text-white"
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
            <Plus size={22}/>
          </Link>
        </div>
      </div>

      {/* LIST */}
      {filteredVehicles.length === 0 ? (

        <div className="text-center text-gray-500 py-20">
          Aucun véhicule trouvé.
        </div>

      ) : (

        <div className="space-y-6">

          {filteredVehicles.map((vehicle) => (

            <div
              key={vehicle.id}
              className="flex bg-green-50 rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >

              {/* IMAGE */}
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                {vehicle.photo ? (
                  <img
                    src={vehicle.photo}
                    alt="vehicle"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-xs text-center">
                    🚛<br />No Image
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
                    <span className="font-medium">Marque:</span> {vehicle.brand}
                  </p>

                  <p className="text-gray-600">
                    <span className="font-medium">Modèle:</span> {vehicle.model}
                  </p>

                  <p className="text-gray-600">
                    <span className="font-medium">Charge max:</span> {vehicle.maxLoad}
                  </p>

                </div>

              </div>

              {/* ACTIONS */}
              {role === "SUPER_ADMIN" && (
                <div>
                  <div className="text-green-700 mt-5 ml-4 font-medium underline">
                    Actions
                  </div>

                  <div className="flex gap-3 mt-9 mr-6">

                    <button 
                      title="éditer"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                    >
                      <EditIcon fontSize="small" />
                    </button>

                    <button 
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