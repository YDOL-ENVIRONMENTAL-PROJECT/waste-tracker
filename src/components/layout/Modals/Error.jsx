"use client";

import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";

export default function ErrorModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center animate-scale-in">

        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ErrorOutlinedIcon className="text-red-600" style={{ fontSize: 32 }} />
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Erreur
        </h2>

        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {message}
        </p>

        <button
          onClick={onClose}
          className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-700 active:scale-[0.98] transition-all duration-200 w-full"
        >
          Fermer
        </button>

      </div>
    </div>
  );
}