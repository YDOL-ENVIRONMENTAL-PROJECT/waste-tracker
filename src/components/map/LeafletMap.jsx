"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { markerIcon } from "./icons";

import { DEFAULT_CENTER } from "./constants";

function FitBounds({ points, enabled }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || !points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 16 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, JSON.stringify(points)]);
  return null;
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [target, map]);
  return null;
}

/** Recalcule la taille de la carte quand son conteneur change (évite les zones grises). */
function AutoResize() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const fix = () => map.invalidateSize();
    const timer = setTimeout(fix, 250);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fix) : null;
    observer?.observe(container);
    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [map]);
  return null;
}

function ClickHandler({ onClick }) {
  useMapEvents({ click: (e) => onClick?.(e.latlng) });
  return null;
}

/**
 * Carte générique.
 * markers : [{ id, position: [lat, lon], kind, color, pulse?, popup?: ReactNode, onClick? }]
 */
export default function LeafletMap({
  markers = [], center = DEFAULT_CENTER, zoom = 13, fit = true, flyTo, onMapClick, circle, className = "h-full w-full", children,
  controls = true,
}) {
  const points = markers.filter((m) => m.position?.[0] != null).map((m) => m.position);
  return (
    <MapContainer center={center} zoom={zoom} className={className} scrollWheelZoom={controls} zoomControl={controls} dragging={controls} style={{ zIndex: 0 }}>
      <AutoResize />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} enabled={fit} />
      <FlyTo target={flyTo} />
      {onMapClick && <ClickHandler onClick={onMapClick} />}
      {circle && <Circle center={circle.center} radius={circle.radius} pathOptions={{ color: "#059669", fillOpacity: 0.06, weight: 1 }} />}
      {markers
        .filter((m) => m.position?.[0] != null)
        .map((m) => (
          <Marker
            key={m.id}
            position={m.position}
            icon={markerIcon(m.kind, m.color, { pulse: m.pulse, size: m.size })}
            draggable={!!m.onDragEnd}
            eventHandlers={{
              click: () => m.onClick?.(),
              dragend: (e) => m.onDragEnd?.(e.target.getLatLng()),
            }}
          >
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}
      {children}
    </MapContainer>
  );
}
