"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, FileUp, Gauge, Pencil, Plus, Smartphone, Truck, UserRound } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { FilterPills, SearchInput } from "@/components/ui/Table";
import EmptyState, { ErrorState } from "@/components/ui/EmptyState";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import CsvImportModal from "@/components/shared/CsvImportModal";
import { ApprovalActions, DraftBadge } from "@/components/approval/Approval";
import { useAction, useAsync } from "@/hooks/useAsync";
import { useSession } from "@/components/providers/SessionProvider";
import { vehicles as vehicleService } from "@/services/vehicle";
import { depots as depotService } from "@/services/depot";
import { notify } from "@/lib/notify";
import { includesText, timeAgo } from "@/lib/format";
import { VEHICLE_STATUS } from "@/lib/labels";

const CSV_COLUMNS = [
  { key: "immatriculation", label: "Immatriculation", required: true },
  { key: "deviceId", label: "Identifiant du téléphone de service" },
  { key: "name", label: "Nom d'usage" },
  { key: "brand", label: "Marque" },
  { key: "modele", label: "Modèle" },
  { key: "maxCapacity", label: "Capacité (tonnes)" },
  { key: "depot", label: "Nom de la caserne de rattachement", required: true },
];

export default function VehicleListPage() {
  const { user } = useSession();
  const list = useAsync(() => vehicleService.getAll(), [], { initial: [], pollMs: 60_000, sync: ["admin:vehicles"] });
  const depots = useAsync(() => depotService.getAll(), [], { initial: [], sync: ["admin:depots"] });
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importDraft, setImportDraft] = useState(false);
  const [pending, run] = useAction();

  const rows = useMemo(() => list.data
    .filter((v) => status === "ALL" || (status === "DRAFT" ? v.draft : !v.draft && v.status === status))
    .filter((v) => includesText(`${v.immatriculation} ${v.name} ${v.brand} ${v.modele} ${v.driverFullName} ${v.deviceId}`, query)), [list.data, status, query]);
  const count = (s) => list.data.filter((v) => !v.draft && v.status === s).length;

  const setVehicleStatus = (v, s) => run(async () => {
    const r = await vehicleService.setStatus(v.id, s);
    if (r.success) { notify.success("Statut mis à jour"); list.reload({ silent: true }); } else notify.error(r.error);
  });

  const depotId = (name) => depots.data.find((d) => !d.draft && d.name.toLowerCase() === (name || "").trim().toLowerCase())?.id || null;

  return (
    <div>
      <PageHeader title="Véhicules" subtitle="Chaque véhicule embarque un téléphone de service : le chauffeur qui s'y connecte est relié automatiquement au véhicule."
        actions={<>
          <button className="btn-secondary" onClick={() => setImportOpen(true)}><FileUp size={16} /> Importer (CSV)</button>
          <Link href="/admin/addVehicle" className="btn-primary"><Plus size={16} /> Ajouter un véhicule</Link>
        </>} />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterPills value={status} onChange={setStatus} options={[
          { value: "ALL", label: "Tous", count: list.data.length },
          ...["AVAILABLE", "UNAVAILABLE", "BROKEN_DOWN", "OUT_OF_SERVICE"].map((s) => ({ value: s, label: VEHICLE_STATUS[s].label, count: count(s) })),
          { value: "DRAFT", label: "Brouillons", count: list.data.filter((v) => v.draft).length },
        ]} />
        <SearchInput value={query} onChange={setQuery} placeholder="Immatriculation, téléphone, chauffeur…" className="lg:w-72" />
      </div>
      {list.loading ? <CardsSkeleton /> : list.error ? <ErrorState message={list.error} onRetry={list.reload} /> : rows.length === 0 ? (
        <Card><EmptyState icon={<Truck size={26} />} title="Aucun véhicule" description="Ajoutez vos camions et l'identifiant de leur téléphone de service." action={<Link href="/admin/addVehicle" className="btn-primary"><Plus size={16} /> Ajouter un véhicule</Link>} /></Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((v) => (
            <Card key={v.id} className={`overflow-hidden ${v.draft ? "ring-2 ring-violet-200" : ""}`}>
              <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-200">
                {v.photo ? <img src={v.photo} alt="" className="h-full w-full object-cover" /> : <Truck size={48} className="absolute inset-0 m-auto text-slate-300" />}
                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">{v.draft ? <DraftBadge item={v} /> : <StatusBadge map={VEHICLE_STATUS} value={v.status} />}</div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-lg font-bold text-slate-900">{v.immatriculation}</p>
                    <p className="text-sm text-slate-500">{[v.name, v.brand, v.modele].filter(Boolean).join(" · ") || "—"}</p>
                  </div>
                  <Link href={`/admin/addVehicle?id=${v.id}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Modifier"><Pencil size={16} /></Link>
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><Smartphone size={14} className="text-slate-400" />{v.deviceId || <span className="italic text-amber-700">Téléphone non renseigné</span>}</p>
                  <p className="flex items-center gap-2"><UserRound size={14} className="text-slate-400" />{v.driverFullName ? <>{v.driverFullName} <span className="text-xs text-slate-400">(connecté)</span></> : <span className="italic text-slate-400">Aucun chauffeur connecté</span>}</p>
                  <p className="flex items-center gap-2"><Building2 size={14} className="text-slate-400" />{v.depotName || <span className="italic text-slate-400">Sans caserne</span>}</p>
                  <p className="flex items-center gap-2"><Gauge size={14} className="text-slate-400" />{v.maxCapacity ? `${v.maxCapacity} t` : "Capacité —"} · position {v.lastPositionAt ? timeAgo(v.lastPositionAt) : "inconnue"}</p>
                </div>
                {!v.draft && v.status !== "UNAVAILABLE" && (
                  <select className="field mt-4 py-2 text-xs" value={v.status} disabled={pending} onChange={(e) => setVehicleStatus(v, e.target.value)}>
                    {["AVAILABLE", "SLEEPING", "BROKEN_DOWN", "OUT_OF_SERVICE"].map((s) => <option key={s} value={s}>{VEHICLE_STATUS[s].label}</option>)}
                  </select>
                )}
                <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
                  <ApprovalActions item={v} service={vehicleService} label={`le véhicule ${v.immatriculation}`} onDone={() => list.reload({ silent: true })} compact />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CsvImportModal open={importOpen} onClose={() => setImportOpen(false)} title="Importer des véhicules"
        description={user?.role === "SUPER_ADMIN" ? "Les véhicules importés sont créés directement, ou en brouillons si vous le choisissez." : "Les véhicules importés seront des brouillons à faire valider par un super administrateur."}
        columns={CSV_COLUMNS} templateName="modele_vehicules.csv" example={["LT-123-AB", "TEL-001", "Benne 01", "Renault", "D-Wide", "12", depots.data[0]?.name || "Caserne de Mvan"]}
        extra={user?.role === "SUPER_ADMIN" && (
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" className="accent-brand-600" checked={importDraft} onChange={(e) => setImportDraft(e.target.checked)} /> Importer en brouillons</label>
        )}
        toRow={(r) => ({ immatriculation: r.immatriculation, deviceId: r.deviceid || null, name: r.name || null, brand: r.brand || null,
          modele: r.modele || null, maxCapacity: r.maxcapacity ? Number(r.maxcapacity.replace(",", ".")) : null, depotId: depotId(r.depot) })}
        onImport={(rows) => vehicleService.importMany(rows, importDraft)} onDone={() => list.reload({ silent: true })} />
    </div>
  );
}
