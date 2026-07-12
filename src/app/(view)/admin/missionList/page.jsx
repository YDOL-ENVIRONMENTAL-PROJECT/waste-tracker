"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function MissionList() {

  const router = useRouter();

  // FILTRES ET RECHERCHES
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]); // aujourd'hui par défaut
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, IN_PROGRESS, DONE
  const [searchBy, setSearchBy] = useState("code"); // code ou chauffeur
  const [search, setSearch] = useState("");

  // MOCK DATA
  const missionsMock = [
    { code: "LI-220326-001", start: "2026-03-22T08:00", driver: "Tomo Angela", quarter: "Bonaberi", status: "IN_PROGRESS" },
    { code: "LI-220326-002", start: "2026-03-22T10:30", driver: "Bala Andegue", quarter: "Quartier B Nkongsamba", status: "DONE" },
    { code: "SW-210326-001", start: "2026-03-21T09:00", driver: "Owona Matteo", quarter: "Buea Town", status: "IN_PROGRESS" },
  ];

  // FILTRAGE
  const filteredMissions = missionsMock.filter(m => {
    // Date
    if (dateFilter) {
      const missionDate = m.start.split("T")[0];
      if (missionDate !== dateFilter) return false;
    }

    // Status
    if (statusFilter !== "ALL" && m.status !== statusFilter) return false;

    // Search
    if (search) {
      if (searchBy === "code" && !m.code.toLowerCase().includes(search.toLowerCase())) return false;
      if (searchBy === "chauffeur" && !m.driver.toLowerCase().includes(search.toLowerCase())) return false;
    }

    return true;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Liste des missions</h1>
        </div>

        <button
          onClick={() => router.push("/admin/newMission")}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
        >
          <Plus size={18} /> Nouvelle mission
        </button>
      </div>

      {/* FILTRES + RECHERCHE */}
      <div className="flex flex-wrap gap-4 items-center">

        {/* DATE */}
        <div className="flex flex-col">
          <label className="text-gray-600 text-sm flex items-center gap-2">
            Date
            {dateFilter === new Date().toISOString().split('T')[0] && (
              <>
                <span className="ml-3">-</span>
                <span className="ml-3 font-bold text-green-600">Aujourd'hui</span>
              </>
            )}
            {dateFilter === new Date(Date.now() - 86400000).toISOString().split('T')[0] && (
              <>
                <span className="ml-3">-</span>  
                <span className="ml-3 font-bold text-orange-400">Hier</span>
              </> 
            )}
          </label>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input bg-white"
          />
        </div>

        {/* STATUS */}
        <div className="flex flex-col">
          <label className="text-gray-600 text-sm">Statut</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input bg-white"
          >
            <option value="ALL">Toutes</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="DONE">Terminées</option>
          </select>
        </div>

        {/* SEARCHBY */}
        <div className="flex flex-col">
          <label className="text-gray-600 text-sm">Rechercher par</label>
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="input bg-white"
          >
            <option value="code">Code</option>
            <option value="chauffeur">Chauffeur</option>
          </select>
        </div>

        {/* SEARCH */}
        <div className="flex flex-col flex-1">
          <label className="text-gray-600 text-sm">Recherche</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Rechercher par ${searchBy}`}
            className="input w-full"
          />
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-600 text-gray-200">
            <tr className="text-left">
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Début</th>
              <th className="px-6 py-4">Chauffeur</th>
              <th className="px-6 py-4">Quartier</th>
              <th className="px-6 py-4">Statut</th>
            </tr>
          </thead>

          <tbody>
            {filteredMissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                  Aucune mission
                </td>
              </tr>
            ) : (
              filteredMissions.map(m => (
                <tr key={m.code} className="border-t border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium">{m.code}</td>
                  <td className="px-6 py-4">{new Date(m.start).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td>             
                  <td className="px-6 py-4">{m.driver}</td>
                  <td className="px-6 py-4">{m.quarter}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      m.status === "IN_PROGRESS"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {m.status === "IN_PROGRESS" ? "En cours" : "Terminée"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}