"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/layout/Modals/ConfirmationModal";
import { notify } from "@/lib/notify";
import { garbagebins } from "@/services/garbagebin";
import { Loader2, MapPin, Camera, Info, ArrowLeft, ArrowRight, Check } from "lucide-react";

export default function AddGarbageBin() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [geoMode, setGeoMode] = useState(null); // 'retrieve' or 'later'
  const [isRetrievingGeo, setIsRetrievingGeo] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    town: "",
    quarter: "",
    description: "",
    photo: "" // base64 representation of the image
  });

  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null
  });

  const [preview, setPreview] = useState(null);

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo") {
      const file = files[0];
      if (file) {
        setPreview(URL.createObjectURL(file));

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({ ...prev, photo: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // RETRIEVE GEOLOCATION
  const retrieveLocation = () => {
    if (!navigator.geolocation) {
      notify.error("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsRetrievingGeo(true);
    setGeoMode("retrieve");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setIsRetrievingGeo(false);
        notify.success("Coordonnées récupérées avec succès !");
      },
      (error) => {
        setIsRetrievingGeo(false);
        console.error("Error retrieving location:", error);
        notify.error("Impossible de récupérer la position de l'appareil.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSkipLocation = () => {
    setGeoMode("later");
    setCoordinates({
      latitude: null,
      longitude: null
    });
    notify.info("Géolocalisation reportée à plus tard.");
  };

  // STEP NAVIGATION & VALIDATION
  const handleNext = () => {
    if (step === 1) {
      if (!formData.code.trim() || !formData.town.trim() || !formData.quarter.trim() || !formData.description.trim()) {
        notify.error("Veuillez remplir tous les champs obligatoires (Code, Ville, Quartier, Description).");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.photo) {
        notify.error("Veuillez ajouter une photo du bac (obligatoire).");
        return;
      }
      setStep(3);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // SUBMIT FLOW
  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
      return;
    }
    if (!geoMode) {
      notify.error("Veuillez choisir de récupérer la position ou de la configurer plus tard.");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setShowConfirmation(false);

    try {
      const requestData = {
        code: formData.code,
        town: formData.town,
        quarter: formData.quarter,
        description: formData.description,
        photo: formData.photo,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        status: "ACTIVE"
      };

      const result = await garbagebins.create(requestData);

      if (result.success) {
        notify.success("Bac ajouté avec succès !");
        router.push("/admin/garbageBinList");
      } else {
        notify.error(result.error || "Impossible d'ajouter le bac", result.technical);
      }
    } catch (error) {
      notify.error("Impossible d'ajouter le bac", error);
    }
  };

  return (
    <div className="bg-green-50/50 flex justify-center p-4 sm:p-6 md:p-10 min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md border border-green-100 p-6 sm:p-10 flex flex-col justify-between">
        
        <div>
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Ajouter un bac à ordures
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Enregistrement d'un nouveau point de collecte des déchets
            </p>
          </div>

          {/* STEP INDICATOR */}
          <div className="flex items-center justify-between mb-10 relative">
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-100 -translate-y-1/2 z-0" />
            <div 
              className="absolute left-0 top-1/2 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />

            {[1, 2, 3].map((num) => {
              const titles = ["Informations", "Photo", "Position"];
              const isActive = step >= num;
              const isCurrent = step === num;

              return (
                <div key={num} className="flex flex-col items-center z-10 relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                      isActive 
                        ? "bg-green-600 text-white shadow-lg shadow-green-200" 
                        : "bg-white border-2 border-gray-200 text-gray-400"
                    } ${isCurrent ? "ring-4 ring-green-100" : ""}`}
                  >
                    {isActive && step > num ? <Check size={18} /> : num}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isCurrent ? "text-green-700 font-bold" : "text-gray-400"}`}>
                    {titles[num - 1]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* FORM STEPS CONTAINER */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1: BASIC DETAILS */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Info className="text-green-600 w-5 h-5" />
                  <h2 className="text-lg font-semibold text-gray-700">Informations de base</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CODE */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Code du bac <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Ex: BAC-YDOL-001"
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                    />
                  </div>

                  {/* TOWN */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Ville <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="town"
                      value={formData.town}
                      onChange={handleChange}
                      placeholder="Ex: Douala"
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                    />
                  </div>

                  {/* QUARTER */}
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Quartier <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="quarter"
                      value={formData.quarter}
                      onChange={handleChange}
                      placeholder="Ex: Akwa, Rue Pavée"
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                    />
                  </div>

                  {/* DESCRIPTION */}
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Description / Point de repère <span className="text-red-500">*</span></label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Décrivez précisément l'emplacement (ex: Devant l'école publique, en face de la pharmacie...)"
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PHOTO */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Camera className="text-green-600 w-5 h-5" />
                  <h2 className="text-lg font-semibold text-gray-700">Visualisation du bac</h2>
                </div>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 bg-gray-50 hover:bg-gray-100/50 transition duration-200">
                  <Camera className="text-gray-400 w-12 h-12 mb-3" />
                  <p className="text-sm text-gray-600 mb-1 text-center font-medium">Ajouter la photo de l'emplacement (OBLIGATOIRE)</p>
                  <p className="text-xs text-gray-400 mb-4 text-center">Fichiers autorisés : JPG, PNG (Max. 5MB)</p>
                  
                  <label className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold cursor-pointer shadow-sm transition">
                    Sélectionner un fichier
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {preview && (
                  <div className="flex flex-col items-center gap-2 mt-4">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Aperçu :</span>
                    <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden shadow-md border border-gray-100">
                      <img
                        src={preview}
                        alt="Aperçu du bac"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: GEOLOCATION WARNING & SELECTION */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <MapPin className="text-green-600 w-5 h-5" />
                  <h2 className="text-lg font-semibold text-gray-700">Positionnement géographique</h2>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5 flex gap-3.5">
                  <div className="text-yellow-700 text-xl">⚠️</div>
                  <div>
                    <h4 className="font-semibold text-yellow-800 text-sm mb-1">Avis de localisation</h4>
                    <p className="text-xs text-yellow-700 leading-relaxed">
                      La position géographique du bac à ordures sera automatiquement enregistrée comme la position géographique actuelle détectée par cet appareil. Assurez-vous d'être à côté du bac si vous choisissez de récupérer la position maintenant. Vous pouvez également choisir de la configurer ultérieurement.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {/* RETRIEVE NOW */}
                  <button
                    type="button"
                    onClick={retrieveLocation}
                    disabled={isRetrievingGeo}
                    className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition ${
                      geoMode === "retrieve"
                        ? "border-green-600 bg-green-50/50"
                        : "border-gray-200 hover:border-green-600 hover:bg-green-50/10"
                    }`}
                  >
                    {isRetrievingGeo ? (
                      <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-3" />
                    ) : (
                      <MapPin className={`w-8 h-8 mb-3 ${geoMode === "retrieve" ? "text-green-600" : "text-gray-400"}`} />
                    )}
                    <span className="font-semibold text-sm text-gray-800">Localiser l'appareil</span>
                    <span className="text-xs text-gray-500 text-center mt-1">Récupère via le GPS du navigateur</span>
                  </button>

                  {/* CONFIGURE LATER */}
                  <button
                    type="button"
                    onClick={handleSkipLocation}
                    className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition ${
                      geoMode === "later"
                        ? "border-green-500 bg-green-50/50"
                        : "border-gray-200 hover:border-green-50 hover:bg-green-50/10"
                    }`}
                  >
                    <span className="text-2xl mb-2">❌</span>
                    <span className="font-semibold text-sm text-gray-800">Configurer plus tard</span>
                    <span className="text-xs text-gray-500 text-center mt-1">Le bac sera créé sans coordonnées (valeurs nulles)</span>
                  </button>
                </div>

                {/* SHOW COORDINATES */}
                {geoMode === "retrieve" && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-2 transition duration-200 animate-fadeIn">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Coordonnées récupérées :</span>
                    {isRetrievingGeo ? (
                      <span className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                        <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                        Récupération des coordonnées GPS en cours...
                      </span>
                    ) : coordinates.latitude ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-500 block">Latitude</span>
                          <span className="text-sm font-mono font-bold text-gray-800">{coordinates.latitude.toFixed(6)}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block">Longitude</span>
                          <span className="text-sm font-mono font-bold text-gray-800">{coordinates.longitude.toFixed(6)}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-red-500 font-medium">Aucune coordonnée disponible. Veuillez réessayer.</span>
                    )}
                  </div>
                )}

                {geoMode === "later" && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center transition duration-200">
                    <span className="text-sm text-gray-600 font-medium">Les coordonnées de ce bac seront enregistrées comme <span className="font-mono text-red-500 font-bold">null</span>.</span>
                  </div>
                )}
              </div>
            )}
            
          </form>
        </div>

        {/* BUTTON ACTION CONTAINER */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-10">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                <ArrowLeft size={16} />
                Retour
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/garbageBinList")}
              className="px-5 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              Annuler
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 shadow-sm transition"
              >
                Suivant
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm transition"
              >
                Terminer
                <Check size={16} />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmation && (
        <ConfirmationModal
          message="Voulez-vous enregistrer ce nouveau bac à ordures ?"
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}