import Link from "next/link";
import {
  ArrowRight, BarChart3, CalendarClock, Crown, Map as MapIcon, Megaphone, Recycle, ShoppingBag, Smartphone, Sparkles, Truck,
} from "lucide-react";
import Brand from "@/components/shell/Brand";

const FEATURES = [
  { icon: Megaphone, title: "Signalement citoyen", text: "Un bac plein, un dépôt sauvage ? Photo et position GPS : la tour de contrôle est prévenue en quelques secondes." },
  { icon: Truck, title: "Missions optimisées", text: "La tour de contrôle envoie le camion disponible le plus proche. Le chauffeur reçoit la mission sur son téléphone." },
  { icon: MapIcon, title: "Suivi en temps réel", text: "État des bacs et position des véhicules sur une carte, pour une collecte plus rapide et moins coûteuse." },
  { icon: Sparkles, title: "Le geste du jour", text: "Chaque jour, une mini-vidéo ou un diaporama pour adopter les bons réflexes face aux déchets." },
  { icon: Crown, title: "Collecte à domicile", text: "Abonnez-vous : un camion passe chez vous à la fréquence choisie, à un prix calculé selon la distance." },
  { icon: ShoppingBag, title: "Boutique verte", text: "Compost, charbon écologique, objets recyclés : des produits issus de la valorisation de nos déchets." },
];

const STEPS = [
  ["Vous signalez", "Depuis le web ou l'application, en une photo."],
  ["La tour de contrôle planifie", "Elle affecte la mission au véhicule libre le plus proche."],
  ["Le chauffeur collecte", "Il confirme la collecte, preuve à l'appui. Vous êtes notifié."],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Brand />
          <nav className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#services" className="hover:text-slate-900">Services</a>
            <a href="#fonctionnement" className="hover:text-slate-900">Fonctionnement</a>
            <a href="#premium" className="hover:text-slate-900">Premium</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/connexion" className="btn-ghost">Connexion</Link>
            <Link href="/inscription" className="btn-primary">S'inscrire</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-brand-100),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.1fr_1fr] lg:py-28">
          <div className="animate-slide-up">
            <span className="chip bg-brand-50 text-brand-800 ring-1 ring-brand-600/15"><Recycle size={13} /> YDOL Ingénierie · Makepe, Douala - Cameroun</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] text-slate-900 sm:text-5xl lg:text-6xl">
              La collecte des déchets, <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">enfin connectée.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              WasteTracker relie la population, la tour de contrôle et les chauffeurs pour vider les bacs plus vite, réduire les coûts et garder nos quartiers propres.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/inscription" className="btn-primary px-6 py-3 text-base">Créer mon compte gratuit <ArrowRight size={18} /></Link>
              <a href="#fonctionnement" className="btn-secondary px-6 py-3 text-base">Comment ça marche</a>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[["−50 %", "d'attente pour un bac plein"], ["90 %", "du parc suivi en temps réel"], ["1 / jour", "capsule de sensibilisation"]].map(([v, l]) => (
                <div key={l}><p className="font-display text-2xl font-bold text-slate-900">{v}</p><p className="text-xs text-slate-500">{l}</p></div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rotate-3 rounded-[2rem] bg-gradient-to-br from-brand-200 to-emerald-100" />
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 to-brand-950 p-6 shadow-2xl">
              <div className="flex items-center justify-between text-white"><p className="font-semibold">Tour de contrôle</p><span className="chip bg-white/15 text-white">● En direct</span></div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[["Bacs pleins", "3", "bg-red-400"], ["Missions du jour", "12", "bg-sky-400"], ["Chauffeurs en ligne", "8", "bg-emerald-400"], ["Signalements", "5", "bg-amber-400"]].map(([l, v, c]) => (
                  <div key={l} className="rounded-2xl bg-white/10 p-4"><span className={`block h-1.5 w-8 rounded-full ${c}`} /><p className="mt-3 font-display text-3xl font-bold text-white">{v}</p><p className="text-xs text-brand-100">{l}</p></div>
                ))}
              </div>
              <div className="mt-3 rounded-2xl bg-white p-4">
                <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-lg">🗑️</span><div className="flex-1"><p className="text-sm font-semibold text-slate-800">Bac YDE-012 plein · Bastos</p><p className="text-xs text-slate-500">Signalé par Awa N. · il y a 4 min</p></div></div>
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-xs font-medium text-brand-800"><Truck size={14} /> Mission envoyée à Paul M. — 1,2 km</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="bg-slate-50/70 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-700">Une plateforme, trois applications</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-bold text-slate-900 sm:text-4xl">Tout ce qu'il faut pour une ville propre</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card-hover p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Icon size={22} /></div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="fonctionnement" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">Comment ça marche ?</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map(([t, d], i) => (
              <div key={t} className="relative rounded-3xl border border-slate-200 p-7">
                <span className="font-display text-5xl font-extrabold text-brand-100">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{t}</h3>
                <p className="mt-2 text-sm text-slate-600">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[[BarChart3, "Tour de contrôle", "Application web d'administration"], [Smartphone, "Chauffeurs", "Application mobile de terrain"], [Megaphone, "Population", "Web et application mobile client"]].map(([Icon, t, d]) => (
              <div key={t} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5"><Icon size={22} className="text-brand-700" /><div><p className="font-semibold text-slate-900">{t}</p><p className="text-sm text-slate-500">{d}</p></div></div>
            ))}
          </div>
        </div>
      </section>

      <section id="premium" className="px-5 pb-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 p-10 text-white md:flex-row md:p-14">
          <div className="flex-1">
            <p className="flex items-center gap-2 text-sm font-semibold"><Crown size={16} /> Service premium</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Vos déchets collectés chez vous.</h2>
            <p className="mt-3 max-w-lg text-amber-50">Choisissez votre fréquence, de 1 à 7 passages par semaine. Le prix est transparent : 1 000 F CFA par kilomètre parcouru depuis la caserne la plus proche.</p>
          </div>
          <Link href="/inscription" className="btn bg-white px-6 py-3 text-base text-orange-600 hover:bg-orange-50"><CalendarClock size={18} /> Calculer mon prix</Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-slate-500 sm:flex-row">
          <Brand />
          <p>© {new Date().getFullYear()} YDOL Ingénierie — WasteTracker. Projet ENSPY.</p>
        </div>
      </footer>
    </main>
  );
}
