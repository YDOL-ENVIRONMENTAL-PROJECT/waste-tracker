"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SuccessModal from "@/components/layout/Modals/SuccessModal";
import ErrorModal from "@/components/layout/Modals/ErrorModal";
import ConfirmationModal from "@/components/layout/Modals/ConfirmationModal";

export default function AddVehicle() {

  const router = useRouter();

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [formData, setFormData] = useState({
    photo: null,
    brand: "",
    model: "",
    name: "",
    maxCapacity: "",
    nbPlaces: ""
  });

  const [preview, setPreview] = useState(null);

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo") {
      const file = files[0];

      setFormData({
        ...formData,
        photo: file
      });

      if (file) {
        setPreview(URL.createObjectURL(file));
      }

    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setShowConfirmation(false);

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      console.log("Vehicle created:", formData);

      // 👉 FUTURE BACKEND
      // await fetch("/api/vehicles", {
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

    <div className="bg-green-50 flex justify-center p-10">

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-10">

        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          Ajouter un véhicule
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* PHOTO */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm text-gray-600">Photo</label>

              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleChange}
                className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100"
              />

              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="w-40 h-40 object-cover rounded-lg border"
                />
              )}
            </div>

            {/* BRAND */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Marque</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            {/* MODEL */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Modèle</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* NAME */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Nom</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            {/* MAX CAPACITY */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">
                Capacité max (kg)
              </label>
              <input
                type="number"
                name="maxCapacity"
                value={formData.maxCapacity}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            {/* NUMBER OF PLACES */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">
                Nombre de places
              </label>
              <input
                type="number"
                name="maxCapacity"
                value={formData.nbPlaces}
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
              onClick={() => router.push("/admin/vehicleList")}
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
          message="Créer ce véhicule ?"
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmation(false)}
        />
      )}

      {showSuccess && (
        <SuccessModal
          message="Véhicule ajouté avec succès !"
          onClose={() => {
            setShowSuccess(false);
            router.push("/admin/vehicleList");
          }}
        />
      )}

      {showError && (
        <ErrorModal
          message="Erreur lors de l'ajout du véhicule."
          onClose={() => setShowError(false)}
        />
      )}

    </div>
  );
}