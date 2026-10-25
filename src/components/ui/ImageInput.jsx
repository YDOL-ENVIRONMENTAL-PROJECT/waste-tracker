"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { compressImage } from "@/lib/image";
import { notify } from "@/lib/notify";
import Spinner from "./Spinner";

/** Sélection d'une image, compressée côté navigateur, renvoyée en data URI. */
export default function ImageInput({ value, onChange, label = "Ajouter une photo", hint = "JPG ou PNG — compressée automatiquement", aspect = "aspect-video", capture = false }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      onChange(await compressImage(file));
    } catch (err) {
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={pick} {...(capture ? { capture: "environment" } : {})} />
      {value ? (
        <div className={`group relative ${aspect} overflow-hidden rounded-2xl border border-slate-200 bg-slate-50`}>
          <img src={value} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
            <button type="button" onClick={() => ref.current?.click()} className="btn bg-white/90 px-3 py-1.5 text-xs text-slate-800">Changer</button>
            <button type="button" onClick={() => onChange("")} className="btn bg-white/90 px-2 py-1.5 text-xs text-red-600" aria-label="Retirer"><X size={14} /></button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className={`flex ${aspect} w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 text-slate-500 transition hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-700`}
        >
          {busy ? <Spinner size={22} /> : capture ? <Camera size={24} /> : <ImagePlus size={24} />}
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-slate-400">{hint}</span>
        </button>
      )}
    </div>
  );
}
