"use client";

import { useState } from "react";
import { LocateFixed } from "lucide-react";
import LeafletMap from "./LeafletMap";
import { DEFAULT_CENTER } from "./constants";
import { currentPosition } from "@/lib/image";
import { notify } from "@/lib/notify";
import Spinner from "@/components/ui/Spinner";

/**
 * Sélection d'un point sur la carte : clic, glisser-déposer du marqueur ou position actuelle.
 * value : { latitude, longitude } | null
 */
export default function MapPicker({ value, onChange, height = 320, extraMarkers = [], kind = "pin" }) {
  const [locating, setLocating] = useState(false);
  const position = value?.latitude != null ? [value.latitude, value.longitude] : null;

  const locate = async () => {
    setLocating(true);
    try {
      onChange(await currentPosition());
    } catch (e) {
      notify.error(e.message);
    } finally {
      setLocating(false);
    }
  };

  const markers = [
    ...extraMarkers,
    ...(position
      ? [{ id: "picked", position, kind, color: "green", size: 40, onDragEnd: (ll) => onChange({ latitude: ll.lat, longitude: ll.lng }) }]
      : []),
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="relative" style={{ height }}>
        <LeafletMap
          markers={markers}
          center={position || DEFAULT_CENTER}
          zoom={position ? 16 : 13}
          fit={false}
          flyTo={position}
          onMapClick={(ll) => onChange({ latitude: ll.lat, longitude: ll.lng })}
        />
        <button type="button" onClick={locate} className="btn-secondary absolute right-3 top-3 z-[500] px-3 py-2 text-xs shadow-md">
          {locating ? <Spinner size={14} /> : <LocateFixed size={14} />} Ma position
        </button>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
        <span>{position ? "Glissez le marqueur pour ajuster la position." : "Cliquez sur la carte pour placer le point."}</span>
        {position && <span className="font-mono text-slate-600">{value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}</span>}
      </div>
    </div>
  );
}
