import Link from "next/link";
import {
  ArrowRight, Bell, CalendarClock, Camera, CheckCircle2, Crown, Leaf, Map as MapIcon, Megaphone, Recycle, ShoppingBag, Sparkles, Truck,
} from "lucide-react";
import Brand from "@/components/shell/Brand";

const FEATURES = [
  { icon: Megaphone, title: "Signalement citoyen", text: "Un bac plein, un dépôt sauvage ? Une photo et votre position suffisent : l'équipe de collecte est prévenue en quelques secondes." },
  { icon: Truck, title: "Des collectes plus rapides", text: "Le camion disponible le plus proche est envoyé. Vous êtes notifié dès que le bac a été vidé." },
  { icon: MapIcon, title: "Les bacs près de chez vous", text: "Trouvez sur la carte le bac le plus proche et son état avant de vous déplacer." },
  { icon: Sparkles, title: "Le geste du jour", text: "Chaque jour, une mini-vidéo ou un diaporama pour adopter les bons réflexes face aux déchets." },
  { icon: Crown, title: "Collecte à domicile", text: "Abonnez-vous : un camion passe chez vous à la fréquence choisie, à un prix calculé selon la distance." },
  { icon: ShoppingBag, title: "Boutique verte", text: "Compost, charbon écologique, objets recyclés : des produits issus de la valorisation de nos déchets." },
];

const STEPS = [
  [Camera, "Vous signalez", "Depuis le site ou l'application, en une photo."],
  [Truck, "Nous organisons la collecte", "Le véhicule libre le plus proche est envoyé sur place."],
  [Bell, "Le bac est vidé, vous êtes prévenu", "La collecte est confirmée, preuve à l'appui."],
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
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div className="animate-slide-up">
            <span className="chip bg-brand-50 text-brand-800 ring-1 ring-brand-600/15"><Recycle size={13} /> YDOL Ingénierie · Makepe, Douala - Cameroun</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] text-slate-900 sm:text-5xl lg:text-6xl">
              Des quartiers propres, <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">avec vous.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Signalez un bac plein en une photo, suivez sa collecte, faites-vous collecter à domicile et adoptez chaque jour un geste simple pour votre ville.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/inscription" className="btn-primary px-6 py-3 text-base">Créer mon compte gratuit <ArrowRight size={18} /></Link>
              <a href="#fonctionnement" className="btn-secondary px-6 py-3 text-base">Comment ça marche</a>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[["10 s", "pour signaler un bac plein"], ["1 / jour", "geste de sensibilisation"], ["0 F", "pour créer son compte"]].map(([v, l]) => (
                <div key={l}><p className="font-display text-2xl font-bold text-slate-900">{v}</p><p className="text-xs text-slate-500">{l}</p></div>
              ))}
            </div>
          </div>
          <figure className="relative">
            <div className="absolute -inset-4 rotate-3 rounded-[2rem] bg-gradient-to-br from-brand-200 to-emerald-100" />
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
              <img src="/assets/collecte-douala.jpg" alt="Agents de collecte vidant des poubelles dans un camion, dans une rue de Douala"
                className="aspect-[4/3] w-full object-cover" />
              <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/45 to-transparent p-4 pb-16">
                <div className="flex max-w-xs items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><CheckCircle2 size={20} /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">Votre signalement est résolu</p>
                    <p className="truncate text-xs text-slate-500">Le bac du carrefour a été vidé · il y a 5 min</p>
                  </div>
                </div>
              </div>
            </div>
            <figcaption className="relative mt-3 text-right text-[11px] text-slate-400">
              Collecte à Douala · Photo{" "}
              <a href="https://commons.wikimedia.org/wiki/File:Garbage_Collector_02.jpg" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">Minette Lontsie</a>,{" "}
              <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">CC BY-SA 4.0</a>
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="services" className="bg-slate-50/70 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-700">Nos services</p>
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
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <img src="/assets/create-account-image.png" alt="Une habitante utilise son téléphone"
              className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-xl" style={{ objectPosition: "70% center" }} />
            <div className="absolute -bottom-5 left-5 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-lg ring-1 ring-slate-100">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><Megaphone size={18} /></span>
              <div><p className="text-sm font-semibold text-slate-800">Bac plein signalé</p><p className="text-xs text-slate-500">Photo et position envoyées</p></div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Fonctionnement</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Comment ça marche ?</h2>
            <ol className="mt-8 space-y-5">
              {STEPS.map(([Icon, t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white"><Icon size={20} /></span>
                  <div>
                    <p className="text-xs font-semibold text-brand-700">Étape {i + 1}</p>
                    <h3 className="text-lg font-semibold text-slate-900">{t}</h3>
                    <p className="text-sm text-slate-600">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm text-slate-500">Disponible sur le Web dès aujourd'hui, et bientôt sur l'application mobile.</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50/70 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-700"><Leaf size={15} /> Valorisation</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Vos déchets ont une seconde vie.</h2>
            <p className="mt-4 max-w-lg text-slate-600">
              Les déchets collectés sont triés et transformés : compost pour vos jardins, charbon écologique, objets recyclés.
              Retrouvez-les dans la boutique verte, en retrait ou en livraison.
            </p>
            <Link href="/inscription" className="btn-primary mt-8 px-6 py-3 text-base"><ShoppingBag size={18} /> Découvrir la boutique</Link>
          </div>
          <img src="/assets/login-image.jpeg" alt="Une jeune pousse dans des mains pleines de compost"
            className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-xl" style={{ objectPosition: "center 60%" }} />
        </div>
      </section>

      <section id="premium" className="px-5 py-20">
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
