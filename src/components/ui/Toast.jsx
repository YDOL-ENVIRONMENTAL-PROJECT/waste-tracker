"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ErrorOutlined } from '@mui/icons-material';
import InfoIcon from "@mui/icons-material/Info";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration, exiting: false }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, "success", duration),
    error: (msg, duration) => addToast(msg, "error", duration),
    info: (msg, duration) => addToast(msg, "info", duration),
    warning: (msg, duration) => addToast(msg, "warning", duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-9999 flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const config = {
    success: {
      icon: <CheckCircleIcon fontSize="small" />,
      bg: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
      bar: "bg-green-500",
    },
    error: {
      icon: <ErrorOutlined fontSize="small" />,
      bg: "bg-red-50 border-red-200",
      iconColor: "text-red-600",
      bar: "bg-red-500",
    },
    info: {
      icon: <InfoIcon fontSize="small" />,
      bg: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
      bar: "bg-blue-500",
    },
    warning: {
      icon: <WarningAmberIcon fontSize="small" />,
      bg: "bg-amber-50 border-amber-200",
      iconColor: "text-amber-600",
      bar: "bg-amber-500",
    },
  };

  const c = config[toast.type] || config.info;

  return (
    <div
      className={`pointer-events-auto min-w-[320px] max-w-105 rounded-xl border shadow-lg overflow-hidden
        ${c.bg} ${toast.exiting ? "animate-slide-out-right" : "animate-slide-in-right"}`}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className={`mt-0.5 ${c.iconColor}`}>{c.icon}</span>
        <p className="text-sm text-gray-800 flex-1 leading-relaxed">{toast.message}</p>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-gray-400 hover:text-gray-600 transition mt-0.5"
        >
          <CloseIcon style={{ fontSize: 16 }} />
        </button>
      </div>
      <div className="h-0.5 w-full bg-gray-100">
        <div
          className={`h-full ${c.bar}`}
          style={{ animation: `progress-bar ${toast.duration}ms linear forwards` }}
        />
      </div>
    </div>
  );
}
