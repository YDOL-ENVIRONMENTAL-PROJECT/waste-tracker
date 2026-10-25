"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Archive, Building2, Gauge, Pencil, Plus, Truck, UserRound } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { FilterPills, SearchInput } from "@/components/ui/Table";
import EmptyState, { ErrorState } from "@/components/ui/EmptyState";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useAction, useAsync } from "@/hooks/useAsync";
import { vehicles as vehicleService } from "@/services/vehicle";
import { notify } from "@/lib/notify";
import { includesText, timeAgo } from "@/lib/format";
import { VEHICLE_STATUS } from "@/lib/labels";

export default function VehicleListPage() {
  const list = useAsync(() => vehicleService.getAll(), [], { initial: [], pollMs: 60_000 });
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [archiving, setArchiving] = useState(null);
  const [pending, run] = useAction();

  const rows = useMemo(() => list.data
    .filter((v) => status === "ALL" || v.status === status)
    .filter((v) => includesText(`${v.immatriculation} ${v.name} ${v.brand} ${v.modele} ${v.driverFullName}`, query)), [list.data, status, query]);
  const count = (s) => list.data.filter((v) => v.status === s).length;

  const setVehicleStatus = (v, s) => run(async () => {
    const r = await vehicleService.setStatus(v.id, s);
    if (r.success) { notify.success("Statut mis à jour"); list.reload({ silent: true }); } else notify.error(r.error);
  });

  return (
    <div>
      <PageHeader title="Véhicules" subtitle="Flotte de collecte, chauffeurs affectés et disponibilité." actions={<Link href="/admin/addVehicle" className="btn-primary"><Plus size={16} /> Ajouter un véhicule</Link>} />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterPills value={status} onChange={setStatus} options={[
          { value: "ALL", label: "Tous", count: list.data.length },
          ...["AVAILABLE", "UNAVAILABLE", "SLEEPING", "BROKEN_DOWN", "OUT_OF_SERVICE"].map((s) => ({ value: s, label: VEHICLE_STATUS[s].label, count: count(s) })),
        ]} />
        <SearchInput value={query} onChange={setQuery} placeholder="Immatriculation, chauffeur…" className="lg:w-64" />
      </div>
      {list.loading ? <CardsSkeleton /> : list.error ? <ErrorState message={list.error} onRetry={list.reload} /> : rows.length === 0 ? (
        <Card><EmptyState icon={<Truck size={26} />} title="Aucun véhicule" description="Ajoutez vos camions de collecte et affectez-leur un chauffeur." action={<Link href="/admin/addVehicle" className="btn-primary"><Plus size={16} /> Ajouter un véhicule</Link>} /></Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((v) => (
            <Card key={v.id} className="overflow-hidden">
              <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-200">
                {v.photo ? <img src={v.photo} alt="" className="h-full w-full object-cover" /> : <Truck size={48} className="absolute inset-0 m-auto text-slate-300" />}
                <div className="absolute left-3 top-3"><StatusBadge map={VEHICLE_STATUS} value={v.status} /></div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-lg font-bold text-slate-900">{v.immatriculation}</p>
                    <p className="text-sm text-slate-500">{[v.name, v.brand, v.modele].filter(Boolean).join(" · ") || "—"}</p>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/admin/addVehicle?id=${v.id}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Modifier"><Pencil size={16} /></Link>
                    <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Archiver" onClick={() => setArchiving(v)}><Archive size={16} /></button>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><UserRound size={14} className="text-slate-400" />{v.driverFullName || <span className="italic text-slate-400">Aucun chauffeur</span>}</p>
                  <p className="flex items-center gap-2"><Building2 size={14} className="text-slate-400" />{v.depotName || <span className="italic text-slate-400">Sans caserne</span>}</p>
                  <p className="flex items-center gap-2"><Gauge size={14} className="text-slate-400" />{v.maxCapacity ? `${v.maxCapacity} t` : "Capacité —"} · position {v.lastPositionAt ? timeAgo(v.lastPositionAt) : "inconnue"}</p>
                </div>
                {v.status !== "UNAVAILABLE" && (
                  <select className="field mt-4 py-2 text-xs" value={v.status} disabled={pending} onChange={(e) => setVehicleStatus(v, e.target.value)}>
                    {["AVAILABLE", "SLEEPING", "BROKEN_DOWN", "OUT_OF_SERVICE"].map((s) => <option key={s} value={s}>{VEHICLE_STATUS[s].label}</option>)}
                  </select>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!archiving}
        onClose={() => setArchiving(null)}
        danger
        pending={pending}
        title="Archiver ce véhicule ?"
        message={`${archiving?.immatriculation} sera retiré de la flotte et son chauffeur libéré.`}
        confirmLabel="Archiver"
        onConfirm={() => run(async () => {
          const r = await vehicleService.archive(archiving.id);
          if (r.success) { notify.success("Véhicule archivé"); setArchiving(null); list.reload({ silent: true }); } else notify.error(r.error);
        })}
      />
    </div>
  );
}
