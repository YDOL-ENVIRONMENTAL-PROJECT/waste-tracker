"use client";

import dynamic from "next/dynamic";

const Loading = () => <div className="skeleton h-full w-full rounded-none" />;

/** Leaflet manipule window : chargement côté client uniquement. */
export const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false, loading: Loading });
export const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false, loading: Loading });
export { DEFAULT_CENTER } from "./constants";
