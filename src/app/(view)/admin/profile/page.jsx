"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import SaveIcon from "@mui/icons-material/Save";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CancelIcon from "@mui/icons-material/Cancel"; // Nouvel import pour supprimer la photo
import { User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { fetchCurrentUserProfile, updateProfile } from "@/services/user";
import { LoadingIcon } from "@/components/ui/Loading";

export default function AdminProfile() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // État pour le chargement de la sauvegarde
  const [error, setError] = useState("");
  const [admin, setAdmin] = useState(null);
  
  const fileInputRef = useRef(null);

  // Fonction isolée pour charger ou rafraîchir le profil depuis le backend
  const loadProfile = async () => {
    try {
      const response = await fetchCurrentUserProfile();
      console.log("Profil utilisateur :", response);
      const profile = response?.data || response;
      
      setAdmin({
        id: profile?.id,
        firstName: profile?.firstName || profile?.name || "",
        lastName: profile?.lastName || profile?.surname || "",
        email: profile?.email || authUser?.email || "",
        phone: profile?.phone || "",
        site: profile?.site || "",
        role: profile?.role || authUser?.role,
        photo: profile?.profilePicture || "",
      });
    } catch (err) {
      setError(err.message || "Impossible de charger le profil");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadProfile();
    }
  }, [authLoading, authUser]);

  const handleChange = (e) => {
    setAdmin({
      ...admin,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdmin((prev) => ({
          ...prev,
          photo: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Fonction pour supprimer la photo actuelle
  const handleRemovePhoto = () => {
    setAdmin((prev) => ({
      ...prev,
      photo: "", // Réinitialise l'image côté front
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Réinitialise l'input file HTML
    }
  };

  const saveChanges = async () => {
    if (!admin?.id) return;

    setIsSaving(true); // Active l'écran de chargement de sauvegarde
    setError("");

    const payload = {
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phone,
      site: admin.site,
      role: admin.role,
      profilePicture: admin.photo && admin.photo.trim() !== "" ? admin.photo : null, // Si vide, envoie null pour supprimer sur le serveur
    };

    try {
      // 1. Envoi des modifications au backend
      const result = await updateProfile(payload);

      if (result.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(result.data));
        }
      
        // 2. GET des nouvelles infos fraîches du backend avant de couper le loading
        await loadProfile();
        setIsEditing(false);
      } else {
        setError(result.error || "Impossible de mettre à jour le profil");
      }
    } catch (err) {
      setError(err.message || "Impossible de mettre à jour le profil");
    } finally {
      setIsSaving(false); // Désactive le chargement dans tous les cas
    }
  };

  // Rendu de chargement initial OU pendant la sauvegarde/rafraîchissement
  if (authLoading || isLoading || isSaving) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-green-50 p-20 rounded-2xl">
        <LoadingIcon size="lg" />
        <p className="text-emerald-700 font-medium mt-6 animate-pulse">
          {isSaving ? "Enregistrement et synchronisation des données..." : "Chargement du profil..."}
        </p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="w-full flex justify-center bg-green-50 p-10">
        <p className="text-red-600">{error || "Profil introuvable"}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center bg-green-50 p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Mon Profil Admin
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <div className="w-50 h-50 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {admin.photo ? (
                <Image
                  src={admin.photo}
                  alt="photo profil"
                  width={200}
                  height={200}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User size={48} />
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />

            {isEditing && (
              <div className="absolute bottom-0 right-0 flex gap-2 translate-y-2">
                {/* Bouton pour changer/ajouter une photo */}
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="bg-green-600 text-white p-2 rounded-full shadow hover:bg-green-700 transition"
                  title="Changer de photo"
                >
                  <CameraAltIcon fontSize="small" />
                </button>
                
                {/* Bouton de suppression (affiché uniquement s'il y a une photo) */}
                {admin.photo && (
                  <button 
                    onClick={handleRemovePhoto}
                    className="bg-red-600 text-white p-2 rounded-full shadow hover:bg-red-700 transition"
                    title="Supprimer la photo"
                  >
                    <CancelIcon fontSize="small" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-xl mx-auto">
          {/* Champs de formulaires restants identiques... */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Prénom</label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={admin.firstName}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-800">{admin.firstName}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Nom</label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={admin.lastName}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-800">{admin.lastName}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Numéro de téléphone</label>
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={admin.phone}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-800">{admin.phone || "—"}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Adresse mail</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={admin.email}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-800">{admin.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Site administré</label>
            {isEditing ? (
              <input
                type="text"
                name="site"
                value={admin.site}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-gray-700">{admin.site || "—"}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Rôle</label>
            <p className="text-gray-700">{admin.role}</p>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-12">
          {isEditing ? (
            <button
              onClick={saveChanges}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              <SaveIcon />
              Enregistrer
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              <EditIcon />
              Modifier profil
            </button>
          )}

          <Link
            href="/update-password"
            className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            <LockResetIcon />
            Modifier mot de passe
          </Link>
        </div>
      </div>
    </div>
  );
}