"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import SaveIcon from "@mui/icons-material/Save";
import { User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { fetchCurrentUserProfile, updateProfile } from "@/services/user";

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ClientProfile() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [client, setClient] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (authLoading) return;

      try {
        const profile = await fetchCurrentUserProfile();
        setClient({
          id: profile?.id,
          accountType: profile?.accountType || "INDIVIDUAL",
          firstName: profile?.firstName || "",
          lastName: profile?.lastName || "",
          name: profile?.name || "",
          email: profile?.email || authUser?.email || "",
          phone: profile?.phone || "",
          town: profile?.town || "",
          quarter: profile?.quarter || "",
          type: profile?.type || "CLASSIC",
          photo: profile?.profilePicture || "",
        });
      } catch (err) {
        setError(err.message || "Impossible de charger le profil");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [authLoading, authUser]);

  const handleChange = (e) => {
    setClient({
      ...client,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readImageAsDataUrl(file);
      setClient({
        ...client,
        photo: dataUrl,
      });
    } catch {
      setError("Impossible de charger la photo de profil");
    }
  };

  const saveChanges = async () => {
    if (!client?.id) return;

    try {
      const payload =
        client.accountType === "ENTERPRISE"
          ? {
              name: client.name,
              email: client.email,
              phone: client.phone,
              town: client.town,
              quarter: client.quarter,
              profilePicture: client.photo || null,
            }
          : {
              firstName: client.firstName,
              lastName: client.lastName,
              email: client.email,
              phone: client.phone,
              town: client.town,
              quarter: client.quarter,
              profilePicture: client.photo || null,
            };

      const updated = await updateProfile(payload);

      setClient({
        ...client,
        accountType: updated.accountType || client.accountType,
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        name: updated.name || "",
        email: updated.email,
        phone: updated.phone,
        town: updated.town,
        quarter: updated.quarter,
        type: updated.type,
        photo: updated.profilePicture || "",
      });
      setIsEditing(false);
      setError("");
    } catch (err) {
      setError(err.message || "Impossible de mettre à jour le profil");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="w-full flex justify-center bg-green-50 p-10">
        <p className="text-gray-500">Chargement du profil...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="w-full flex justify-center bg-green-50 p-10">
        <p className="text-red-600">{error || "Profil introuvable"}</p>
      </div>
    );
  }

  const isEnterprise = client.accountType === "ENTERPRISE";

  return (
    <div className="w-full flex justify-center bg-green-50 p-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Mon Profil
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {client.photo ? (
                <Image
                  src={client.photo}
                  alt="photo profil"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <User size={48} />
              )}
            </div>

            {isEditing && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full shadow"
                >
                  <EditIcon fontSize="small" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-xl mx-auto">
          {isEnterprise ? (
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm text-gray-500">Nom de l&apos;entreprise</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={client.name}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-800">
                  {client.name}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-500">Prénom</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={client.firstName}
                    onChange={handleChange}
                    className="border rounded-lg px-3 py-2"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-800">
                    {client.firstName}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-500">Nom</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={client.lastName}
                    onChange={handleChange}
                    className="border rounded-lg px-3 py-2"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-800">
                    {client.lastName}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Numéro de téléphone</label>
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={client.phone}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-800">
                {client.phone || "—"}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Adresse mail</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={client.email}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-800">
                {client.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Ville</label>
            {isEditing ? (
              <input
                type="text"
                name="town"
                value={client.town}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-gray-700">{client.town || "—"}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Quartier</label>
            {isEditing ? (
              <input
                type="text"
                name="quarter"
                value={client.quarter}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-gray-700">{client.quarter || "—"}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Type de compte</label>
            <p className="text-gray-700">
              {isEnterprise ? "Entreprise" : "Particulier"}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Abonnement</label>
            <p className="text-gray-700">{client.type || "CLASSIC"}</p>
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
            href="/forgot-password"
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
