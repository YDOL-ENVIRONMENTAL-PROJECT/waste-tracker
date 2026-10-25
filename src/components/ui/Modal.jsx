"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import Spinner from "./Spinner";

export function Modal({ open, onClose, title, subtitle, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };
  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative flex max-h-[92vh] w-full ${widths[size]} animate-scale-in flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl`}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title = "Confirmation", message, confirmLabel = "Confirmer", danger = false, pending = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={pending}>Annuler</button>
          <button className={danger ? "btn-danger" : "btn-primary"} onClick={onConfirm} disabled={pending}>
            {pending && <Spinner />} {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${danger ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
          <AlertTriangle size={20} />
        </div>
        <p className="pt-2 text-sm leading-relaxed text-slate-600">{message}</p>
      </div>
    </Modal>
  );
}

/** Demande un motif obligatoire (refus, rejet, annulation). */
export function ReasonDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Valider", placeholder = "Expliquez brièvement le motif…", pending = false, suggestions = [] }) {
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) setReason("");
  }, [open]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={pending}>Annuler</button>
          <button className="btn-danger" disabled={!reason.trim() || pending} onClick={() => onConfirm(reason.trim())}>
            {pending && <Spinner />} {confirmLabel}
          </button>
        </>
      }
    >
      {message && <p className="mb-3 text-sm text-slate-600">{message}</p>}
      {suggestions.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => setReason(s)} className="chip bg-slate-100 text-slate-600 hover:bg-slate-200">
              {s}
            </button>
          ))}
        </div>
      )}
      <textarea autoFocus rows={3} className="field" placeholder={placeholder} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} />
    </Modal>
  );
}

/** Panneau latéral de détail. */
export function Drawer({ open, onClose, title, subtitle, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/30" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-lg animate-slide-in-right flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle && <div className="mt-1 text-sm text-slate-500">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div>}
      </aside>
    </div>
  );
}

export function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{children ?? "—"}</span>
    </div>
  );
}
