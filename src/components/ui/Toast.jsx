"use client";

import { Toaster } from "react-hot-toast";

/**
 * App-wide toast host (react-hot-toast).
 * Prefer importing `notify` from `@/lib/notify` in feature code.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        className: "text-sm",
        style: {
          borderRadius: "12px",
          padding: "12px 16px",
          maxWidth: "420px",
        },
        success: {
          iconTheme: {
            primary: "#16a34a",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
