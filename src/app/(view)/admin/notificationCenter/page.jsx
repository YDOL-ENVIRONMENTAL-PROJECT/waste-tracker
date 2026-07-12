"use client";

import { useState } from "react";
import { Bell, Trash2 } from "lucide-react";

export default function NotificationCenter() {

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      sender: "Admin",
      message: "Une mission de collecte dans le quartier de 'Melen' a été assignée au chauffeur 'Tasse Arole'.",
      reason: "Nouvelle Mission",
      date: new Date()
    },
    {
      id: 2,
      sender: "System",
      message: `Le chauffeur 'Nzungang Freddy' a été ajouté avec succès au site de Douala.`,
      reason: "Ajout d'un chauffeur",
      date: new Date(Date.now() - 86400000) // hier
    },
    {
      id: 3,
      sender: "Admin",
      message: "Le bac à ordure 'LI-A001' a été supprimé",
      reason: "Gestion",
      date: new Date("2026-03-17")
    }
  ]);

  // SUPPRESSION
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // FORMAT DATE STYLE WHATSAPP
  const formatGroupDate = (date) => {
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Aujourd’hui";
    if (isYesterday) return "Hier";

    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    const dayName = date.toLocaleDateString("fr-FR", { weekday: "long" });

    if (diffDays <= 7) {
      return capitalize(dayName);
    }

    return `${capitalize(dayName)}, ${date.toLocaleDateString("fr-FR")}`;
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // GROUP BY DATE
  const grouped = notifications.reduce((acc, notif) => {
    const key = formatGroupDate(new Date(notif.date));

    if (!acc[key]) acc[key] = [];
    acc[key].push(notif);

    return acc;
  }, {});

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Centre de notifications
        </h1>
        <p className="text-gray-500">
          Toutes vos notifications récentes
        </p>
      </div>

      {/* EMPTY STATE */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
          <Bell size={50} />
          <p className="mt-4">Aucune notification</p>
        </div>
      ) : (

        <div className="space-y-8">

          {Object.entries(grouped).map(([date, notifs]) => (
            <div key={date}>

              {/* DATE HEADER */}
              <h2 className="text-sm text-gray-500 mb-3 font-medium">
                {date}
              </h2>

              <div className=" space-y-3">

                {notifs.map((n) => (
                  <div
                    key={n.id}
                    className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
                  >
                    <div>
                      <p className="text-green-800 font-bold">
                        message : <span className="text-black font-normal">{n.message}</span>
                      </p>
                      <p className="text-green-800 font-normal">
                        envoyé par : <span className="text-black font-light mr-3">{n.sender}</span> • <span className="ml-3"></span> objet : <span className="text-black font-light">{n.reason}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* HEURE */}
                      <span className="text-xs mr-3 text-gray-400">
                        {new Date(n.date).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>

                      {/* ACTION */}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}