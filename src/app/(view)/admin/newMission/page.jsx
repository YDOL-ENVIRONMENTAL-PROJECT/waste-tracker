"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarClock, Check, Crown, Map as MapIcon, Navigation, Recycle, Truck, UserRound } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { ChoiceCards, Input, Select, Textarea } from "@/components/ui/Field";
import { SearchInput } from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import Avatar from "@/components/ui/Avatar";
import { LeafletMap } from "@/components/map";
import { useAsync } from "@/hooks/useAsync";
import { missions as missionService } from "@/services/mission";
import { garbagebins } from "@/services/garbagebin";
import { drivers as driverService } from "@/services/driver";
import { vehicles as vehicleService } from "@/services/vehicle";
import { collectionRequests } from "@/services/collectionRequest";
import { withoutDrafts } from "@/services/api";
import { notify } from "@/lib/notify";
import { formatDate, includesText, isoLocalDateTime } from "@/lib/format";
import { BIN_STATUS, PRIORITY, SLOTS, TOWNS, VEHICLE_STATUS } from "@/lib/labels";

const SLOT_HOUR = { MORNING: 8, AFTERNOON: 13, EVENING: 17 };

function distanceKm(a, b) {
  if (!a || !b || a[0] == null || b[0] == null) return null;
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function defaultStart() {
  const d = new Date(Date.now() + 30 * 60 * 1000);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return isoLocalDateTime(d).slice(0, 16);
}

function NewMissionForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");

  const bins = useAsync(() => withoutDrafts(garbagebins.getAll()), [], { initial: [] });
  const drivers = useAsync(() => driverService.getAll(), [], { initial: [] });
  const fleet = useAsync(() => withoutDrafts(vehicleService.getAll()), [], { initial: [] });
  const requests = useAsync(() => collectionRequests.getAll("PENDING"), [], { initial: [] });

  const [form, setForm] = useState({
    purpose: params.get("request") ? "PREMIUMCOLLECTION" : "COLLECTION",
    binIds: params.get("bin") ? [params.get("bin")] : [],
    collectionRequestId: params.get("request") || "",
    reportId: params.get("report") || null,
    city: "Yaoundé",
    district: "",
    start: defaultStart(),
    priority: params.get("report") ? "HIGH" : "NORMAL",
    description: "",
    driverId: "",
    vehicleId: "",
  });
  const [editing, setEditing] = useState(null);
  const [binQuery, setBinQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Mode édition : préremplissage depuis la mission existante
  useEffect(() => {
    if (!editId) return;
    missionService.getById(editId).then((r) => {
      if (!r.success) return notify.error(r.error);
      const m = r.data;
      setEditing(m);
      set({
        purpose: m.purpose, binIds: (m.bins || []).map((b) => b.id), city: m.city || "", district: m.district || "",
        start: (m.start || "").slice(0, 16), priority: m.priority || "NORMAL", description: m.description || "",
        driverId: m.driverId || "", vehicleId: m.vehicleId || "",
      });
    });
  }, [editId]);

  const selectedRequest = requests.data.find((r) => r.id === form.collectionRequestId);
  useEffect(() => {
    if (selectedRequest && !editId) {
      const d = new Date(selectedRequest.requestedDate);
      d.setHours(SLOT_HOUR[selectedRequest.slot] || 8, 0, 0, 0);
      set({ start: isoLocalDateTime(d).slice(0, 16) });
    }
  }, [selectedRequest?.id]);

  const selectedBins = bins.data.filter((b) => form.binIds.includes(b.id));
  const target = useMemo(() => {
    if (form.purpose === "COLLECTION" && selectedBins[0]) return [selectedBins[0].latitude, selectedBins[0].longitude];
    if (form.purpose === "PREMIUMCOLLECTION" && selectedRequest) return [selectedRequest.latitude, selectedRequest.longitude];
    return null;
  }, [form.purpose, selectedBins, selectedRequest]);

  // Chauffeurs enrichis de leur véhicule et de la distance à la cible
  const driverRows = useMemo(() => drivers.data.filter((d) => d.status !== "PENDING").map((d) => {
    const v = fleet.data.find((x) => x.id === d.vehicleId);
    const dist = v ? distanceKm(target, [v.latitude, v.longitude]) : null;
    const usable = !v || !["BROKEN_DOWN", "OUT_OF_SERVICE"].includes(v.status);
    return { ...d, vehicle: v, distance: dist, usable };
  }).sort((a, b) => (b.usable - a.usable) || ((a.distance ?? 1e9) - (b.distance ?? 1e9))), [drivers.data, fleet.data, target]);

  const nearest = target ? driverRows.find((d) => d.usable && d.vehicle?.status === "AVAILABLE" && d.distance != null) : null;

  const sortedBins = useMemo(() => [...bins.data]
    .filter((b) => b.status !== "OUT_OF_SERVICE")
    .filter((b) => includesText(`${b.code} ${b.quarter} ${b.town}`, binQuery))
    .sort((a, b) => (form.binIds.includes(b.id) - form.binIds.includes(a.id)) || ((b.status === "FULL") - (a.status === "FULL"))),
  [bins.data, binQuery, form.binIds]);

  const toggleBin = (id) => set({ binIds: form.binIds.includes(id) ? form.binIds.filter((x) => x !== id) : [...form.binIds, id] });

  const submit = async (e) => {
    e.preventDefault();
    if (form.purpose === "COLLECTION" && form.binIds.length === 0) return notify.warning("Sélectionnez au moins un bac");
    if (form.purpose === "TOUR" && (!form.city || !form.district)) return notify.warning("Indiquez la ville et le quartier de la tournée");
    if (form.purpose === "PREMIUMCOLLECTION" && !form.collectionRequestId && !editing) return notify.warning("Sélectionnez la demande premium à planifier");
    setSubmitting(true);
    const payload = {
      purpose: form.purpose,
      start: `${form.start}:00`,
      binIds: form.purpose === "COLLECTION" ? form.binIds : [],
      collectionRequestId: form.purpose === "PREMIUMCOLLECTION" && !editing ? form.collectionRequestId : null,
      reportId: form.reportId,
      city: form.purpose === "TOUR" ? form.city : null,
      district: form.purpose === "TOUR" ? form.district : null,
      priority: form.priority,
      description: form.description || null,
      driverId: form.driverId || null,
      vehicleId: form.vehicleId || null,
    };
    const r = editing ? await missionService.update(editing.id, payload) : await missionService.create(payload);
    setSubmitting(false);
    if (r.success) {
      notify.success(editing ? "Mission mise à jour" : r.data.driverFullName ? `Mission #${r.data.id} envoyée à ${r.data.driverFullName}` : `Mission #${r.data.id} planifiée`);
      router.push("/admin/missionList");
    } else notify.error(r.error);
  };

  const mapMarkers = [
    ...selectedBins.map((b) => ({ id: b.id, position: [b.latitude, b.longitude], kind: "bin", color: b.status === "FULL" ? "red" : "green", pulse: b.status === "FULL" })),
    ...(selectedRequest ? [{ id: "req", position: [selectedRequest.latitude, selectedRequest.longitude], kind: "home", color: "amber" }] : []),
    ...driverRows.filter((d) => d.vehicle?.latitude != null).map((d) => ({ id: `v-${d.id}`, position: [d.vehicle.latitude, d.vehicle.longitude], kind: "truck", color: d.id === form.driverId ? "blue" : "slate", size: 30 })),
  ];

  return (
    <form onSubmit={submit}>
      <PageHeader
        title={editing ? `Modifier la mission #${editing.id}` : "Nouvelle mission"}
        subtitle={editing ? "Changez l'horaire, les consignes ou réaffectez la mission." : "Choisissez le type de mission, la cible et le chauffeur."}
        actions={<Link href="/admin/missionList" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {!editing && (
            <Card>
              <CardHeader title="1. Type de mission" />
              <div className="px-5 pb-5">
                <ChoiceCards value={form.purpose} onChange={(purpose) => set({ purpose })} options={[
                  { value: "COLLECTION", label: "Collecte de bac", description: "Vider un ou plusieurs bacs pleins", icon: <Recycle size={16} /> },
                  { value: "TOUR", label: "Tournée de quartier", description: "Passage de collecte dans un quartier", icon: <MapIcon size={16} /> },
                  { value: "PREMIUMCOLLECTION", label: "Collecte premium", description: "Demande d'un client abonné", icon: <Crown size={16} /> },
                ]} />
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title={`${editing ? "1" : "2"}. Cible`} subtitle={form.reportId ? "Mission créée à partir d'un signalement" : null} />
            <div className="px-5 pb-5">
              {form.purpose === "COLLECTION" && (
                <div>
                  <SearchInput value={binQuery} onChange={setBinQuery} placeholder="Code, quartier…" />
                  <div className="mt-3 max-h-80 space-y-1.5 overflow-y-auto pr-1">
                    {bins.loading ? <Spinner /> : sortedBins.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">Aucun bac trouvé</p> : sortedBins.map((b) => {
                      const on = form.binIds.includes(b.id);
                      return (
                        <button type="button" key={b.id} onClick={() => toggleBin(b.id)} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${on ? "border-brand-500 bg-brand-50/60" : "border-slate-200 hover:border-slate-300"}`}>
                          <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"}`}>{on && <Check size={13} />}</span>
                          <span className="flex-1"><span className="text-sm font-semibold text-slate-800">{b.code}</span><span className="text-sm text-slate-500"> — {b.quarter}, {b.town}</span></span>
                          <StatusBadge map={BIN_STATUS} value={b.status} />
                        </button>
                      );
                    })}
                  </div>
                  {selectedBins.length > 0 && <p className="mt-3 text-xs text-slate-500">{selectedBins.length} bac(s) sélectionné(s)</p>}
                </div>
              )}

              {form.purpose === "TOUR" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="Ville" required value={form.city} onChange={(e) => set({ city: e.target.value, district: "" })} options={Object.keys(TOWNS).map((t) => ({ value: t, label: t }))} />
                  <div>
                    <Input label="Quartier" required list="quarters" value={form.district} onChange={(e) => set({ district: e.target.value })} placeholder="Ex. Bastos" />
                    <datalist id="quarters">{(TOWNS[form.city] || []).map((q) => <option key={q} value={q} />)}</datalist>
                  </div>
                  <p className="text-xs text-slate-500 sm:col-span-2">Les clients inscrits dans ce quartier seront prévenus de la tournée.</p>
                </div>
              )}

              {form.purpose === "PREMIUMCOLLECTION" && (
                editing ? (
                  <p className="text-sm text-slate-600">Demande de {editing.premiumTarget?.clientName} — {editing.premiumTarget?.address}</p>
                ) : requests.loading ? <Spinner /> : requests.data.length === 0 ? (
                  <EmptyState compact icon={<Crown size={24} />} title="Aucune demande premium en attente" />
                ) : (
                  <div className="space-y-2">
                    {requests.data.map((r) => {
                      const on = form.collectionRequestId === r.id;
                      return (
                        <button type="button" key={r.id} onClick={() => set({ collectionRequestId: r.id })} className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${on ? "border-brand-500 bg-brand-50/60" : "border-slate-200 hover:border-slate-300"}`}>
                          <Avatar person={{ name: r.clientName }} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800">{r.clientName}</p>
                            <p className="text-xs text-slate-500">{formatDate(r.requestedDate)} · {SLOTS[r.slot]?.label || "Créneau libre"}</p>
                            <p className="truncate text-xs text-slate-500">{r.address || "Position GPS"}{r.callBefore ? " · 📞 appeler avant" : ""}</p>
                          </div>
                          {on && <Check size={18} className="text-brand-600" />}
                        </button>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title={`${editing ? "2" : "3"}. Planification`} icon={<CalendarClock size={18} />} />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              <Input label="Date et heure" type="datetime-local" required value={form.start} onChange={(e) => set({ start: e.target.value })} />
              <Select label="Priorité" value={form.priority} onChange={(e) => set({ priority: e.target.value })} options={Object.entries(PRIORITY).map(([value, p]) => ({ value, label: p.label }))} />
              <Textarea className="sm:col-span-2" label="Consignes pour le chauffeur" value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="Ex. Accès par la ruelle derrière l'école, bac très lourd…" />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title={`${editing ? "3" : "4"}. Chauffeur`} subtitle="Facultatif : une mission sans chauffeur reste « planifiée »." icon={<UserRound size={18} />} />
            <div className="px-5 pb-5">
              {nearest && (
                <button type="button" onClick={() => set({ driverId: nearest.id, vehicleId: "" })} className="mb-3 flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 p-3.5 text-left text-white shadow-sm">
                  <Navigation size={18} />
                  <span className="flex-1 text-sm"><span className="block font-semibold">Suggestion : {nearest.firstName} {nearest.lastName}</span><span className="text-brand-100">Véhicule disponible à {nearest.distance.toFixed(1)} km</span></span>
                </button>
              )}
              <div className="max-h-[360px] space-y-1.5 overflow-y-auto pr-1">
                <button type="button" onClick={() => set({ driverId: "", vehicleId: "" })} className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm ${!form.driverId ? "border-brand-500 bg-brand-50/60 font-medium" : "border-slate-200 text-slate-500"}`}>Affecter plus tard</button>
                {driverRows.map((d) => {
                  const on = form.driverId === d.id;
                  return (
                    <button type="button" key={d.id} disabled={!d.usable} onClick={() => set({ driverId: d.id, vehicleId: "" })} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-50 ${on ? "border-brand-500 bg-brand-50/60" : "border-slate-200 hover:border-slate-300"}`}>
                      <Avatar person={d} size="sm" online={d.status === "ONLINE"} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{d.firstName} {d.lastName}</p>
                        <p className="truncate text-xs text-slate-500">
                          {d.vehicle ? <><Truck size={11} className="mr-1 inline" />{d.vehicle.immatriculation} · {VEHICLE_STATUS[d.vehicle.status]?.label}</> : "Aucun véhicule"}
                          {d.distance != null && ` · ${d.distance.toFixed(1)} km`}
                        </p>
                      </div>
                      {on && <Check size={16} className="text-brand-600" />}
                    </button>
                  );
                })}
              </div>
              {form.driverId && (
                <Select className="mt-4" label="Véhicule" value={form.vehicleId} onChange={(e) => set({ vehicleId: e.target.value })} placeholder="Véhicule habituel du chauffeur"
                  options={fleet.data.filter((v) => !["BROKEN_DOWN", "OUT_OF_SERVICE"].includes(v.status)).map((v) => ({ value: v.id, label: `${v.immatriculation} — ${VEHICLE_STATUS[v.status]?.label}` }))} />
              )}
            </div>
          </Card>

          {mapMarkers.length > 0 && (
            <Card className="h-64 overflow-hidden"><LeafletMap markers={mapMarkers} /></Card>
          )}

          <div className="sticky bottom-4 flex gap-2">
            <Link href="/admin/missionList" className="btn-secondary flex-1">Annuler</Link>
            <button type="submit" className="btn-primary flex-[2]" disabled={submitting}>
              {submitting && <Spinner />} {editing ? "Enregistrer" : form.driverId ? "Envoyer au chauffeur" : "Planifier la mission"}
            </button>
          </div>
          {form.priority === "URGENT" && <Badge tone="red">Le chauffeur verra cette mission en tête de liste</Badge>}
        </div>
      </div>
    </form>
  );
}

export default function NewMissionPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <NewMissionForm />
    </Suspense>
  );
}
