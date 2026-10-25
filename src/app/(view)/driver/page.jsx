"use client";

import { Smartphone } from "lucide-react";
import Brand from "@/components/shell/Brand";
import { useSession } from "@/components/providers/SessionProvider";

/** Les chauffeurs utilisent l'application mobile : la version Web leur indique la marche à suivre. */
export default function DriverPage() {
  const { user, signOut } = useSession();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-700 to-brand-950 p-6">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mb-6 flex justify-center"><Brand /></div>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Smartphone size={30} /></div>
        <h1 className="text-xl font-bold text-slate-900">Bonjour {user?.firstName} !</h1>
        <p className="mt-2 text-sm text-slate-600">Vos missions se gèrent depuis l'application mobile <b>WasteTracker Chauffeur</b> installée sur votre téléphone de service. Connectez-vous-y avec les mêmes identifiants.</p>
        <button onClick={signOut} className="btn-secondary mt-6 w-full">Se déconnecter</button>
      </div>
    </div>
  );
}
