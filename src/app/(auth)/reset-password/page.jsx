"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/services/auth";

function ResetPasswordContent() {
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
    setFormData({ ...formData, [name]: value });
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
      setError("Token invalide. Demandez un nouveau lien.");
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    const result = await auth.resetPassword(
      token,
      formData.password,
      formData.confirmPassword
    );

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push("/connexion"), 2000);
    } else {
      setError(result.error || "Erreur lors de la réinitialisation");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-green-50">
      {/* ton UI inchangé */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link href="/connexion" className="text-green-600 mb-6 inline-block">
            ← Retour
          </Link>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Réinitialiser
            </h1>

            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">Succès ✔</p>}

            {!success && (
              <form onSubmit={handleSubmit}>
                <input
                  type="password"
                  name="password"
                  placeholder="Nouveau mot de passe"
                  value={formData.password}
                  onChange={handleChange}
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmer"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button disabled={!token || isLoading}>
                  Reset
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}