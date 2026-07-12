"use client";

import { useState } from "react";
import Link from "next/link";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Plus, ArrowUp, ArrowDown, Filter } from "lucide-react";
import { PersonOff } from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";

export default function DriverList() {
  const { user } = useAuth();
  const role = user?.role;

  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("ville"); // "ville" ou "site"
  const [filterValue, setFilterValue] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const driversMock = [
    {
      id: 1,
      firstName: "Tasse",
      lastName: "Arole",
      phone: "690123456",
      email: "jean.mba@gmail.com",
      site: "Centre Collecte Yaoundé",
      city: "Yaoundé",
      district: "Bastos",
      role: "DRIVER",
      profile_photo: "",
      birth_date: "1990-05-12",
      created_at: "2024-02-12",
      updated_at: "2024-03-12",
      status: "ACTIVE"
    },
    {
      id: 2,
      firstName: "Rouchda",
      lastName: "Yampen",
      phone: "670223456",
      email: "patrick.ngono@gmail.com",
      site: "Centre Collecte Douala",
      city: "Douala",
      district: "Akwa",
      role: "DRIVER",
      profile_photo: "",
      birth_date: "1987-11-02",
      created_at: "2024-01-05",
      updated_at: "2024-02-10",
      status: "ACTIVE"
    },
    {
      id: 3,
      firstName: "Negou",
      lastName: "Donald",
      phone: "680998877",
      email: "samuel.talla@gmail.com",
      site: "Centre Collecte Yaoundé",
      city: "Yaoundé",
      district: "Emana",
      role: "DRIVER",
      profile_photo: "",
      birth_date: "1993-03-20",
      created_at: "2024-03-01",
      updated_at: "2024-03-10",
      status: "ACTIVE"
    }
  ];

  const uniqueCities = [...new Set(driversMock.map(d => d.city))];
  const uniqueSites = [...new Set(driversMock.map(d => d.site))];
  const filterOptions = filterBy === "ville" ? uniqueCities : uniqueSites;

  const filteredDrivers = driversMock.filter((driver) => {

    const fullName = `${driver.firstName} ${driver.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase());

    // Filtre dynamique basé sur filterBy et filterValue
    const matchesFilter = filterValue === "" || 
      (filterBy === "ville" ? driver.city === filterValue : driver.site === filterValue);

    return matchesSearch && matchesFilter;
  });

  const sortedDrivers = [...filteredDrivers].sort((a, b) => {

    if (sortBy === "created_at") {

      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);

      return sortOrder === "asc"
        ? dateA - dateB
        : dateB - dateA;
    }

    if (sortBy === "alphabetical") {

      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();

      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }

    return 0;
  });

  return (
    <div className="p-8">

      {/* SEARCH + FILTERS */}
      <div className="flex gap-4 mb-6 flex-wrap items-center">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Rechercher un chauffeur"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-64"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <Filter size={16} />
            Filtrer par:
          </span>

          {/* CHOIX DU TYPE DE FILTRE */}
          <select
            value={filterBy}
            onChange={(e) => {
              setFilterBy(e.target.value);
              setFilterValue(""); // Réinitialiser la valeur quand on change de type
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

      {filteredDrivers.length === 0 ? (

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
                    {driver.city}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {driver.district}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {driver.phone}
                  </td>

                  {role === "SUPER_ADMIN" && (

                    <td className="px-6 py-4">

                      <div className="flex justify-center gap-3">

                        <button
                          title="éditer"
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                        >
                          <EditIcon fontSize="small"/>
                        </button>

                        <button
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