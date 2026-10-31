"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Check, Clock, Crown, Phone, Route, Wallet, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Input, Select, Textarea } from "@/components/ui/Field";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import Spinner from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/Modal";
import { MapPicker } from "@/components/map";
import PremiumUpgrade from "@/components/premium/PremiumUpgrade";
import { useSession } from "@/components/providers/SessionProvider";
import { useAction, useAsync } from "@/hooks/useAsync";
import { subscriptions as subscriptionService } from "@/services/subscription";
import { collectionRequests } from "@/services/collectionRequest";
import { notify } from "@/lib/notify";
import { formatDate, formatFcfa, isoDate } from "@/lib/format";
import { REQUEST_STATUS, SLOTS, SUBSCRIPTION_STATUS } from "@/lib/labels";

const FREQUENCIES = [1, 2, 3, 5, 7];
const DAYS = [["MONDAY", "Lun"], ["TUESDAY", "Mar"], ["WEDNESDAY", "Mer"], ["THURSDAY", "Jeu"], ["FRIDAY", "Ven"], ["SATURDAY", "Sam"], ["SUNDAY", "Dim"]];

export default function PremiumPage() {
  const { user } = useSession();
  const sub = useAsync(() => subscriptionService.mine(), [], { sync: ["subscription", "profile"] });
  const current = sub.data && ["PENDING_PAYMENT", "ACTIVE", "SUSPENDED"].includes(sub.data.status) ? sub.data : null;

  return (
    <div>
      <PageHeader eyebrow="Service premium" title="Collecte à domicile" subtitle="Un camion passe chez vous à la fréquence de votre choix. Le prix dépend de la distance à la caserne la plus proche." />
      {sub.loading ? <Skeleton className="h-96" /> : current?.status === "ACTIVE" ? (
        <ActiveSubscription sub={current} onChange={() => sub.reload({ silent: true })} />
      ) : current?.status === "PENDING_PAYMENT" ? (
        <PendingSubscription sub={current} onChange={() => sub.reload({ silent: true })} />
      ) : current?.status === "SUSPENDED" ? (
        <Card className="p-8 text-center"><Crown size={30} className="mx-auto text-slate-300" /><p className="mt-3 font-semibold text-slate-800">Votre abonnement est suspendu</p><p className="mt-1 text-sm text-slate-500">Contactez YDOL Ingénierie pour le réactiver.</p></Card>
      ) : user?.type !== "PREMIUM" ? (
        <PremiumUpgrade onActivated={() => sub.reload({ silent: true })} />
      ) : (
        <Subscribe previous={sub.data} onDone={() => sub.reload({ silent: true })} />
      )}
    </div>
  );
}

