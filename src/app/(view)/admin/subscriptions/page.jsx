"use client";

import { useState } from "react";
import { BadgeCheck, Crown, MapPin, Pause, Phone, XCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, StatCard } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { DataTable, FilterPills, SearchInput } from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { ConfirmDialog, DetailRow, Drawer, ReasonDialog } from "@/components/ui/Modal";
import { LeafletMap } from "@/components/map";
import { useAction, useAsync } from "@/hooks/useAsync";
import { subscriptions as subscriptionService } from "@/services/subscription";
import { premium } from "@/services/premium";
import { notify } from "@/lib/notify";
import { formatDate, formatDateTime, formatFcfa, includesText } from "@/lib/format";
import { SLOTS, SUBSCRIPTION_STATUS } from "@/lib/labels";

export default function SubscriptionsPage() {
  const list = useAsync(() => subscriptionService.getAll(), [], { initial: [] });
  const activations = useAsync(() => premium.activations(), [], { initial: [] });
  const [filter, setFilter] = useState("PENDING_PAYMENT");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [activating, setActivating] = useState(null);
  const [reasonFor, setReasonFor] = useState(null); // { sub, action: "suspend" | "cancel" }
  const [pending, run] = useAction();

  const rows = list.data.filter((s) => filter === "ALL" || s.status === filter).filter((s) => includesText(`${s.clientName} ${s.clientPhone} ${s.address}`, query));
  const count = (st) => list.data.filter((s) => s.status === st).length;
  const activeRevenue = list.data.filter((s) => s.status === "ACTIVE").reduce((sum, s) => sum + s.totalPrice, 0);

  const act = (fn, msg) => run(async () => {
    const r = await fn();
    if (r.success) { notify.success(msg); setSelected(null); setActivating(null); setReasonFor(null); list.reload({ silent: true }); } else notify.error(r.error);
  });

  const columns = [
    { key: "client", header: "Client", render: (s) => <div><p className="font-semibold text-slate-800">{s.clientName}</p><p className="text-xs text-slate-500">{s.clientPhone}</p></div> },
    { key: "freq", header: "Formule", render: (s) => <div><p className="text-slate-700">{s.frequencyPerWeek} collecte(s) / semaine</p><p className="text-xs text-slate-400">{s.distanceKm} km de {s.depotName || "la caserne"}</p></div> },
    { key: "price", header: "Montant", render: (s) => <div><p className="font-semibold text-slate-900">{formatFcfa(s.totalPrice)}</p><p className="text-xs text-slate-400">{formatFcfa(s.pricePerCollection)} / collecte</p></div> },
    { key: "quota", header: "Quota", hideOnMobile: true, render: (s) => s.status === "ACTIVE" ? (
      <div className="w-28"><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-brand-500" style={{ width: `${(s.quotaUsed / s.quotaTotal) * 100}%` }} /></div><p className="mt-1 text-xs text-slate-500">{s.quotaRemaining} restante(s) / {s.quotaTotal}</p></div>
    ) : "—" },
    { key: "period", header: "Période", hideOnMobile: true, render: (s) => s.startDate ? <span className="text-xs text-slate-600">{formatDate(s.startDate)} → {formatDate(s.endDate)}</span> : <span className="text-xs text-slate-400">Demandé le {formatDate(s.createdAt)}</span> },
    { key: "status", header: "Statut", render: (s) => <StatusBadge map={SUBSCRIPTION_STATUS} value={s.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Abonnements premium" subtitle="Collecte à domicile des clients premium : validez les paiements reçus pour activer les abonnements (paiement hors ligne en phase 1)." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={<BadgeCheck size={20} />} label="Paiements à confirmer" value={count("PENDING_PAYMENT")} loading={list.loading} tone="amber" />
        <StatCard icon={<Crown size={20} />} label="Abonnements actifs" value={count("ACTIVE")} loading={list.loading} tone="green" />
        <StatCard icon={<Crown size={20} />} label="Valeur des abonnements actifs" value={formatFcfa(activeRevenue)} loading={list.loading} tone="blue" />
      </div>
      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterPills value={filter} onChange={setFilter} options={[
            { value: "PENDING_PAYMENT", label: "À activer", count: count("PENDING_PAYMENT") },
            { value: "ACTIVE", label: "Actifs", count: count("ACTIVE") },
            { value: "SUSPENDED", label: "Suspendus", count: count("SUSPENDED") },
            { value: "ALL", label: "Tous", count: list.data.length },
          ]} />
          <SearchInput value={query} onChange={setQuery} placeholder="Client, téléphone…" className="lg:w-64" />
        </div>
        <DataTable columns={columns} rows={rows} loading={list.loading} error={list.error} onRetry={list.reload} onRowClick={setSelected}
          empty={<EmptyState icon={<Crown size={26} />} title="Aucun abonnement" description="Les souscriptions des clients apparaîtront ici." />} />
      </Card>

      <Card className="mt-6">
        <div className="border-b border-slate-100 p-4">
          <p className="font-semibold text-slate-900">Activations de comptes premium</p>
          <p className="text-sm text-slate-500">Frais d'activation payés par Mobile Money — paiements simulés en phase 1 : aucun encaissement réel.</p>
        </div>
        <DataTable rows={activations.data} loading={activations.loading} error={activations.error} onRetry={activations.reload}
          columns={[
            { key: "client", header: "Client", render: (a) => <span className="font-medium text-slate-800">{a.clientName}</span> },
            { key: "reference", header: "Référence", render: (a) => <span className="font-mono text-xs text-slate-600">{a.reference}</span> },
            { key: "operator", header: "Moyen", hideOnMobile: true, render: (a) => <span className="text-slate-600">{a.operator === "MTN_MOMO" ? "MTN Mobile Money" : "Orange Money"} · {a.phone}</span> },
            { key: "amount", header: "Montant", render: (a) => <span>{formatFcfa(a.amount)}{a.simulated && <span className="ml-2 chip bg-amber-50 text-amber-700">simulé</span>}</span> },
            { key: "date", header: "Date", hideOnMobile: true, render: (a) => <span className="text-slate-500">{formatDateTime(a.createdAt)}</span> },
          ]}
          empty={<EmptyState compact icon={<Crown size={24} />} title="Aucune activation" description="Les clients qui passent premium apparaîtront ici." />} />
      </Card>

      {selected && (
        <Drawer open onClose={() => setSelected(null)} title={selected.clientName} subtitle={<StatusBadge map={SUBSCRIPTION_STATUS} value={selected.status} />}
          footer={<>
            {selected.status === "ACTIVE" && <button className="btn-secondary" onClick={() => setReasonFor({ sub: selected, action: "suspend" })}><Pause size={15} /> Suspendre</button>}
            {["ACTIVE", "PENDING_PAYMENT", "SUSPENDED"].includes(selected.status) && <button className="btn-danger-soft" onClick={() => setReasonFor({ sub: selected, action: "cancel" })}><XCircle size={15} /> Résilier</button>}
            {["PENDING_PAYMENT", "SUSPENDED"].includes(selected.status) && <button className="btn-primary" onClick={() => setActivating(selected)}><BadgeCheck size={15} /> {selected.status === "SUSPENDED" ? "Réactiver" : "Confirmer le paiement"}</button>}
          </>}>
          <div className="mb-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-amber-700">Montant de la période</p>
            <p className="mt-1 font-display text-3xl font-bold text-slate-900">{formatFcfa(selected.totalPrice)}</p>
            <p className="mt-1 text-xs text-slate-600">{selected.tripFactor} × {selected.distanceKm} km × {formatFcfa(selected.pricePerKm)}/km = {formatFcfa(selected.pricePerCollection)} par collecte · {selected.quotaTotal} collectes</p>
          </div>
          <DetailRow label="Téléphone"><a href={`tel:${selected.clientPhone}`} className="flex items-center justify-end gap-1 text-brand-700"><Phone size={13} />{selected.clientPhone}</a></DetailRow>
          <DetailRow label="E-mail">{selected.clientEmail}</DetailRow>
          <DetailRow label="Adresse"><span className="flex items-center justify-end gap-1"><MapPin size={13} />{selected.address || "Position GPS"}</span></DetailRow>
          <DetailRow label="Fréquence">{selected.frequencyPerWeek} collecte(s) / semaine</DetailRow>
          <DetailRow label="Jours / créneau">{[selected.preferredDays, SLOTS[selected.preferredSlot]?.label].filter(Boolean).join(" · ") || "—"}</DetailRow>
          <DetailRow label="Accès">{selected.accessNotes || "—"}</DetailRow>
          <DetailRow label="Appeler avant">{selected.callBefore ? "Oui" : "Non"}</DetailRow>
          <DetailRow label="Caserne">{selected.depotName}</DetailRow>
          {selected.activatedAt && <DetailRow label="Activé">{formatDateTime(selected.activatedAt)} par {selected.activatedByName}</DetailRow>}
          {selected.latitude != null && (
            <div className="mt-5 h-48 overflow-hidden rounded-2xl border border-slate-200">
              <LeafletMap markers={[{ id: "s", position: [selected.latitude, selected.longitude], kind: "home", color: "amber" }]} zoom={15} />
            </div>
          )}
        </Drawer>
      )}

      <ConfirmDialog open={!!activating} onClose={() => setActivating(null)} pending={pending} title="Confirmer le paiement" confirmLabel="Activer l'abonnement"
        message={activating ? `Confirmez-vous avoir reçu ${formatFcfa(activating.totalPrice)} de ${activating.clientName} ? L'abonnement sera actif pour ${activating.periodWeeks} semaines.` : ""}
        onConfirm={() => act(() => subscriptionService.activate(activating.id), "Abonnement activé — le client est notifié")} />
      <ReasonDialog open={!!reasonFor} onClose={() => setReasonFor(null)} pending={pending}
        title={reasonFor?.action === "suspend" ? "Suspendre l'abonnement" : "Résilier l'abonnement"} confirmLabel={reasonFor?.action === "suspend" ? "Suspendre" : "Résilier"}
        suggestions={["Impayé", "Demande du client", "Abus constaté", "Déménagement"]}
        onConfirm={(reason) => act(() => (reasonFor.action === "suspend" ? subscriptionService.suspend(reasonFor.sub.id, reason) : subscriptionService.cancel(reasonFor.sub.id, reason)), "Abonnement mis à jour")} />
    </div>
  );
}
