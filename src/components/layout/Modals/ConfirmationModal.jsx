"use client";

import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";

export default function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center animate-scale-in">

        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpOutlinedIcon className="text-amber-600" style={{ fontSize: 32 }} />
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Confirmation
        </h2>

        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Annuler
          </button>

          <button
            onClick={onConfirm}
            className="btn-primary flex-1"
          >
            Confirmer
          </button>
        </div>

      </div>
    </div>
  );
}