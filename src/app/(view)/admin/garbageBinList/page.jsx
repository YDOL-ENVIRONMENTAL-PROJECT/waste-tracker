"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function GarbageBinList() {
  const { user } = useAuth();
  const role = user?.role;

  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");

  // MOCK DATA
  const binsMock = [
    {
      id: 1,
      code: "CE-A001",
      town: "Yaoundé",
      quarter: "Bastos",
      createdAt: "2024-08-25",
      photo: ""
    },
    {
      id: 2,
      code: "LI-A001",
      town: "Douala",
      quarter: "Akwa",
      createdAt: "2020-09-12",
      photo: ""
    },
    {
      id: 3,
      code: "CE-A002",
      town: "Yaoundé",
      quarter: "Melen",
      createdAt: "2025-03-10",
      photo: ""
    }
  ];

  // Unique cities
  const cities = [...new Set(binsMock.map(b => b.town))];

  // Format date (FR)
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Filter + Search
  const filteredBins = binsMock.filter(bin => {
    const matchesSearch = bin.code.toLowerCase().includes(search.toLowerCase());
    const matchesCity = filterCity === "" || bin.town === filterCity;
    return matchesSearch && matchesCity;
  });

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
          className="input w-64"
        />

        {/* FILTER */}
        <div className="flex items-center gap-2 text-gray-600">
          <Filter size={18} />
          <span className="font-medium">Ville :</span>
        </div>

        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="border rounded-lg px-4 py-2 bg-green-600 text-white"
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
      {filteredBins.length === 0 ? (

        <div className="text-center text-gray-500 py-20">
          Aucun bac trouvé.
        </div>

      ) : (

        <div className="space-y-6">

          {filteredBins.map((bin) => (

            <div
              key={bin.id}
              className="flex bg-green-50 rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >

              {/* IMAGE */}
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
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
                    <span className="font-medium">Ville:</span> {bin.town}
                  </p>

                  <p className="text-gray-600">
                    <span className="font-medium">Quartier:</span> {bin.quarter}
                  </p>

                  <p className="text-gray-500 text-sm">
                    Créé le: {formatDate(bin.createdAt)}
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