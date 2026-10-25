import L from "leaflet";

const SVG = {
  bin: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />',
  truck: '<path d="M14 18V6H3v12h2M14 9h4l3 4v5h-2M7 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0M15 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0" />',
  depot: '<path d="M3 21V9l9-6 9 6v12M9 21v-6h6v6" />',
  alert: '<path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />',
  home: '<path d="M3 10.5 12 3l9 7.5V21H3zM9 21v-6h6v6" />',
  pin: '<circle cx="12" cy="10" r="3"/><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />',
  me: '<circle cx="12" cy="12" r="4" />',
};

export const COLORS = {
  green: "#059669", red: "#dc2626", slate: "#64748b", amber: "#d97706", blue: "#2563eb",
  violet: "#7c3aed", sky: "#0284c7", dark: "#0f172a",
};

/** Marqueur rond coloré avec pictogramme. */
export function markerIcon(kind = "pin", color = "green", { size = 34, pulse = false } = {}) {
  const c = COLORS[color] || color;
  const ring = pulse ? `<span style="position:absolute;inset:-6px;border-radius:999px;background:${c};opacity:.25;animation:pulse-dot 1.6s infinite"></span>` : "";
  return L.divIcon({
    className: "wt-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="position:relative;width:${size}px;height:${size}px">${ring}<div style="position:relative;width:${size}px;height:${size}px;border-radius:999px;background:${c};border:3px solid #fff;box-shadow:0 4px 12px rgba(15,23,42,.25);display:flex;align-items:center;justify-content:center"><svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${SVG[kind] || SVG.pin}</svg></div></div>`,
  });
}
