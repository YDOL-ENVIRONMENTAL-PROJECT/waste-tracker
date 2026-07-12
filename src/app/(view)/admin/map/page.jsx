"use client";

import MapComponent from "@/components/MapComponent";
import { useState, useEffect } from "react";

export default function AdminMapPage() {
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState([3.848, 11.502]); // Yaoundé, Cameroon default
  const [zoom, setZoom] = useState(13);

  // Example: Fetch garbage bins or missions data to display on map
  useEffect(() => {
    // TODO: Replace with actual API call to fetch garbage bins
    const exampleMarkers = [
      {
        position: [3.848, 11.502],
        popup: "Garbage Bin #001 - Status: Empty",
      },
      {
        position: [3.85, 11.51],
        popup: "Garbage Bin #002 - Status: Full",
      },
      {
        position: [3.84, 11.49],
        popup: "Garbage Bin #003 - Status: Half Full",
      },
    ];
    setMarkers(exampleMarkers);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-8 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Waste Management Map</h1>
          <p className="text-gray-600 mt-1">
            Real-time tracking of garbage bins and missions
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-md" style={{ height: "500px" }}>
        <MapComponent center={center} zoom={zoom} markers={markers} />
      </div>

      {/* Map Controls/Info Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-700">Total Bins</h3>
          <p className="text-2xl font-bold text-green-600">{markers.length}</p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-gray-700">Bins to Empty</h3>
          <p className="text-2xl font-bold text-red-600">
            {markers.filter((m) => m.popup?.includes("Full")).length}
          </p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-gray-700">Active Missions</h3>
          <p className="text-2xl font-bold text-blue-600">0</p>
        </div>
      </div>
    </div>
  );
}