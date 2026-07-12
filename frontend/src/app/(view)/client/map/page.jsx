"use client";

import MapComponent from "@/components/MapComponent";
import { useState, useEffect } from "react";

export default function ClientMapPage() {
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState([3.848, 11.502]); // Yaoundé, Cameroon default
  const [zoom, setZoom] = useState(13);

  // Example: Fetch nearby garbage bins for clients
  useEffect(() => {
    // TODO: Replace with actual API call to fetch nearby garbage bins
    const exampleMarkers = [
      {
        position: [3.848, 11.502],
        popup: "Garbage Bin #001",
      },
      {
        position: [3.85, 11.51],
        popup: "Garbage Bin #002",
      },
      {
        position: [3.84, 11.49],
        popup: "Garbage Bin #003",
      },
      {
        position: [3.845, 11.505],
        popup: "Garbage Bin #004",
      },
    ];
    setMarkers(exampleMarkers);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-8 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nearby Garbage Bins</h1>
          <p className="text-gray-600 mt-1">
            Find garbage bins near you for waste disposal
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-md" style={{ height: "500px" }}>
        <MapComponent center={center} zoom={zoom} markers={markers} />
      </div>

      {/* Bins List Panel */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Nearby Bins ({markers.length})
        </h2>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {markers.map((marker, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span className="text-gray-700 font-medium">
                  {marker.popup}
                </span>
              </div>
              <button className="text-green-600 hover:text-green-700 font-semibold text-sm">
                Navigate
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}