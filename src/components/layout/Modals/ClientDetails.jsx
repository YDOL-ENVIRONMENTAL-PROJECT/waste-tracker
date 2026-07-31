"use client";

import { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import StarIcon from "@mui/icons-material/Star";
import { Calendar, MapPin, ShieldCheck, Briefcase, User, Mail, Phone, Clock } from "lucide-react";

// Détermine le nom d'affichage et la catégorie du client (particulier / entreprise)
function getClientMeta(client) {
  const isParticulier = client.name === null || client.name === "string";
  return {
    categoryLabel: isParticulier ? "PARTICULIER" : "ENTREPRISE",
    displayName: isParticulier
      ? `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Particulier sans nom"
      : client.name,
  };
}

// Petit composant réutilisable : une ligne d'information avec icône, label, et bouton copier optionnel
function InfoRow({ icon: Icon, label, value, copyable = false }) {
  const [copied, setCopied] = useState(false);
  const hasValue = value && value !== "N/A";

  const handleCopy = async () => {
    if (!hasValue) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Le presse-papier peut être indisponible (permissions) — on échoue silencieusement
    }
  };

  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="flex items-start gap-2.5 min-w-0">
        <Icon size={15} className="text-gray-400 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
          <p className={`text-sm font-medium mt-0.5 break-all ${hasValue ? "text-gray-800" : "text-gray-400 italic"}`}>
            {hasValue ? value : "Non renseigné"}
          </p>
        </div>
      </div>
      {copyable && hasValue && (
        <button
          onClick={handleCopy}
          title="Copier"
          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 transition"
        >
          {copied ? <CheckIcon sx={{ fontSize: 15 }} className="text-green-600" /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
        </button>
      )}
    </div>
  );
}

export default function ClientDetails({ client, onClose }) {
  const dialogRef = useRef(null);

  // Fermeture au clavier (Échap) + focus initial sur la modale pour l'accessibilité
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!client) return null;

  const { displayName, categoryLabel } = getClientMeta(client);
  const hasQuarter = client.quarter && client.quarter !== "string";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-details-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border relative animate-scaleIn focus:outline-none"
      >
        {/* HEADER */}
        <div className="sticky top-0 bg-white flex items-center gap-4 border-b px-6 py-5 rounded-t-2xl">
          <div className="w-14 h-14 shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">
            {displayName.charAt(0) || "—"}
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="client-details-title" className="text-lg font-bold text-gray-900 truncate">
              {displayName}
            </h3>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  categoryLabel === "ENTREPRISE"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-purple-50 text-purple-700 border-purple-200"
                }`}
              >
                {categoryLabel === "ENTREPRISE" ? <Briefcase size={12} /> : <User size={12} />}
                {categoryLabel === "ENTREPRISE" ? "Entreprise" : "Particulier"}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  client.type === "PREMIUM"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {client.type === "PREMIUM" && <StarIcon sx={{ fontSize: 12 }} />}
                {client.type || "CLASSIC"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Fermer"
            className="w-9 h-9 shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-4">
          {/* Coordonnées */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Coordonnées</p>
          <div className="divide-y divide-gray-100">
            <InfoRow icon={Mail} label="Adresse mail" value={client.email} copyable />
            <InfoRow icon={Phone} label="Téléphone" value={client.phone} copyable />
          </div>

          {/* Localisation */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-5">Localisation</p>
          <div className="bg-gray-50 rounded-xl border border-gray-100 px-3.5 mt-2">
            <InfoRow
              icon={MapPin}
              label="Ville / Quartier"
              value={client.town ? `${client.town}${hasQuarter ? `, Qrt. ${client.quarter}` : ""}` : null}
            />
          </div>

          {/* Informations complémentaires */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-5">Informations complémentaires</p>
          <div className="divide-y divide-gray-100">
            <InfoRow
              icon={Calendar}
              label="Date de naissance"
              value={
                client.dateOfBirth
                  ? new Date(client.dateOfBirth).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : null
              }
            />
          </div>

          {/* Statut & historique */}
          <div className="flex items-center gap-2 bg-green-50/60 border border-green-100 rounded-xl px-3.5 py-3 mt-5">
            <ShieldCheck size={16} className="text-green-600 shrink-0" />
            <div className="min-w-0 text-xs text-gray-600">
              <span className="flex items-center gap-1 text-gray-400">
                <Clock size={11} /> Compte créé le
              </span>
              <span className="font-semibold text-gray-700">
                {client.createdAt ? new Date(client.createdAt).toLocaleString("fr-FR") : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}