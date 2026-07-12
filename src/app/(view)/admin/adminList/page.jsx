"use client";

import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminEditModal from "@/components/layout/Modals/AdminEditModal";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PersonOff } from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";

export default function AdminList() {
  const { user } = useAuth();
  const role = user?.role;

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const adminsMock = [
    {
      id: 1,
      name: "Pangui",
      surname: "Peguy",
      email: "pangui.peguy@gmail.com",
      site: "Centre Collecte Yaoundé",
      city: "Yaoundé",
      phone: "655 143 266"
    },
    {
      id: 2,
      name: "Tsomo",
      surname: "Cinthia",
      email: "tsomo.cinthia@gmail.com",
      site: "Centre Collecte Douala",
      city: "Douala",
      phone: "686 254 567"
    },
    {
      id: 3,
      name: "Ngadjou",
      surname: "Aurore",
      email: "ngadjou.aurore@gmail.com",
      site: "Centre Collecte Bafoussam",
      city: "Bafoussam",
      phone: "676 432 605"
    }
  ];

  const filteredAdmins = adminsMock.filter((admin) => {
    const matchesSearch = admin.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCity =
      cityFilter === "" || admin.city === cityFilter;

    return matchesSearch && matchesCity;
  });

  const uniqueCities = [
    ...new Set(adminsMock.map((a) => a.city))
  ];

  return (
    <div className="p-8">

      {/* SEARCH + FILTER */}
      <div className="flex gap-4 mb-6">

        <input
          type="text"
          placeholder="Rechercher un administrateur"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-64"
        />

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="border-green-700 rounded-lg px-4 py-2 bg-green-600 text-white font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
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

        { role === "SUPER_ADMIN" && (
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
    
        {/* ICÔNE D'ÉTAT VIDE */}
          <div className="w-40 h-40 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <PersonOff sx={{ fontSize: 80 }} className="text-green-600" />
          </div>

          {/* MESSAGE */}
          <h3 className="text-lg font-semibold text-gray-800">Aucun administrateur trouvé</h3>
          <p className="text-gray-500 mb-6 text-center max-w-xs">
            Il semble qu'aucun administrateur ne corresponde à vos critères de recherche ou qu'aucun n'ait encore été créé.
          </p>

          {/* BOUTON D'AJOUT RAPIDE (Seulement pour SUPER_ADMIN) */}
          {role === "SUPER_ADMIN" && (
            <Link
              href="/admin/addAdmin"
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow-md active:scale-95"
            >
              <Plus size={20} />
              Ajouter un administrateur
            </Link>
          )}
        </div>
      ):(
        /* TABLE */
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">

          <table className="w-full text-sm">

            {/* HEADER */}
            <thead className="bg-green-600 text-gray-200">

              <tr className="text-left">

                <th className="px-6 py-4 font-semibold">Nom complet</th>
                <th className="px-6 py-4 font-semibold">Site</th>
                <th className="px-6 py-4 font-semibold">Ville</th>
                <th className="px-6 py-4 font-semibold">Téléphone</th>

                {role === "SUPER_ADMIN" && (
                  <th className="px-6 py-4 font-semibold text-center">
                    Actions
                  </th>
                )}

              </tr>

            </thead>


            {/* BODY */}
            <tbody>

              {filteredAdmins.map((admin) => (

                <tr
                  key={admin.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >

                  <td className="px-6 py-4 font-medium text-gray-800">
                    {admin.name} {admin.surname}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {admin.site}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {admin.city}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {admin.phone}
                  </td>

                  {role === "SUPER_ADMIN" && (

                    <td className="px-6 py-4">

                      <div className="flex justify-center gap-3">

                        <button
                          onClick={() => setSelectedAdmin(admin)}
                          title="éditer"
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                        >
                          <EditIcon fontSize="small"/>
                        </button>

                        <button
                          onClick={() => alert("Admin archivé (mock)")}
                          title="supprimer"
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

      {/* MODAL */}
      {selectedAdmin && (

        <AdminEditModal
          admin={selectedAdmin}
          onClose={() => setSelectedAdmin(null)}
        />

      )}
    </div>
  );
}