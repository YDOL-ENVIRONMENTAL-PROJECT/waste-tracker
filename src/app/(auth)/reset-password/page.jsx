"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/services/auth";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");
    setPasswordError("");
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return false;
    }

    if (formData.password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("Token invalide. Demandez un nouveau lien de réinitialisation.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await auth.resetPassword(
      token,
      formData.password,
      formData.confirmPassword
    );

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/connexion");
      }, 2000);
    } else {
      setError(result.error || "Erreur lors de la réinitialisation du mot de passe");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-green-50">
      {/* SECTION FORMULAIRE */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link
            href="/connexion"
            className="text-green-600 font-medium mb-6 inline-block hover:underline"
          >
            ← Retour à la connexion
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Réinitialiser le mot de passe
            </h1>

            <p className="text-gray-500 mb-6">
              Entrez votre nouveau mot de passe.
            </p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">
                  Mot de passe réinitialisé avec succès. Redirection vers la connexion...
                </p>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="password"
                  name="password"
                  placeholder="Nouveau mot de passe"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-style"
                  required
                  disabled={isLoading}
                />

                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmer le mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-style"
                    required
                    disabled={isLoading}
                  />
                  {passwordError && (
                    <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                </button>
              </form>
            )}
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
            Choisissez un mot de passe fort pour protéger votre compte.
          </p>
        </div>
      </div>
    </div>
  );
}
