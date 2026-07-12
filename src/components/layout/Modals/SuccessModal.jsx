"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function SuccessModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center animate-scale-in">

        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="text-green-600" style={{ fontSize: 32 }} />
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Succès
        </h2>

        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {message}
        </p>

        <button
          onClick={onClose}
          className="btn-primary w-full"
        >
          Fermer
        </button>

      </div>
    </div>
  );
}