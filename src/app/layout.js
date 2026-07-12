import "./global.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata = {
  title: "Waste Tracker — Gestion intelligente des déchets",
  description:
    "Plateforme de gestion de collecte des déchets. Optimisez vos tournées, suivez vos chauffeurs et gardez votre ville propre.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}