"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/services/auth";
import { notify } from "@/lib/notify";
import { Eye, EyeOff } from "lucide-react";

export default function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Validations logiques
  const isIdentical = currentPassword !== "" && newPassword !== "" && currentPassword === newPassword;
  const isFormValid = currentPassword.trim() !== "" && newPassword.trim() !== "" && !isIdentical;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);

    const result = await auth.updatePassword({ currentPassword, newPassword });

    if (result.success) {
      notify.success("Mot de passe modifié avec succès");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      notify.error(
        result.error || "Impossible de modifier le mot de passe",
        result.technical
      );
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Ancien mot de passe"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 disabled:bg-gray-100"
                  required
                  disabled={isLoading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none"
                  disabled={isLoading}
                  title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    <EyeOff size={18} className="transition-colors" />
                  ) : (
                    <Eye size={18} className="transition-colors" />
                  )}
                </button>
              </div>

              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:outline-none disabled:bg-gray-100 transition-colors ${
                    isIdentical 
                      ? "border-red-500 focus:border-red-500 bg-red-50" 
                      : "border-gray-300 focus:border-green-500"
                  }`}
                  required
                  disabled={isLoading}
                  title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none"
                  disabled={isLoading}
                  title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    <EyeOff size={18} className="transition-colors" />
                  ) : (
                    <Eye size={18} className="transition-colors" />
                  )}
                </button>
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
