"use client";

import { useState } from "react";

export default function AdminEditModal({ admin, onClose }) {

  const [formData, setFormData] = useState(admin);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const save = () => {
    console.log("Admin updated:", formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg animate-scale-in">

        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Modifier administrateur
        </h2>

        <div className="space-y-4">

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Nom complet
            </label>
            <input
              value={`${formData.name} ${formData.surname}`}
              readOnly
              className="input w-full mt-1 bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Téléphone
            </label>
            <input
              value={formData.phone}
              readOnly
              className="input w-full mt-1 bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Adresse email
            </label>
            <input
              value={formData.email}
              readOnly
              className="input w-full mt-1 bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Site
            </label>
            <input
              name="site"
              value={formData.site}
              onChange={handleChange}
              className="input w-full mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Ville
            </label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="input w-full mt-1"
            />
          </div>

        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="btn-danger flex-1">
            Annuler
          </button>
          <button onClick={save} className="btn-primary flex-1">
            Enregistrer
          </button>
        </div>

      </div>
    </div>
  );
}