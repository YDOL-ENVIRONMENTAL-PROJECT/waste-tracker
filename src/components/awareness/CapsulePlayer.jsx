"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { embedUrl } from "@/lib/image";

/**
 * Lecteur de capsule : vidéo (YouTube/Vimeo intégrée ou fichier), diaporama ou infographie.
 * onComplete est appelé quand la capsule est considérée comme lue (80 % de la vidéo ou dernière diapositive).
 */
export default function CapsulePlayer({ capsule, onComplete }) {
  const [slide, setSlide] = useState(0);
  const completed = useRef(false);
  const slides = capsule?.slides || [];

  const complete = () => {
    if (!completed.current) {
      completed.current = true;
      onComplete?.();
    }
  };

  useEffect(() => {
    completed.current = false;
    setSlide(0);
  }, [capsule?.id]);

  useEffect(() => {
    if (capsule?.format !== "VIDEO" && slides.length > 0 && slide === slides.length - 1) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide, slides.length, capsule?.format]);

  // Vidéo intégrée : impossible de suivre la lecture, on la considère lue après la durée annoncée (ou 30 s).
  const embed = capsule?.format === "VIDEO" ? embedUrl(capsule.mediaUrl) : null;
  useEffect(() => {
    if (!embed) return undefined;
    const id = setTimeout(complete, Math.min((capsule.durationSeconds || 30) * 800, 120_000));
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embed]);

  if (!capsule) return null;

  if (capsule.format === "VIDEO") {
    return (
      <div className="overflow-hidden rounded-2xl bg-black">
        {embed ? (
          <iframe src={embed} title={capsule.title} className="aspect-video w-full" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        ) : capsule.mediaUrl ? (
          <video
            src={capsule.mediaUrl}
            poster={capsule.thumbnail || undefined}
            controls
            preload="metadata"
            className="aspect-video w-full"
            onTimeUpdate={(e) => e.target.duration && e.target.currentTime / e.target.duration >= 0.8 && complete()}
          />
        ) : null}
        {capsule.mediaUrl && !embed && (
          <a href={capsule.mediaUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 bg-slate-900 py-2 text-xs text-slate-300 hover:text-white">
            <ExternalLink size={12} /> Ouvrir la vidéo
          </a>
        )}
      </div>
    );
  }

  if (slides.length === 0) return null;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900">
      <img src={slides[slide]} alt={`Diapositive ${slide + 1}`} className="aspect-video w-full object-contain" />
      {slides.length > 1 && (
        <>
          <button onClick={() => setSlide((s) => Math.max(0, s - 1))} disabled={slide === 0} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-800 shadow disabled:opacity-30" aria-label="Précédente"><ChevronLeft size={18} /></button>
          <button onClick={() => setSlide((s) => Math.min(slides.length - 1, s + 1))} disabled={slide === slides.length - 1} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-800 shadow disabled:opacity-30" aria-label="Suivante"><ChevronRight size={18} /></button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} className={`h-1.5 rounded-full transition-all ${i === slide ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} aria-label={`Diapositive ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Vignette d'une capsule : miniature, première diapositive ou fond dégradé. */
export function CapsuleThumb({ capsule, className = "aspect-video" }) {
  const yt = capsule.format === "VIDEO" && capsule.mediaUrl?.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  const src = capsule.thumbnail || capsule.slides?.[0] || (yt ? `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg` : null);
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-brand-500 to-brand-800 ${className}`}>
      {src && <img src={src} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
      {capsule.format === "VIDEO" && (
        <span className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-brand-700 shadow-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </span>
      )}
    </div>
  );
}
