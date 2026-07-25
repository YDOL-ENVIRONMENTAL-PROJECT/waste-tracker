"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/services/auth";
import { notify } from "@/lib/notify";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await auth.login(formData.email, formData.password);

    if (result.success) {
      notify.success("Connexion réussie");

      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("rememberEmail", formData.email);
      }

      const user = result.data;
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        router.push("/admin/dashboard");
      } else if (user.role === "CLIENT") {
        router.push("/client/dashboard");
      } else {
        router.push("/");
      }
    } else {
      notify.error(
        result.error || "Impossible de se connecter. Vérifiez vos identifiants.",
        result.technical
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-green-50">
      {/* SECTION FORMULAIRE */}
      <div className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="text-green-600 font-medium mb-6 inline-block hover:underline"
          >
            ← Retour à l'accueil
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Bon retour 👋
            </h1>

            <p className="text-gray-500 mb-6">
              Connectez-vous pour accéder à votre tableau de bord.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="input-style"
                required
                disabled={isLoading}
              />

              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mot de passe"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-style pr-10 w-full"
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

              <div className="flex justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  Se souvenir
                </label>

                <Link
                  href="/forgot-password"
                  className="text-green-600 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </button>
            </form>

            <p className="text-center text-gray-500 mt-6">
              Pas encore de compte ?
              <Link
                href="/inscription"
                className="text-green-600 ml-2 font-semibold hover:underline"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* SECTION IMAGE */}
      <div className="hidden lg:flex items-center justify-center bg-green-600 p-12">
        <div className="text-center">
          <img
            src="/assets/login-image.jpeg"
            alt="Waste tracker"
            className="w-full max-w-sm mx-auto rounded-xl mb-8 shadow-lg"
          />

          <h2 className="text-3xl font-bold text-white mb-4">
            Gérez vos collectes facilement
          </h2>

          <p className="text-gray-300 max-w-md">
            Accédez à votre espace personnel pour suivre les collectes,
            recevoir les notifications et participer à un environnement plus propre.
          </p>
        </div>
      </div>
    </div>
  );
}