"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/services/auth";
import { notify } from "@/lib/notify";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      notify.error("Les mots de passe ne correspondent pas");
      return false;
    }
    if (formData.password.length < 6) {
      notify.warning("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      notify.error("Lien invalide. Demandez un nouveau lien.");
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);

    const result = await auth.resetPassword(
      token,
      formData.password,
      formData.confirmPassword
    );

    if (result.success) {
      notify.success("Mot de passe réinitialisé");
      setTimeout(() => router.push("/connexion"), 2000);
    } else {
      notify.error(
        result.error || "Impossible de réinitialiser le mot de passe",
        result.technical
      );
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
