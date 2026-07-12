"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewMission() {

  const router = useRouter();

  const [type, setType] = useState("COLLECTE");
  const [name, setName] = useState("");
  const [depart, setDepart] = useState("");
  const [destination, setDestination] = useState("");

  const [selectedDriver, setSelectedDriver] = useState(null); // Valeur par défaut = null
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);

  // MOCK DRIVERS
  const drivers = [
    { id: 1, name: "Jean Mba", phone: "6 55 12 34 56", vehicle: "Toyota Hilux" },
    { id: 2, name: "Marie Ngono", phone: "6 77 89 10 11", vehicle: "Renault Master" },
    { id: 3, name: "Paul Tchami", phone: "6 99 87 65 43", vehicle: "Mercedes Sprinter" },
    { id: 4, name: "Sophie Ndong", phone: "6 66 77 88 99", vehicle: "IVECO Daily" },
    { id: 5, name: "Charles Essomba", phone: "6 55 44 33 22", vehicle: "Ford Transit" }
  ];

  const handleSubmit = () => {
    const payload = {
      type,
      name,
      depart: type === "TOURNEE" ? depart : null,
      destination,
      driver: selectedDriver
    };

    console.log("MISSION:", payload);

    // TODO: appel API

    router.push("/admin/missions");
  };

  const getNameLabel = () => {
    if (type === "COLLECTE") return "Code du bac";
    if (type === "COLLECTEVIP") return "Nom du client";
    if (type === "TOURNEE") return "Nom du quartier";
  };

  const handleSelectDriver = (driver) => {
    setSelectedDriver(driver);
    setIsDriverModalOpen(false);
  };

  useEffect(() => {
  if (isDriverModalOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}, [isDriverModalOpen]);

  return (
    <>
      <div className={`p-8 bg-gray-50 min-h-screen transition-all duration-300 ${isDriverModalOpen ? 'blur-sm' : ''}`}>
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">

          <h1 className="text-2xl font-bold text-gray-800">
            Nouvelle Mission
          </h1>

          {/* TYPE */}
          <div>
            <label className="text-sm text-gray-600">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input w-full mt-1 text-green-800 font-semibold bg-green-50"
            >
              <option value="COLLECTE">Collecte</option>
              <option value="COLLECTEVIP">Collecte VIP</option>
              <option value="TOURNEE">Tournée</option>
            </select>
          </div>

          {/* NOM */}
          <div>
            <label className="text-sm text-gray-600">
              {getNameLabel()}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full mt-1"
            />
          </div>

          {/* DEPART (UNIQUEMENT TOURNEE) */}
          {type === "TOURNEE" && (
            <div>
              <label className="text-sm text-gray-600">
                Point de départ
              </label>
              <input
                type="text"
                value={depart}
                onChange={(e) => setDepart(e.target.value)}
                className="input w-full mt-1"
              />
            </div>
          )}

          {/* DESTINATION */}
          <div>
            <label className="text-sm text-gray-600">
              Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="input w-full mt-1"
            />
          </div>

          {/* CHAUFFEUR - BOUTON DE SELECTION CLAIR */}
          <div>
            <label className="text-sm text-gray-600">
              Chauffeur
            </label>
            
            {selectedDriver ? (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                  {selectedDriver.name}
                </div>
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(true)}
                  className="px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Modifier
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsDriverModalOpen(true)}
                className="w-full mt-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-left hover:border-green-500 hover:bg-green-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-gray-500 group-hover:text-green-600">
                    Sélectionner un chauffeur
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 pt-4">

            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Annuler
            </button>

            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Attribuer
            </button>

          </div>

        </div>
      </div>

      {/* MODAL - LISTE DES CHAUFFEURS AVEC BLUR BACKGROUND */}
      {isDriverModalOpen && (
        <>
          {/* Overlay flou transparent */}
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-md z-40"
            onClick={() => setIsDriverModalOpen(false)}
          />

          {/* Modal centrée - sans flou */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Choisir un chauffeur
                </h2>
                <button
                  onClick={() => setIsDriverModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Liste */}
              <div className="overflow-y-auto flex-1 p-5 space-y-3">
                {drivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => handleSelectDriver(driver)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      selectedDriver?.id === driver.id
                        ? "border-green-500 bg-green-50/80 ring-2 ring-green-400/50"
                        : "border-gray-200 hover:border-green-400 hover:bg-green-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{driver.name}</p>
                        <p className="text-sm text-gray-600 mt-0.5">📞 {driver.phone}</p>
                        <p className="text-sm text-gray-600">🚛 {driver.vehicle}</p>
                      </div>
                      {selectedDriver?.id === driver.id && (
                        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 border-t bg-gray-50/80 rounded-b-2xl">
                <button
                  onClick={() => setIsDriverModalOpen(false)}
                  className="w-full px-5 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                >
                  {selectedDriver ? "Confirmer la sélection" : "Fermer"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}