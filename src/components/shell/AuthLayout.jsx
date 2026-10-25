import Link from "next/link";
import { ArrowLeft, Megaphone, Sparkles, Truck } from "lucide-react";
import Brand from "./Brand";

/** Mise en page des écrans d'authentification : formulaire à gauche, panneau de marque à droite. */
export default function AuthLayout({ title, subtitle, children, footer, wide = false }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/"><Brand /></Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft size={15} /> Accueil</Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className={`w-full ${wide ? "max-w-xl" : "max-w-sm"} animate-slide-up`}>
            <h1 className="text-[28px] font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>}
          </div>
        </div>
        <p className="text-center text-xs text-slate-400">© {new Date().getFullYear()} YDOL Ingénierie · WasteTracker</p>
      </div>
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Gestion intelligente des déchets</p>
          <h2 className="mt-4 max-w-md text-4xl font-bold leading-tight text-white">Une ville plus propre, un signalement à la fois.</h2>
        </div>
        <div className="relative space-y-3">
          {[[Megaphone, "Signalez un bac plein en 10 secondes", "Photo et position GPS, la tour de contrôle est prévenue."],
            [Truck, "Des collectes plus rapides", "Le camion disponible le plus proche est envoyé."],
            [Sparkles, "Le geste du jour", "Une capsule courte pour adopter les bons réflexes."]].map(([Icon, t, d]) => (
            <div key={t} className="flex gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white"><Icon size={19} /></div>
              <div><p className="font-semibold text-white">{t}</p><p className="text-sm text-brand-100/80">{d}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
