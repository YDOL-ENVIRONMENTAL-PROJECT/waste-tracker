"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SuccessModal from "@/components/layout/Modals/SuccessModal";
import ErrorModal from "@/components/layout/Modals/ErrorModal";
import ConfirmationModal from "@/components/layout/Modals/ConfirmationModal";

export default function AddDriver() {

  const router = useRouter();

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [formData, setFormData] = useState({
    profilePicture: null,
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    town: "",
    quarter: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profilePicture") {
      setFormData({
        ...formData,
        profilePicture: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setShowConfirmation(false);

    try {
      // Prepare FormData (important for file upload)
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      console.log("Driver created:", formData);

      // 👉 Future: connect to backend here
      // await fetch("/api/drivers", {
      //   method: "POST",
      //   body: data
      // });

      setShowSuccess(true);

    } catch (error) {
      console.error(error);
      setShowError(true);
    }
  };

  return (

    <div className="bg-green-50 flex justify-center p-4 sm:p-6 md:p-10">

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">

        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          Ajouter un chauffeur
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* PHOTO */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm text-gray-600">
                Photo de profil
              </label>
              <input
                type="file"
                name="profilePicture"
                accept="image/*"
                onChange={handleChange}
                className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100"
              />
            </div>

            {/* FIRST NAME */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Prénom</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            {/* LAST NAME */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Nom</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            {/* PHONE */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            {/* EMAIL */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            {/* DOB */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">
                Date de naissance
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            {/* TOWN */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Ville</label>
              <input
                type="text"
                name="town"
                value={formData.town}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            {/* QUARTER */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm text-gray-600">Quartier</label>
              <input
                type="text"
                name="quarter"
                value={formData.quarter}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 pt-6">

            <button
              type="button"
              onClick={() => router.push("/admin/driverList")}
              className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-red-500 hover:text-white transition"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Enregistrer
            </button>

          </div>

        </form>

      </div>

      {/* MODALS */}
      {showConfirmation && (
        <ConfirmationModal
          message="Créer ce chauffeur ?"
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmation(false)}
        />
      )}

      {showSuccess && (
        <SuccessModal
          message="Chauffeur ajouté avec succès !"
          onClose={() => {
            setShowSuccess(false);
            router.push("/admin/driverList");
          }}
        />
      )}

      {showError && (
        <ErrorModal
          message="Erreur lors de l'ajout du chauffeur."
          onClose={() => setShowError(false)}
        />
      )}

    </div>
  );
}