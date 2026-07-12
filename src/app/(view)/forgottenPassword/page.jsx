"use client";

import { useState } from "react";
import Link from "next/link";
import { LockReset } from "@mui/icons-material";

export default function ForgottenPassword() {

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    console.log("Password update:", formData);
  };

  return (

    <div className="w-full flex justify-center p-10 bg-green-50">

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-10">

        <div className="flex flex-col items-center mb-8">

          <LockReset className="text-green-600 mb-2" fontSize="large" />

          <h1 className="text-2xl font-bold text-gray-800">
            Modifier le mot de passe
          </h1>

          <p className="text-gray-500 text-sm mt-1 text-center">
            Entrez votre ancien mot de passe puis choisissez un nouveau mot de passe sécurisé.
          </p>

        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Ancien mot de passe */}
          <div className="flex flex-col gap-1">

            <label className="text-sm text-gray-600">
              Ancien mot de passe
            </label>

            <input
              type="password"
              name="oldPassword"
              placeholder="veuillez entrer votre ancien mot de passe"
              value={formData.oldPassword}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

          </div>


          {/* Nouveau mot de passe */}
          <div className="flex flex-col gap-1">

            <label className="text-sm text-gray-600">
              Nouveau mot de passe
            </label>

            <input
              type="password"
              name="newPassword"
              placeholder="veuillez entrer le nouveau mot de passe"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

          </div>


          {/* Confirmation */}
          <div className="flex flex-col gap-1">

            <label className="text-sm text-gray-600">
              Confirmer le nouveau mot de passe
            </label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="veuillez confirmer le nouveau mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

          </div>


          {/* Boutons */}
          <div className="flex justify-between items-center pt-4">

            <Link
              href="/admin/profile"
              className="text-gray-500 hover:underline hover:text-red-400"
            >
              Retour au profil
            </Link>

            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Enregistrer
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}