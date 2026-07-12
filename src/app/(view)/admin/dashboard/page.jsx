"use client";

import { useState } from "react";
import { Trash2, Truck, Users, ClipboardList } from "lucide-react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export default function Dashboard() {

  const [missionFilter, setMissionFilter] = useState("ALL");

  // MOCK DATA
  const stats = {
    activeBins: 20,
    drivers: 12,
    clients: 58
  };

  const missions = [
    { id: 1, status: "IN_PROGRESS" },
    { id: 2, status: "DONE" },
    { id: 3, status: "IN_PROGRESS" },
    { id: 4, status: "DONE" }
  ];

  const filteredMissions = missions.filter(m => {
    if (missionFilter === "ALL") return true;
    if (missionFilter === "IN_PROGRESS") return m.status === "IN_PROGRESS";
    if (missionFilter === "DONE") return m.status === "DONE";
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Vue d’ensemble des activités
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <Card icon={<Trash2 />} title="Bacs actifs" value={stats.activeBins} color="green" />
        <Card icon={<Truck />} title="Chauffeurs actifs" value={stats.drivers} color="orange" />
        <Card icon={<Users />} title="Clients" value={stats.clients} color="blue" />
        <Card icon={<ClipboardList />} title="Missions du jour" value={missions.length} color="purple" />

      </div>

      {/* MISSIONS SECTION */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

        <div className="flex justify-between items-center mb-4">

          <h2 className="text-lg font-semibold text-gray-800">
            Missions du jour
          </h2>

          {/* FILTER */}
          <div className="flex gap-2">

            <FilterBtn label="Toutes" value="ALL" state={missionFilter} setState={setMissionFilter} />
            <FilterBtn label="En cours" value="IN_PROGRESS" state={missionFilter} setState={setMissionFilter} />
            <FilterBtn label="Terminées" value="DONE" state={missionFilter} setState={setMissionFilter} />

          </div>

        </div>

        {/* LIST */}
        {filteredMissions.length === 0 ? (
          <p className="text-gray-500">Aucune mission</p>
        ) : (
          <div className="space-y-3">

            {filteredMissions.map((m) => (
              <div
                key={m.id}
                className="flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50"
              >
                <span className="font-medium">Mission #{m.id}</span>

                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    m.status === "IN_PROGRESS"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {m.status === "IN_PROGRESS" ? "En cours" : "Terminée"}
                </span>
              </div>
            ))}

          </div>
        )}

      </div>

      {/* SECONDARY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CITY DISTRIBUTION */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">
            Répartition des bacs par ville
          </h2>

          <ul className="space-y-2 text-gray-600">
            <li>Yaoundé — 12</li>
            <li>Douala — 8</li>
          </ul>
        </div>

        {/* ACTIVITY */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">
            Activité récente
          </h2>

          <ul className="space-y-2 text-gray-600 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircleIcon className="text-green-500" fontSize="small" />
              Mission #4 terminée
            </li>
            <li className="flex items-center gap-2">
              <LocalShippingIcon className="text-blue-500" fontSize="small" />
              Chauffeur assigné
            </li>
            <li className="flex items-center gap-2">
              <DeleteOutlineIcon className="text-red-500" fontSize="small" />
              Nouveau bac ajouté
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}

/* COMPONENTS */

function Card({ icon, title, value, color }) {

  const colors = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600"
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">

      <div className={`p-3 rounded-xl ${colors[color]}`}>
        {icon}
      </div>

      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
      </div>

    </div>
  );
}

function FilterBtn({ label, value, state, setState }) {
  return (
    <button
      onClick={() => setState(value)}
      className={`px-3 py-1 rounded-lg text-sm ${
        state === value
          ? "bg-green-600 text-white"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </button>
  );
}