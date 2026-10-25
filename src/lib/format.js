/** Formatage commun (ENF-11 : français, FCFA, fuseau du Cameroun). */

const TZ = "Africa/Douala";

export function formatFcfa(amount) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return "—";
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(Number(amount)))} F CFA`;
}

export function formatNumber(value, digits = 0) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: digits }).format(value);
}

export function formatDate(value, opts = {}) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", timeZone: TZ, ...opts });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ,
  });
}

export function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

/** « il y a 5 min », « hier », etc. */
export function timeAgo(value) {
  if (!value) return "—";
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 172800) return "hier";
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} jours`;
  return formatDate(value);
}

/** Groupe une date en « Aujourd'hui », « Hier » ou jour de la semaine. */
export function dayGroup(value) {
  const d = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  const label = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Date locale au format yyyy-MM-dd (pour les champs date et l'API). */
export function isoDate(date = new Date()) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Date-heure locale sans fuseau, attendue par l'API (LocalDateTime). */
export function isoLocalDateTime(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${isoDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

export function fullName(person) {
  if (!person) return "—";
  if (person.firstName || person.lastName) return `${person.firstName || ""} ${person.lastName || ""}`.trim();
  return person.name || person.email || "—";
}

export function initials(person) {
  const name = fullName(person);
  if (!name || name === "—") return "?";
  const parts = name.split(/\s+/).filter(Boolean);
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export function includesText(haystack, needle) {
  if (!needle) return true;
  const norm = (s) => String(s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  return norm(haystack).includes(norm(needle));
}
