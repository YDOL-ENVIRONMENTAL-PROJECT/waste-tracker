"use client";

import { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { MapPin, FileText, Trash2, Calendar, Clock, X as CancelIcon } from "lucide-react";
import { garbagebins } from "@/services/garbagebin"; // Adaptez le chemin d'accès selon votre arborescence
import { notify } from "@/lib/notify";

// Reflète l'enum GarbageBinStatus côté backend (com.example.backend.model.enums.GarbageBinStatus)
const STATUS_META = {
  EMPTY: { label: "Vide", classes: "bg-green-50 text-green-700 border-green-200" },
  FULL: { label: "Plein", classes: "bg-red-50 text-red-700 border-red-200" },
  OUT_OF_SERVICE: { label: "Hors service", classes: "bg-gray-100 text-gray-600 border-gray-200" },
  ARCHIVED: { label: "Archivé", classes: "bg-amber-50 text-amber-700 border-amber-200" },
};

// ARCHIVED est volontairement exclu : cet état est appliqué via le bouton "Supprimer" (archive()),
// pas par une édition manuelle du statut, pour éviter deux chemins concurrents vers le même état.
const STATUS_OPTIONS = [
  { value: "EMPTY", label: "Vide" },
  { value: "FULL", label: "Plein" },
  { value: "OUT_OF_SERVICE", label: "Hors service" },
];

function getStatusMeta(status) {
  return STATUS_META[status] || {
    label: status || "Inconnu",
    classes: "bg-gray-100 text-gray-500 border-gray-200",
  };
}

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Champs éditables : on part uniquement de ceux-ci pour l'état du formulaire et la détection de changement
const getEditableFields = (bin) => ({
  town: bin?.town || "",
  quarter: bin?.quarter || "",
  description: bin?.description || "",
  status: bin?.status || "",
});

export default function BinDetails({ bin, onClose, onUpdated }) {
  const dialogRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(getEditableFields(bin));
  const [original, setOriginal] = useState(getEditableFields(bin));

  // Réinitialise le formulaire à chaque ouverture / changement de bac
  useEffect(() => {
    const fields = getEditableFields(bin);
    setFormData(fields);
    setOriginal(fields);
    setIsEditing(false);
  }, [bin]);

  const isDirty = Object.keys(formData).some((key) => formData[key] !== original[key]);

  const handleClose = () => {
    if (isEditing && isDirty) {
      const confirmLeave = confirm("Des modifications non enregistrées seront perdues. Fermer quand même ?");
      if (!confirmLeave) return;
    }
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, isDirty]);

  const handleCancelEdit = () => {
    if (isDirty) {
      const confirmCancel = confirm("Annuler les modifications en cours ?");
      if (!confirmCancel) return;
    }
    setFormData(original);
    setIsEditing(false);
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const isTownValid = formData.town.trim().length > 0;
  const canValidate = isDirty && isTownValid && !isSaving;

  const handleValidate = async () => {
    if (!canValidate) return;
    setIsSaving(true);

    // GarbageBinRequest est un DTO complet (pas un patch) : on renvoie tous les champs requis
    // par le backend, en préservant ceux non éditables dans cette modale (code, photo, géoloc).
    const payload = {
      code: bin.code,
      town: formData.town.trim(),
      quarter: formData.quarter,
      description: formData.description,
      status: formData.status,
      photo: bin.photo ?? null,
      latitude: bin.latitude ?? null,
      longitude: bin.longitude ?? null,
    };

    const result = await garbagebins.update(bin.id, payload);
    setIsSaving(false);

    if (result.success) {
      const updatedBin = { ...bin, ...formData, town: payload.town };
      setOriginal(formData);
      setIsEditing(false);
      notify.success("Bac mis à jour");
      onUpdated?.(updatedBin);
    } else {
      notify.error(result.error || "Impossible de mettre à jour ce bac", result.technical);
    }
  };

  if (!bin) return null;

  const statusMeta = getStatusMeta(isEditing ? formData.status : bin.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={handleClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bin-details-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border relative focus:outline-none"
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between gap-4 border-b px-6 py-4 rounded-t-2xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 font-mono text-sm font-semibold px-2.5 py-1 rounded-md border border-green-100 shrink-0">
              <Trash2 size={14} />
              {bin.code}
            </span>
            <span id="bin-details-title" className="sr-only">
              Détails du bac {bin.code}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* CONTROLES EDITION */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                title="Modifier les informations"
                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
              >
                <EditIcon fontSize="small" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancelEdit}
                  title="Annuler"
                  disabled={isSaving}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-40"
                >
                  <CancelIcon size={18} />
                </button>
                <button
                  onClick={handleValidate}
                  title={!isTownValid ? "La ville est obligatoire" : isDirty ? "Enregistrer les modifications" : "Aucune modification"}
                  disabled={!canValidate}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition ${
                    canValidate
                      ? "text-green-700 bg-green-50 hover:bg-green-100"
                      : "text-gray-300 bg-gray-50 cursor-not-allowed"
                  }`}
                >
                  {isSaving ? (
                    <div className="w-3.5 h-3.5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckIcon fontSize="small" />
                  )}
                </button>
              </>
            )}

            <div className="w-px h-6 bg-gray-200 mx-1" />

            <button
              onClick={handleClose}
              title="Fermer"
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* BODY — 2 colonnes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          {/* GAUCHE : PHOTO */}
          <div className="p-6 sm:border-r border-gray-100 flex flex-col">
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
              {bin.photo ? (
                <img src={bin.photo} alt={`Bac ${bin.code}`} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300">
                  <ImageOutlinedIcon style={{ fontSize: 40 }} />
                  <span className="text-xs font-medium text-gray-400">Pas de photo</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              La photo se modifie depuis le formulaire d'ajout terrain.
            </p>
          </div>

          {/* DROITE : INFOS */}
          <div className="p-6 flex flex-col gap-5">
            {/* Statut */}
            <div>
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Statut</label>
              {isEditing ? (
                <select
                  value={formData.status}
                  onChange={handleChange("status")}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="mt-1.5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.classes}`}>
                    {statusMeta.label}
                  </span>
                </div>
              )}
            </div>

            {/* Ville */}
            <div>
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <MapPin size={11} /> Ville
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={formData.town}
                    onChange={handleChange("town")}
                    placeholder="Ville"
                    className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      isTownValid ? "border-gray-200 focus:ring-green-500" : "border-red-300 focus:ring-red-400"
                    }`}
                  />
                  {!isTownValid && <p className="text-xs text-red-500 mt-1">La ville est obligatoire.</p>}
                </>
              ) : (
                <p className="text-sm font-medium text-gray-800 mt-1">{bin.town || "Non renseignée"}</p>
              )}
            </div>

            {/* Quartier */}
            <div>
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <MapPin size={11} /> Quartier
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.quarter}
                  onChange={handleChange("quarter")}
                  placeholder="Quartier"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="text-sm font-medium text-gray-800 mt-1">{bin.quarter || "Non renseigné"}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <FileText size={11} /> Description
              </label>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={handleChange("description")}
                  placeholder="Description du bac..."
                  rows={4}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className={`text-sm mt-1 ${bin.description ? "text-gray-700" : "text-gray-400 italic"}`}>
                  {bin.description || "Aucune description renseignée."}
                </p>
              )}
            </div>

            {/* Métadonnées non éditables */}
            <div className="border-t border-gray-100 pt-4 mt-1 space-y-1.5">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Calendar size={12} /> Créé le {formatDate(bin.createdAt)}
              </p>
              {bin.updatedAt && (
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Clock size={12} /> Dernière mise à jour le {formatDate(bin.updatedAt)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bandeau d'édition active */}
        {isEditing && (
          <div className="sticky bottom-0 bg-amber-50 border-t border-amber-200 px-6 py-2.5 flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700">
              Mode édition — modifiez les champs puis validez.
            </span>
            {isDirty && (
              <span className="text-xs font-semibold text-amber-800">Modifications non enregistrées</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}