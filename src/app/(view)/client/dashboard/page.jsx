"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock, Check, Crown, Map as MapIcon, Megaphone, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import CapsulePlayer from "@/components/awareness/CapsulePlayer";
import { useAsync } from "@/hooks/useAsync";
import { useSession } from "@/components/providers/SessionProvider";
import { dashboard } from "@/services/dashboard";
import { awareness } from "@/services/awareness";
import { notify } from "@/lib/notify";
import { formatDate, formatDateTime, fullName } from "@/lib/format";

export default function ClientDashboard() {
  const { user } = useSession();
  const { data: d, loading, setData } = useAsync(() => dashboard.client(), []);
  const [understood, setUnderstood] = useState(false);
  const capsule = d?.todayCapsule;
  const sub = d?.subscription;
  const isPremium = sub?.status === "ACTIVE";

  const markUnderstood = async () => {
    const r = await awareness.view(capsule.id, true, true);
    if (r.success) {
      setUnderstood(true);
      setData((x) => ({ ...x, todayCapsule: r.data, capsulesViewed: (x.capsulesViewed || 0) + (capsule.viewed ? 0 : 1) }));
      notify.success("Merci ! Chaque geste compte 🌱");
    }
  };

  const firstName = user?.firstName || fullName(user);
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-6 text-white sm:p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-emerald-300/20 blur-2xl" />
        <div className="relative">
          <p className="text-sm text-brand-100">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Bonjour {firstName} 👋</h1>
          <p className="mt-2 max-w-lg text-sm text-brand-100">Ensemble, gardons {user?.quarter || "votre quartier"} propre. Un bac plein ? Signalez-le en quelques secondes.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/client/reports" className="btn bg-white text-brand-800 hover:bg-brand-50"><Megaphone size={16} /> Signaler un bac plein</Link>
            <Link href="/client/map" className="btn bg-white/15 text-white hover:bg-white/25"><MapIcon size={16} /> Bacs près de moi</Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Sparkles size={17} /></span>
              <p className="font-semibold text-slate-900">Le geste du jour</p>
            </div>
            <Link href="/client/awareness" className="text-sm font-medium text-brand-700 hover:underline">Médiathèque</Link>
          </div>
          <div className="p-5">
            {loading ? <Skeleton className="aspect-video" /> : capsule ? (
              <>
                <CapsulePlayer capsule={capsule} onComplete={() => awareness.view(capsule.id, true, false)} />
                <h2 className="mt-4 text-lg font-bold text-slate-900">{capsule.title}</h2>
                {capsule.keyMessage && <p className="mt-1 text-sm text-slate-600">{capsule.keyMessage}</p>}
                <div className="mt-4 flex items-center justify-between gap-3">
                  {capsule.theme && <Badge tone="violet">{capsule.theme}</Badge>}
                  {capsule.understood || understood ? (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-brand-700"><Check size={16} /> Compris, merci !</span>
                  ) : (
                    <button className="btn-primary" onClick={markUnderstood}><Check size={16} /> J'ai compris</button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center rounded-2xl bg-slate-50 text-center text-sm text-slate-500"><Sparkles size={28} className="mb-2 text-slate-300" />La capsule du jour arrive bientôt.</div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          {isPremium ? (
            <Card className="overflow-hidden border-amber-200">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white">
                <p className="flex items-center gap-2 text-sm font-semibold"><Crown size={16} /> Abonnement premium</p>
                <p className="mt-2 font-display text-3xl font-bold">{sub.quotaRemaining} <span className="text-base font-medium">collecte(s) restante(s)</span></p>
                <p className="text-xs text-amber-50">jusqu'au {formatDate(sub.endDate)}</p>
              </div>
              <div className="p-4"><Link href="/client/premium" className="btn-primary w-full"><CalendarClock size={16} /> Demander une collecte</Link></div>
            </Card>
          ) : (
            <Card className="p-5">
              <p className="flex items-center gap-2 font-semibold text-slate-900"><Crown size={17} className="text-amber-500" /> {user?.type === "PREMIUM" ? "Collecte à domicile" : "Passez premium"}</p>
              <p className="mt-1 text-sm text-slate-500">
                {sub?.status === "PENDING_PAYMENT" ? "Votre souscription attend la confirmation du paiement."
                  : user?.type === "PREMIUM" ? "Votre compte est premium : choisissez la fréquence de passage du camion chez vous."
                  : "La collecte à domicile est réservée aux clients premium. Activation : 10 000 F CFA."}
              </p>
              <Link href="/client/premium" className="btn-secondary mt-4 w-full">{sub?.status === "PENDING_PAYMENT" ? "Voir ma souscription" : user?.type === "PREMIUM" ? "Choisir ma collecte" : "Devenir premium"} <ArrowRight size={15} /></Link>
            </Card>
          )}

          <Card className="p-5">
            <p className="mb-3 font-semibold text-slate-900">Mon activité</p>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Signalements en cours" value={d?.openReports} href="/client/reports" loading={loading} />
              <Stat label="Signalements résolus" value={d?.resolvedReports} href="/client/reports" loading={loading} />
              <Stat label="Commandes en cours" value={d?.activeOrders} href="/client/orders" loading={loading} />
              <Stat label="Capsules vues" value={d?.capsulesViewed} href="/client/awareness" loading={loading} />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <p className="flex items-center gap-2 font-semibold text-slate-900"><Truck size={17} className="text-brand-600" /> Prochaines collectes dans mon quartier</p>
          {loading ? <Skeleton className="mt-4 h-16" /> : d?.upcomingToursInQuarter?.length ? (
            <ul className="mt-3 space-y-2">
              {d.upcomingToursInQuarter.map((m) => (
                <li key={m.id} className="flex items-center gap-3 rounded-xl bg-brand-50/60 px-4 py-3">
                  <CalendarClock size={18} className="text-brand-700" />
                  <div><p className="text-sm font-semibold text-slate-800">{formatDateTime(m.start)}</p><p className="text-xs text-slate-500">Tournée à {m.district}</p></div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">{user?.quarter ? `Aucune tournée programmée à ${user.quarter} cette semaine. Vous serez notifié dès qu'une collecte sera planifiée.` : "Renseignez votre quartier dans votre profil pour être prévenu des tournées."}</p>
          )}
        </Card>
        <Link href="/client/shop" className="card-hover group flex items-center gap-5 overflow-hidden p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-brand-200 text-brand-800"><ShoppingBag size={28} /></div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">La boutique verte</p>
            <p className="text-sm text-slate-500">Compost, charbon écologique, objets recyclés… issus de vos déchets.</p>
          </div>
          <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-600" />
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, href, loading }) {
  return (
    <Link href={href} className="rounded-xl bg-slate-50 p-3 transition hover:bg-brand-50">
      {loading ? <Skeleton className="h-7 w-10" /> : <p className="font-display text-2xl font-bold text-slate-900">{value ?? 0}</p>}
      <p className="text-xs text-slate-500">{label}</p>
    </Link>
  );
}