function Subscribe({ previous, onDone }) {
  const [position, setPosition] = useState(previous ? { latitude: previous.latitude, longitude: previous.longitude } : null);
  const [frequency, setFrequency] = useState(previous?.frequencyPerWeek || 2);
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [form, setForm] = useState({ address: previous?.address || "", accessNotes: previous?.accessNotes || "", callBefore: previous?.callBefore || false, preferredDays: [], preferredSlot: "MORNING" });
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Devis recalculé à chaque changement de position ou de fréquence
  useEffect(() => {
    if (!position) return undefined;
    setQuoting(true);
    const id = setTimeout(async () => {
      const r = await subscriptionService.quote(position.latitude, position.longitude, frequency);
      setQuoting(false);
      if (r.success) setQuote(r.data);
      else { setQuote(null); notify.error(r.error); }
    }, 350);
    return () => clearTimeout(id);
  }, [position?.latitude, position?.longitude, frequency]);

  const toggleDay = (d) => set({ preferredDays: form.preferredDays.includes(d) ? form.preferredDays.filter((x) => x !== d) : [...form.preferredDays, d] });

  const subscribe = async (e) => {
    e.preventDefault();
    if (!position || !quote) return notify.warning("Indiquez votre point de collecte sur la carte");
    setSaving(true);
    const r = await subscriptionService.subscribe({ ...position, frequencyPerWeek: frequency, ...form, preferredDays: form.preferredDays.join(",") || null });
    setSaving(false);
    if (r.success) { notify.success("Souscription enregistrée !"); onDone(); } else notify.error(r.error);
  };

  return (
    <form onSubmit={subscribe} className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[[Crown, "Compte premium", "Activé : choisissez votre collecte"], [CalendarClock, "À votre rythme", "De 1 à 7 passages par semaine"], [Wallet, "Prix transparent", "1 000 F CFA par km parcouru"]].map(([Icon, t, d]) => (
            <Card key={t} className="p-4"><Icon size={20} className="text-amber-500" /><p className="mt-2 text-sm font-semibold text-slate-900">{t}</p><p className="text-xs text-slate-500">{d}</p></Card>
          ))}
        </div>
        <Card>
          <CardHeader title="1. Votre point de collecte" subtitle="Placez précisément votre domicile ou votre site sur la carte" />
          <div className="px-5 pb-5"><MapPicker value={position} onChange={setPosition} height={320} kind="home" /></div>
        </Card>
        <Card>
          <CardHeader title="2. Vos préférences" />
          <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
            <Input className="sm:col-span-2" label="Adresse / repère" value={form.address} onChange={(e) => set({ address: e.target.value })} placeholder="Ex. Bastos, portail vert après l'ambassade" />
            <div className="sm:col-span-2">
              <p className="label">Jours préférés</p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(([v, l]) => (
                  <button type="button" key={v} onClick={() => toggleDay(v)} className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${form.preferredDays.includes(v) ? "border-brand-500 bg-brand-50 text-brand-800" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>{l}</button>
                ))}
              </div>
            </div>
            <Select label="Créneau préféré" value={form.preferredSlot} onChange={(e) => set({ preferredSlot: e.target.value })} options={Object.entries(SLOTS).map(([value, s]) => ({ value, label: s.label }))} />
            <label className="flex cursor-pointer items-center gap-3 self-end rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700">
              <input type="checkbox" checked={form.callBefore} onChange={(e) => set({ callBefore: e.target.checked })} className="h-4 w-4 accent-brand-600" />
              <Phone size={15} className="text-slate-400" /> M'appeler avant le passage
            </label>
            <Textarea className="sm:col-span-2" label="Difficultés d'accès / consignes" value={form.accessNotes} onChange={(e) => set({ accessNotes: e.target.value })} placeholder="Ex. Ruelle étroite, sonner au portail, chien dans la cour…" />
          </div>
        </Card>
      </div>

      <div className="lg:sticky lg:top-24 lg:h-fit">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 p-5 text-white">
            <p className="flex items-center gap-2 text-sm font-semibold"><Crown size={16} /> Votre abonnement</p>
            <p className="mt-1 text-xs text-amber-50">Période de {quote?.periodWeeks || 4} semaines, renouvelable</p>
          </div>
          <div className="space-y-5 p-5">
            <div>
              <p className="label">Fréquence de collecte</p>
              <div className="grid grid-cols-5 gap-1.5">
                {FREQUENCIES.map((f) => (
                  <button type="button" key={f} onClick={() => setFrequency(f)} className={`rounded-xl border py-2.5 text-center transition ${frequency === f ? "border-amber-500 bg-amber-50 text-amber-900 ring-4 ring-amber-500/10" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                    <span className="block font-display text-lg font-bold">{f}</span>
                    <span className="block text-[10px]">/ sem.</span>
                  </button>
                ))}
              </div>
            </div>
            {!position ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500"><Route size={22} className="mx-auto mb-2 text-slate-300" />Placez votre point de collecte sur la carte pour calculer le prix.</div>
            ) : quoting && !quote ? <Skeleton className="h-40" /> : quote && (
              <div className={`transition ${quoting ? "opacity-50" : ""}`}>
                <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm">
                  <Line label="Caserne la plus proche" value={quote.depotName} />
                  <Line label="Distance" value={`${quote.distanceKm.toLocaleString("fr-FR")} km`} />
                  <Line label="Trajet par collecte (aller-retour)" value={`${(quote.distanceKm * quote.tripFactor).toLocaleString("fr-FR")} km`} />
                  <Line label="Prix par collecte" value={formatFcfa(quote.pricePerCollection)} strong />
                  <Line label="Collectes incluses" value={`${quote.collections} (${quote.frequencyPerWeek} × ${quote.periodWeeks} sem.)`} />
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-sm text-slate-500">Total de la période</span>
                  <span className="font-display text-3xl font-bold text-slate-900">{formatFcfa(quote.totalPrice)}</span>
                </div>
                <p className="mt-1 text-right text-xs text-slate-400">soit {formatFcfa(Math.round(quote.totalPrice / quote.periodWeeks))} par semaine</p>
              </div>
            )}
            <button className="btn w-full bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-white shadow-sm hover:from-amber-600 hover:to-orange-600" disabled={!quote || saving}>
              {saving ? <Spinner /> : <Crown size={16} />} Souscrire
            </button>
            <p className="text-center text-xs text-slate-400">Paiement en espèces auprès de YDOL après souscription. Mobile Money bientôt disponible.</p>
          </div>
        </Card>
      </div>
    </form>
  );
}

function Line({ label, value, strong }) {
  return <div className="flex justify-between gap-3"><span className="text-slate-500">{label}</span><span className={strong ? "font-bold text-slate-900" : "font-medium text-slate-700"}>{value}</span></div>;
}

function PendingSubscription({ sub, onChange }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, run] = useAction();
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-4 bg-amber-50 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Clock size={26} /></div>
          <div>
            <p className="font-semibold text-slate-900">Souscription enregistrée — paiement en attente</p>
            <p className="text-sm text-slate-600">Votre abonnement sera activé dès réception du paiement.</p>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-end justify-between rounded-2xl bg-slate-50 p-5">
            <div><p className="text-sm text-slate-500">Montant à régler</p><p className="text-xs text-slate-400">{sub.quotaTotal} collectes · {sub.frequencyPerWeek}/semaine · {sub.periodWeeks} semaines</p></div>
            <p className="font-display text-3xl font-bold text-slate-900">{formatFcfa(sub.totalPrice)}</p>
          </div>
          <ol className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">1</span>Réglez ce montant en espèces à l'agence YDOL Ingénierie ou auprès d'un agent.</li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">2</span>Un administrateur confirme le paiement : vous recevez une notification.</li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">3</span>Vous pouvez alors demander vos collectes depuis cette page.</li>
          </ol>
          <button className="btn-ghost w-full text-red-600" onClick={() => setConfirm(true)}>Annuler ma souscription</button>
        </div>
      </Card>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} danger pending={pending} title="Annuler la souscription ?" confirmLabel="Annuler" message="Vous pourrez souscrire de nouveau à tout moment."
        onConfirm={() => run(async () => { const r = await subscriptionService.cancelMine(); if (r.success) { notify.success("Souscription annulée"); onChange(); } else notify.error(r.error); })} />
    </div>
  );
}

function ActiveSubscription({ sub, onChange }) {
  const requests = useAsync(() => collectionRequests.mine(), [], { initial: [], sync: ["subscription"] });
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [form, setForm] = useState({ requestedDate: isoDate(tomorrow), slot: sub.preferredSlot || "MORNING", comment: "" });
  const [cancelReq, setCancelReq] = useState(null);
  const [cancelSub, setCancelSub] = useState(false);
  const [pending, run] = useAction();
  const open = requests.data.filter((r) => ["PENDING", "PLANNED"].includes(r.status)).length;
  const available = Math.max(0, sub.quotaRemaining - open);
  const pct = sub.quotaTotal ? (sub.quotaUsed / sub.quotaTotal) * 100 : 0;

  const request = (e) => {
    e.preventDefault();
    run(async () => {
      const r = await collectionRequests.create(form);
      if (r.success) { notify.success("Demande envoyée — vous serez notifié de sa planification"); setForm({ ...form, comment: "" }); requests.reload({ silent: true }); onChange(); } else notify.error(r.error);
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 p-6 text-white">
            <div className="flex items-center justify-between"><p className="flex items-center gap-2 font-semibold"><Crown size={18} /> Premium actif</p><StatusBadge map={SUBSCRIPTION_STATUS} value={sub.status} /></div>
            <p className="mt-4 font-display text-5xl font-bold">{sub.quotaRemaining}</p>
            <p className="text-sm text-amber-50">collecte(s) restante(s) sur {sub.quotaTotal}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/30"><div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} /></div>
          </div>
          <div className="space-y-2 p-5 text-sm">
            <Line label="Période" value={`${formatDate(sub.startDate)} → ${formatDate(sub.endDate)}`} />
            <Line label="Fréquence" value={`${sub.frequencyPerWeek} / semaine`} />
            <Line label="Point de collecte" value={sub.address || "Position GPS"} />
            <Line label="Montant réglé" value={formatFcfa(sub.totalPrice)} />
            <button className="btn-ghost mt-2 w-full text-xs text-red-600" onClick={() => setCancelSub(true)}>Résilier l'abonnement</button>
          </div>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader title="Demander une collecte" subtitle={available > 0 ? `${available} demande(s) possible(s) — au moins 24 h à l'avance` : "Quota épuisé pour cette période"} icon={<CalendarClock size={18} />} />
          <form onSubmit={request} className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
            <Input label="Date" type="date" required min={isoDate(tomorrow)} max={sub.endDate} value={form.requestedDate} onChange={(e) => setForm({ ...form, requestedDate: e.target.value })} />
            <Select label="Créneau" value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })} options={Object.entries(SLOTS).map(([value, s]) => ({ value, label: s.label }))} />
            <Textarea className="sm:col-span-2" label="Précision (facultatif)" rows={2} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="Ex. Beaucoup de déchets verts cette fois" />
            <button className="btn-primary sm:col-span-2" disabled={pending || available <= 0}>{pending ? <Spinner /> : <Check size={16} />} Envoyer la demande</button>
          </form>
        </Card>
        <Card>
          <CardHeader title="Mes demandes" />
          <div className="px-3 pb-3">
            {requests.loading ? <Skeleton className="mx-2 h-16" /> : requests.data.length === 0 ? <EmptyState compact title="Aucune demande" description="Vos demandes de collecte apparaîtront ici." /> : (
              <ul className="space-y-1">
                {requests.data.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-slate-50">
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                      <span className="text-[9px] font-semibold uppercase">{new Date(r.requestedDate).toLocaleDateString("fr-FR", { month: "short" })}</span>
                      <span className="font-display text-base font-bold leading-none">{new Date(r.requestedDate).getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">{SLOTS[r.slot]?.label || "Créneau libre"}</p>
                      <p className="truncate text-xs text-slate-500">{r.driverName ? `Chauffeur : ${r.driverName}` : r.rejectionReason || r.comment || "—"}</p>
                    </div>
                    <StatusBadge map={REQUEST_STATUS} value={r.status} />
                    {["PENDING", "PLANNED"].includes(r.status) && <button className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => setCancelReq(r)} aria-label="Annuler"><X size={15} /></button>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
      <ConfirmDialog open={!!cancelReq} onClose={() => setCancelReq(null)} pending={pending} danger title="Annuler cette demande ?" confirmLabel="Annuler la demande"
        message="Une annulation plus de 24 h à l'avance n'est pas décomptée de votre quota."
        onConfirm={() => run(async () => { const r = await collectionRequests.cancel(cancelReq.id); if (r.success) { notify.success("Demande annulée"); setCancelReq(null); requests.reload({ silent: true }); } else notify.error(r.error); })} />
      <ConfirmDialog open={cancelSub} onClose={() => setCancelSub(false)} pending={pending} danger title="Résilier l'abonnement ?" confirmLabel="Résilier"
        message="Les collectes restantes seront perdues et ne sont pas remboursées."
        onConfirm={() => run(async () => { const r = await subscriptionService.cancelMine(); if (r.success) { notify.success("Abonnement résilié"); onChange(); } else notify.error(r.error); })} />
    </div>
  );
}
