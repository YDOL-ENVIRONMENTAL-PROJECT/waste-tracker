"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function Field({ label, hint, error, required, children, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function Input({ label, hint, error, required, className = "", icon, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input className={`field ${icon ? "pl-10" : ""} ${error ? "border-red-300" : ""}`} required={required} {...props} />
      </div>
    </Field>
  );
}

export function PasswordInput({ label, hint, error, required, className = "", ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <input type={visible ? "text" : "password"} className="field pr-10" required={required} {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
          title={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </Field>
  );
}

export function Select({ label, hint, error, required, className = "", options = [], placeholder, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      <select className="field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%2394a3b8%22 stroke-width=%222%22 viewBox=%220 0 24 24%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[right_0.75rem_center] bg-no-repeat pr-9" required={required} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Textarea({ label, hint, error, required, className = "", rows = 3, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      <textarea rows={rows} className="field resize-y" required={required} {...props} />
    </Field>
  );
}

/** Choix exclusif sous forme de cartes (type de compte, format, etc.). */
const GRID_COLS = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" };

export function ChoiceCards({ value, onChange, options, columns = 3 }) {
  return (
    <div className={`grid grid-cols-1 gap-2.5 ${GRID_COLS[columns] || GRID_COLS[3]}`}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            type="button"
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
              active ? "border-brand-500 bg-brand-50/60 ring-4 ring-brand-500/10" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            {o.icon && (
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                {o.icon}
              </span>
            )}
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-800">{o.label}</span>
              {o.description && <span className="mt-0.5 block text-xs text-slate-500">{o.description}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Vérifie la règle RG-CPT-02 côté interface. */
export function passwordError(password) {
  if (!password) return null;
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Au moins 8 caractères, dont une lettre et un chiffre";
  }
  return null;
}

/**
 * Liste déroulante avec saisie pour filtrer rapidement (ex. choix d'une caserne parmi plusieurs dizaines).
 * options : [{ value, label, description }].
 */
export function SearchSelect({ label, hint, error, required, className = "", options = [], value, onChange, placeholder = "Rechercher…", emptyText = "Aucun résultat" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const selected = options.find((o) => o.value === value);
  const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const matches = options.filter((o) => norm(`${o.label} ${o.description || ""}`).includes(norm(query)));

  const choose = (o) => {
    onChange(o.value);
    setQuery("");
    setOpen(false);
  };
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, matches.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && open && matches[active]) { e.preventDefault(); choose(matches[active]); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <input
          className={`field pr-9 ${error ? "border-red-300" : ""}`}
          role="combobox"
          aria-expanded={open}
          value={open ? query : selected?.label || ""}
          placeholder={selected ? selected.label : placeholder}
          onFocus={() => { setOpen(true); setActive(0); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
          onKeyDown={onKeyDown}
        />
        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
        {open && (
          <ul role="listbox" className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            {matches.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-400">{emptyText}</li>
            ) : matches.map((o, i) => (
              <li key={o.value} role="option" aria-selected={o.value === value}
                onMouseDown={(e) => { e.preventDefault(); choose(o); }}
                onMouseEnter={() => setActive(i)}
                className={`cursor-pointer px-3 py-2 text-sm ${i === active ? "bg-brand-50" : ""} ${o.value === value ? "font-semibold text-brand-800" : "text-slate-700"}`}>
                {o.label}
                {o.description && <span className="block text-xs font-normal text-slate-400">{o.description}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  );
}
