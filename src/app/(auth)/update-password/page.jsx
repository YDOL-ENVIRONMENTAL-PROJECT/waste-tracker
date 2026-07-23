"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/services/auth";

export default function UpdatePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  // Validations logiques
  const isIdentical = oldPassword !== "" && newPassword !== "" && oldPassword === newPassword;
  const isFormValid = oldPassword.trim() !== "" && newPassword.trim() !== "" && !isIdentical;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError("");
    setSuccess(false);

    // Remplacez par votre méthode de service appropriée (ex: updatePassword)
    const result = await auth.updatePassword({ oldPassword, newPassword });

    if (result.success) {
      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
    } else {
      setError(result.error || "Une erreur s'est produite lors de la modification");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const user = auth.getCurrentUser();
    if (user){
      setUserRole(user.role);
    }
  }, []);

  const profileLink = userRole === "ADMIN" || userRole === "SUPER_ADMIN" ? "/admin/profile" : "client/profile";
  
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-green-50">
      {/* SECTION FORMULAIRE */}
      <div className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          <Link
            href={profileLink}
            className="text-green-600 font-medium mb-6 inline-block hover:underline"
          >
            ← Retour au profil
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Modifier le mot de passe
            </h1>

            <p className="text-gray-500 mb-6">
              Assurez la sécurité de votre compte en choisissant un mot de passe robuste.
            </p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">
                  Votre mot de passe a été modifié avec succès !
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Ancien mot de passe"
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    setError("");
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 disabled:bg-gray-100"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  className={`w-full p-3 border rounded-lg focus:outline-none disabled:bg-gray-100 transition-colors ${
                    isIdentical 
                      ? "border-red-500 focus:border-red-500 bg-red-50" 
                      : "border-gray-300 focus:border-green-500"
                  }`}
                  required
                  disabled={isLoading}
                />
                {isIdentical && (
                  <p className="text-red-600 text-xs mt-1 font-medium">
                    Le nouveau mot de passe doit être différent de l'ancien.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? "Modification en cours..." : "Mettre à jour le mot de passe"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* SECTION IMAGE */}
      <div className="hidden lg:flex items-center justify-center bg-green-600 p-12">
        <div className="text-center">
          <div className="mb-8">
            <svg
              className="w-24 h-24 mx-auto text-white opacity-80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Sécurisez votre compte
          </h2>

          <p className="text-gray-200 max-w-md">
            Un mot de passe fort combine des lettres, des chiffres et des caractères spéciaux pour une sécurité maximale.
          </p>
        </div>
      </div>
    </div>
  );
}