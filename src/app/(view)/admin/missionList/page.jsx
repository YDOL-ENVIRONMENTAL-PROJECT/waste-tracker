"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, MapPin, Plus, Truck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { DataTable, FilterPills, SearchInput } from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { Drawer, DetailRow, ReasonDialog } from "@/components/ui/Modal";
import { LeafletMap } from "@/components/map";
import { useAction, useAsync } from "@/hooks/useAsync";
import { missions as missionService } from "@/services/mission";
import { notify } from "@/lib/notify";
import { formatDate, formatDateTime, formatTime, includesText, isoDate } from "@/lib/format";
import { MISSION_PURPOSE, MISSION_STATUS, PRIORITY } from "@/lib/labels";

const ACTIVE = ["PLANNED", "ASSIGNED", "ACCEPTED", "IN_PROGRESS"];

export default function MissionListPage() {
  const [day, setDay] = useState(isoDate());
  const [allDates, setAllDates] = useState(false);
  const list = useAsync(() => missionService.getAll(allDates ? {} : { date: day }), [day, allDates], { initial: [], pollMs: 45_000, sync: ["admin:missions"] });
  const [filter, setFilter] = useState("ALL");
  const [purpose, setPurpose] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [pending, run] = useAction();

  const rows = useMemo(() => list.data
    .filter((m) => filter === "ALL" || (filter === "ACTIVE" ? ACTIVE.includes(m.status) : m.status === filter))
    .filter((m) => purpose === "ALL" || m.purpose === purpose)
    .filter((m) => includesText(`${m.id} ${m.district} ${m.city} ${m.driverFullName} ${m.vehicleImmatriculation} ${m.description}`, query)),
  [list.data, filter, purpose, query]);

  const count = (pred) => list.data.filter(pred).length;
  const shiftDay = (n) => {
    const d = new Date(day);
    d.setDate(d.getDate() + n);
    setDay(isoDate(d));
  };

  const cancel = (reason) => run(async () => {
    const r = await missionService.cancel(cancelling.id, reason);
    if (r.success) {
      notify.success(`Mission #${cancelling.id} annulée`);
      setCancelling(null);
      setSelected(null);
      list.reload({ silent: true });
    } else notify.error(r.error);
  });

  const columns = [
    { key: "time", header: "Heure", render: (m) => (
      <div><p className="font-display font-bold text-slate-800">{formatTime(m.start)}</p>{allDates && <p className="text-xs text-slate-400">{formatDate(m.start)}</p>}</div>
    ) },
    { key: "mission", header: "Mission", render: (m) => (
      <div className="min-w-0">
        <p className="font-semibold text-slate-800">#{m.id} · {MISSION_PURPOSE[m.purpose]?.label}</p>
        <p className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={12} />{targetLabel(m)}</p>
      </div>
    ) },
    { key: "driver", header: "Chauffeur", hideOnMobile: true, render: (m) => m.driverFullName ? (
      <div><p className="text-slate-700">{m.driverFullName}</p><p className="text-xs text-slate-400">{m.vehicleImmatriculation || "Sans véhicule"}</p></div>
    ) : <span className="text-xs italic text-slate-400">À affecter</span> },
    { key: "priority", header: "Priorité", hideOnMobile: true, render: (m) => <Badge tone={PRIORITY[m.priority]?.tone}>{PRIORITY[m.priority]?.label || "Normale"}</Badge> },
    { key: "status", header: "Statut", render: (m) => <StatusBadge map={MISSION_STATUS} value={m.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Missions"
        subtitle="Planifiez, affectez et suivez les collectes confiées aux chauffeurs."
        actions={<Link href="/admin/newMission" className="btn-primary"><Plus size={16} /> Nouvelle mission</Link>}
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white">
            <button className="px-2.5 py-2 text-slate-500 hover:text-slate-800 disabled:opacity-40" disabled={allDates} onClick={() => shiftDay(-1)} aria-label="Jour précédent"><ChevronLeft size={16} /></button>
            <input type="date" value={day} disabled={allDates} onChange={(e) => setDay(e.target.value)} className="border-x border-slate-200 px-3 py-2 text-sm outline-none disabled:text-slate-400" />
            <button className="px-2.5 py-2 text-slate-500 hover:text-slate-800 disabled:opacity-40" disabled={allDates} onClick={() => shiftDay(1)} aria-label="Jour suivant"><ChevronRight size={16} /></button>
          </div>
          <button className={`btn ${day === isoDate() && !allDates ? "bg-brand-50 text-brand-700" : "btn-secondary"}`} onClick={() => { setAllDates(false); setDay(isoDate()); }}>Aujourd'hui</button>
          <button className={`btn ${allDates ? "bg-brand-50 text-brand-700" : "btn-secondary"}`} onClick={() => setAllDates((a) => !a)}><CalendarDays size={15} /> Historique</button>
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="N°, quartier, chauffeur…" className="lg:w-72" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between">
          <FilterPills value={filter} onChange={setFilter} options={[
            { value: "ALL", label: "Toutes", count: list.data.length },
            { value: "ACTIVE", label: "Actives", count: count((m) => ACTIVE.includes(m.status)) },
            { value: "IN_PROGRESS", label: "En cours", count: count((m) => m.status === "IN_PROGRESS") },
            { value: "COMPLETED", label: "Terminées", count: count((m) => m.status === "COMPLETED") },
            { value: "REFUSED", label: "Refusées", count: count((m) => m.status === "REFUSED") },
            { value: "FAILED", label: "Échouées", count: count((m) => m.status === "FAILED") },
          ]} />
          <FilterPills value={purpose} onChange={setPurpose} options={[
            { value: "ALL", label: "Tous types" },
            ...Object.entries(MISSION_PURPOSE).map(([value, m]) => ({ value, label: m.short })),
          ]} />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={list.loading}
          error={list.error}
          onRetry={list.reload}
          onRowClick={setSelected}
          empty={<EmptyState icon={<ClipboardList size={26} />} title="Aucune mission" description={allDates ? "Aucune mission ne correspond aux filtres." : `Aucune mission le ${formatDate(day)}.`} action={<Link href="/admin/newMission" className="btn-primary"><Plus size={16} /> Planifier une mission</Link>} />}
        />
      </Card>

      <MissionDrawer mission={selected} onClose={() => setSelected(null)} onCancel={() => setCancelling(selected)} />
      <ReasonDialog
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        onConfirm={cancel}
        pending={pending}
        title={`Annuler la mission #${cancelling?.id}`}
        message="Le chauffeur sera prévenu. Les signalements et la demande premium liés redeviendront à traiter."
        confirmLabel="Annuler la mission"
        suggestions={["Véhicule indisponible", "Doublon", "Collecte déjà effectuée", "Intempéries"]}
      />
    </div>
  );
}

function targetLabel(m) {
  if (m.purpose === "COLLECTION") return m.bins?.length ? `${m.bins.map((b) => b.code).join(", ")} — ${m.district || ""}` : m.district;
  if (m.purpose === "PREMIUMCOLLECTION") return m.premiumTarget ? `${m.premiumTarget.clientName} — ${m.district || ""}` : m.district;
  return `${m.district || "—"}, ${m.city || ""}`;
}

function MissionDrawer({ mission: m, onClose, onCancel }) {
  if (!m) return null;
  const closed = ["COMPLETED", "FAILED", "CANCELLED"].includes(m.status);
  const points = [
    ...(m.bins || []).map((b) => ({ id: b.id, position: [b.latitude, b.longitude], kind: "bin", color: b.status === "FULL" ? "red" : "green" })),
    ...(m.premiumTarget?.latitude ? [{ id: "client", position: [m.premiumTarget.latitude, m.premiumTarget.longitude], kind: "home", color: "amber" }] : []),
  ];
  const timeline = [
    { label: "Créée", at: m.createdAt, by: m.orderedByFullName },
    { label: "Acceptée par le chauffeur", at: m.acceptedAt },
    { label: "Démarrée", at: m.startedAt },
    { label: m.status === "COMPLETED" ? "Terminée" : "Clôturée", at: m.completedAt },
  ].filter((t) => t.at);

  return (
    <Drawer
      open
      onClose={onClose}
      title={`Mission #${m.id}`}
      subtitle={<div className="flex flex-wrap items-center gap-2"><StatusBadge map={MISSION_STATUS} value={m.status} /><Badge tone={MISSION_PURPOSE[m.purpose]?.tone}>{MISSION_PURPOSE[m.purpose]?.label}</Badge></div>}
      footer={!closed && (
        <>
          <button className="btn-danger-soft" onClick={onCancel}>Annuler la mission</button>
          {m.status !== "IN_PROGRESS" && <Link href={`/admin/newMission?edit=${m.id}`} className="btn-primary">Modifier / réaffecter</Link>}
        </>
      )}
    >
      {m.statusReason && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-semibold">Motif</p>
          <p>{m.statusReason}</p>
        </div>
      )}
      {points.length > 0 && (
        <div className="mb-5 h-48 overflow-hidden rounded-2xl border border-slate-200"><LeafletMap markers={points} /></div>
      )}
      <DetailRow label="Prévue le">{formatDateTime(m.start)}</DetailRow>
      <DetailRow label="Zone">{[m.district, m.city].filter(Boolean).join(", ")}</DetailRow>
      <DetailRow label="Priorité">{PRIORITY[m.priority]?.label || "Normale"}</DetailRow>
      <DetailRow label="Chauffeur">{m.driverFullName ? <>{m.driverFullName}{m.driverPhone && <span className="block text-xs font-normal text-slate-500">{m.driverPhone}</span>}</> : "Non affectée"}</DetailRow>
      <DetailRow label="Véhicule">{m.vehicleImmatriculation ? <span className="flex items-center justify-end gap-1"><Truck size={14} />{m.vehicleImmatriculation}</span> : "—"}</DetailRow>
      {m.bins?.length > 0 && <DetailRow label="Bacs">{m.bins.map((b) => b.code).join(", ")}</DetailRow>}
      {m.premiumTarget && (
        <>
          <DetailRow label="Client">{m.premiumTarget.clientName}<span className="block text-xs font-normal text-slate-500">{m.premiumTarget.clientPhone}</span></DetailRow>
          <DetailRow label="Adresse">{m.premiumTarget.address || "Position GPS"}</DetailRow>
          {m.premiumTarget.accessNotes && <DetailRow label="Accès">{m.premiumTarget.accessNotes}</DetailRow>}
          {m.premiumTarget.callBefore && <DetailRow label="Consigne">Appeler avant le passage</DetailRow>}
        </>
      )}
      {m.description && <DetailRow label="Consignes">{m.description}</DetailRow>}

      <h4 className="mb-2 mt-6 text-sm font-semibold text-slate-800">Chronologie</h4>
      <ol className="relative ml-2 space-y-4 border-l border-slate-200 pl-5">
        {timeline.map((t) => (
          <li key={t.label} className="relative">
            <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-500 ring-2 ring-brand-100" />
            <p className="text-sm font-medium text-slate-800">{t.label}</p>
            <p className="text-xs text-slate-500">{formatDateTime(t.at)}{t.by ? ` · ${t.by}` : ""}</p>
          </li>
        ))}
      </ol>

      {m.status === "COMPLETED" && (
        <div className="mt-6 rounded-2xl bg-brand-50/60 p-4">
          <p className="text-sm font-semibold text-brand-900">Compte rendu du chauffeur</p>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-slate-500">Sacs chargés</p><p className="font-semibold">{m.bagsLoaded ?? "—"}</p></div>
            <div><p className="text-xs text-slate-500">Sacs déchargés</p><p className="font-semibold">{m.bagsUnloaded ?? "—"}</p></div>
          </div>
          {m.observations && <p className="mt-2 text-sm text-slate-700">{m.observations}</p>}
          {m.proofPhoto && <img src={m.proofPhoto} alt="Preuve de collecte" className="mt-3 w-full rounded-xl" />}
        </div>
      )}
    </Drawer>
  );
}
