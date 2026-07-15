"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SuccessModal from "@/components/layout/Modals/SuccessModal";
import ErrorModal from "@/components/layout/Modals/ErrorModal";
import ConfirmationModal from "@/components/layout/Modals/ConfirmationModal";
import { admins } from "@/services/admin";

export default function AddAdmin() {

  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    site: "",
    role: "ADMIN",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);

    const tempPassword = Math.random().toString(36).slice(2, 10);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        site: formData.site,
        role: formData.role,
        profilePicture: null,
        status: "OFFLINE",
        password: tempPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await admins.create(payload);

      if (result.success) {
        console.log("Admin created :", result.data);

        setGeneratedPassword(tempPassword);
        setShowSuccess(true);
      } else {
        console.error("Error creating admin:", result.error);
        setShowError(true);
      }  
    } catch (error) {
      console.error("Error creating admin:", error);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    <div className="bg-green-50 flex justify-center p-10">

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-10">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          Créer un nouvel administrateur
        </h1>


        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* NOM */}
            <div className="flex flex-col gap-1">

              <label className="text-sm text-gray-600">
                Nom
              </label>

              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />

            </div>


            {/* PRENOM */}
            <div className="flex flex-col gap-1">

              <label className="text-sm text-gray-600">
                Prénom
              </label>

              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />

            </div>


            {/* TEL */}
            <div className="flex flex-col gap-1">

              <label className="text-sm text-gray-600">
                Téléphone
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />

            </div>


            {/* EMAIL */}
            <div className="flex flex-col gap-1">

              <label className="text-sm text-gray-600">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />

            </div>


            {/* SITE */}
            <div className="flex flex-col gap-1">

              <label className="text-sm text-gray-600">
                Site
              </label>

              <input
                type="text"
                name="site"
                value={formData.site}
                onChange={handleChange}
                required
                className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />

            </div>

            {/* ROLE */}
            <div className="flex flex-col gap-1">

              <label className="text-sm text-gray-600">
                Rôle
              </label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-100 outline-none"
              >

                <option value="ADMIN">
                  ADMIN
                </option>

                <option value="SUPER_ADMIN">
                  SUPER_ADMIN
                </option>

              </select>

            </div>

          </div>


          {/* BUTTONS */}
          <div className="flex justify-end gap-4 pt-6">

            <button
              type="button"
              onClick={() => router.push("/admin/adminList")}
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
          message="Êtes-vous sûr de vouloir créer cet administrateur ?"
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmation(false)}
        />
      )}

      {showSuccess && (
        <SuccessModal
          message={
            <div className="space-y-4">
              <p>L'administrateur a été créé avec succès !</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                <span className="block text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                  Mot de passe généré par défaut
                </span>
                <span className="text-lg font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded select-all border border-emerald-100">
                  {generatedPassword}
                </span>
              </div>
              <p className="text-xs text-gray-500 italic">
                Pensez à copier ce mot de passe pour le transmettre au nouvel administrateur.
              </p>
            </div>
          }
          onClose={() => {
            setShowSuccess(false);
            router.push("/admin/adminList");
          }}
        />
      )}

      {showError && (
        <ErrorModal
          message="Une erreur est survenue lors de la création de l'administrateur."
          onClose={() => setShowError(false)}
        />
      )}

    </div>

  );
}