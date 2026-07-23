"use client";

import { useState, useEffect } from "react";
import { Trash2, Truck, Users, ClipboardList } from "lucide-react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import { garbagebins } from "@/services/garbagebin"; 
import { drivers } from "@/services/driver";
import { clients } from "@/services/client";
import { missions as missionsService } from "@/services/mission";

export default function Dashboard() {
  const [missionFilter, setMissionFilter] = useState("ALL");
  
  const [stats, setStats] = useState({
    activeBins: 0,
    drivers: 0,
    clients: 0,
  });
  
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const [binsRes, driversRes, clientsRes, missionsRes] = await Promise.all([
          garbagebins.getCount(),
          drivers.getCount(),
          clients.getCount(),
          missionsService.getAll(),
        ]);

        setStats({
          activeBins: binsRes.success ? (binsRes.data?.count ?? binsRes.data) : 0,
          drivers: driversRes.success ? (driversRes.data?.count ?? driversRes.data) : 0,
          clients: clientsRes.success ? (clientsRes.data?.count ?? clientsRes.data) : 0,
        });

        if (missionsRes.success) {
          setMissions(missionsRes.data || []);
        }
      } catch (error) {
        console.error("Erreur critique lors du chargement du Dashboard :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const filteredMissions = missions.filter(m => {
    if (missionFilter === "ALL") return true;
    return m.status === missionFilter;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Vue d’ensemble des activités</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          icon={<Trash2 />} 
          title="Bacs actifs" 
          value={isLoading ? "..." : stats.activeBins} 
          color="green" 
        />
        <Card 
          icon={<Truck />} 
          title="Chauffeurs actifs" 
          value={isLoading ? "..." : stats.drivers} 
          color="orange" 
        />
        <Card 
          icon={<Users />} 
          title="Clients" 
          value={isLoading ? "..." : stats.clients} 
          color="blue" 
        />
        <Card 
          icon={<ClipboardList />} 
          title="Missions du jour" 
          value={isLoading ? "..." : missions.length} 
          color="purple" 
        />
      </div>

      {/* MISSIONS SECTION */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Missions du jour</h2>

          <div className="flex gap-2">
            <FilterBtn label="Toutes" value="ALL" state={missionFilter} setState={setMissionFilter} />
            <FilterBtn label="En cours" value="IN_PROGRESS" state={missionFilter} setState={setMissionFilter} />
            <FilterBtn label="Terminées" value="DONE" state={missionFilter} setState={setMissionFilter} />
          </div>
        </div>

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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Répartition des bacs par ville</h2>
          <ul className="space-y-2 text-gray-600">
            <li>Yaoundé — 12</li>
            <li>Douala — 8</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Activité récente</h2>
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
              <DeleteOutlinedIcon className="text-red-500" fontSize="small" />
              Nouveau bac ajouté
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
}

/* COMPONENTS EN JAVASCRIPT BRUT */

function Card({ icon, title, value, color }) {
  const colors = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600"
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
      <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
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
        state === value ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </button>
  );
}