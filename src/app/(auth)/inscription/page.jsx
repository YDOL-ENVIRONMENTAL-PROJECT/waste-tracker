"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { auth } from "@/services/auth";

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Register() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    accountType: "INDIVIDUAL",
    firstName: "",
    lastName: "",
    name: "",
    email: "",
    phone: "",
    town: "",
    quarter: "",
    password: "",
    confirmPassword: "",
    profilePicture: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");
    setPasswordError("");
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readImageAsDataUrl(file);
      setFormData({
        ...formData,
        profilePicture: dataUrl,
      });
      setError("");
    } catch {
      setError("Impossible de charger la photo de profil");
    }
  };

  const validateForm = () => {
    if (formData.accountType === "INDIVIDUAL") {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError("Le prénom et le nom sont requis pour un compte particulier");
        return false;
      }
    } else if (!formData.name.trim()) {
      setError("Le nom de l'entreprise est requis pour un compte entreprise");
      return false;
    }

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

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    const registerData = {
      accountType: formData.accountType,
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: formData.accountType === "ENTERPRISE" ? formData.name : "",
      email: formData.email,
      phone: formData.phone,
      town: formData.town,
      quarter: formData.quarter,
      password: formData.password,
      profilePicture: formData.profilePicture || null,
    };

    const result = await auth.register(registerData);

    if (result.success) {
      // Redirect to appropriate dashboard based on role
      const user = result.data;
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        router.push("/admin/dashboard");
      } else if (user.role === "CLIENT") {
        router.push("/client/dashboard");
      } else if (user.role === "DRIVER") {
        router.push("/driver/dashboard");
      } else {
        router.push("/");
      }
    } else {
      setError(result.error || "Une erreur s'est produite lors de l'inscription");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* SECTION GAUCHE */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-linear-to-br from-green-500 to-green-700 text-white p-16">
        <img
          src="/assets/create-account-image.png"
          alt="Waste collection"
          className="w-105 mb-10 rounded-xl shadow-2xl"
        />

        <h2 className="text-4xl font-bold mb-6 text-center">
          Rejoignez Waste Tracker
        </h2>

        <p className="text-lg text-center max-w-md opacity-90 leading-relaxed">
          Recevez les notifications de collecte, signalez les bacs pleins
          et contribuez à garder votre ville propre grâce à une gestion
          intelligente des déchets.
        </p>
      </div>

      {/* SECTION FORMULAIRE */}
      <div className="flex items-center justify-center bg-green-50 p-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="text-green-600 font-medium mb-6 inline-block hover:underline"
          >
            ← Retour à l'accueil
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-10">
            <h1 className="text-3xl font-bold text-center text-green-600 mb-8">
              Créer un compte
            </h1>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {formData.profilePicture ? (
                    <Image
                      src={formData.profilePicture}
                      alt="Photo de profil"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <User size={36} className="text-gray-400" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="text-sm text-green-600 font-medium hover:underline disabled:text-gray-400"
                >
                  {formData.profilePicture ? "Changer la photo" : "Ajouter une photo de profil"}
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, accountType: "INDIVIDUAL" })}
                  className={`flex-1 rounded-lg border px-4 py-2 font-semibold transition ${formData.accountType === "INDIVIDUAL" ? "border-green-600 bg-green-600 text-white" : "border-gray-300 text-gray-700"}`}
                >
                  Particulier
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, accountType: "ENTERPRISE" })}
                  className={`flex-1 rounded-lg border px-4 py-2 font-semibold transition ${formData.accountType === "ENTERPRISE" ? "border-green-600 bg-green-600 text-white" : "border-gray-300 text-gray-700"}`}
                >
                  Entreprise
                </button>
              </div>

              {formData.accountType === "INDIVIDUAL" ? (
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Prénom"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-style"
                    required
                    disabled={isLoading}
                  />

                  <input
                    type="text"
                    name="lastName"
                    placeholder="Nom"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-style"
                    required
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <input
                  type="text"
                  name="name"
                  placeholder="Nom de l'entreprise"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-style"
                  required
                  disabled={isLoading}
                />
              )}

              <input
                type="email"
                name="email"
                placeholder="Adresse email"
                value={formData.email}
                onChange={handleChange}
                className="input-style"
                required
                disabled={isLoading}
              />

              <input
                type="tel"
                name="phone"
                placeholder="Téléphone"
                value={formData.phone}
                onChange={handleChange}
                className="input-style"
                required
                disabled={isLoading}
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="town"
                  placeholder="Ville"
                  value={formData.town}
                  onChange={handleChange}
                  className="input-style"
                  required
                  disabled={isLoading}
                />

                <input
                  type="text"
                  name="quarter"
                  placeholder="Quartier"
                  value={formData.quarter}
                  onChange={handleChange}
                  className="input-style"
                  required
                  disabled={isLoading}
                />
              </div>

              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
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
                disabled={isLoading}
                className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Inscription en cours..." : "S'inscrire"}
              </button>
            </form>

            <p className="text-center text-gray-500 mt-6">
              Vous avez déjà un compte ?
              <Link
                href="/connexion"
                className="text-green-600 ml-2 font-semibold hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}