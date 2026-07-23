"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SuccessModal from "@/components/layout/Modals/SuccessModal";
import ErrorModal from "@/components/layout/Modals/ErrorModal";
import ConfirmationModal from "@/components/layout/Modals/ConfirmationModal";

export default function AddGarbageBin() {

  const router = useRouter();

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [formData, setFormData] = useState({
    photo: null,
    town: "",
    quarter: "",
    description: ""
  });

  const [coordinates, setCoordinates] = useState({
    latitude: "",
    longitude: "",
    altitude: ""
  });

  const [preview, setPreview] = useState(null);

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo") {
      const file = files[0];

      setFormData({ ...formData, photo: file });

      // Preview image
      if (file) {
        setPreview(URL.createObjectURL(file));
      }

    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // AUTO GEOLOCATION
  useEffect(() => {
    if (formData.town && formData.quarter) {

      const fetchCoords = async () => {
        try {
          const res = await fetch(
            `/api/geocode?town=${formData.town}&quarter=${formData.quarter}`
          );

          const data = await res.json();

          if (data) {
            setCoordinates(data);
          }

        } catch (err) {
          console.error(err);
        }
      };

      fetchCoords();
    }
  }, [formData.town, formData.quarter]);

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

      // ajouter coordonnées
      data.append("latitude", coordinates.latitude);
      data.append("longitude", coordinates.longitude);
      data.append("altitude", coordinates.altitude);

      console.log("Garbage bin created:", formData, coordinates);

      // 👉 FUTURE API
      // await fetch("/api/bins", {
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
          Ajouter un bac à ordure
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
            <div className="flex flex-col gap-1">
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

            {/* DESCRIPTION */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm text-gray-600">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="input"
              />
            </div>

            {/* LATITUDE */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Latitude</label>
              <input
                value={coordinates.latitude}
                readOnly
                className="input bg-gray-100"
              />
            </div>

            {/* LONGITUDE */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Longitude</label>
              <input
                value={coordinates.longitude}
                readOnly
                className="input bg-gray-100"
              />
            </div>

            {/* ALTITUDE */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm text-gray-600">Altitude</label>
              <input
                value={coordinates.altitude}
                readOnly
                className="input bg-gray-100"
              />
            </div>

          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 pt-6">

            <button
              type="button"
              onClick={() => router.push("/admin/garbageBinList")}
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
          message="Créer ce bac ?"
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmation(false)}
        />
      )}

      {showSuccess && (
        <SuccessModal
          message="Bac ajouté avec succès !"
          onClose={() => {
            setShowSuccess(false);
            router.push("/admin/garbageBinList");
          }}
        />
      )}

      {showError && (
        <ErrorModal
          message="Erreur lors de l'ajout du bac."
          onClose={() => setShowError(false)}
        />
      )}

    </div>
  );
}