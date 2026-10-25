"use client";

import { withoutDrafts } from "@/services/api";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Crown, RefreshCw, Recycle, Siren, Truck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/Table";
import { LeafletMap } from "@/components/map";
import { useAsync } from "@/hooks/useAsync";
import { garbagebins } from "@/services/garbagebin";
import { vehicles as vehicleService } from "@/services/vehicle";
import { depots as depotService } from "@/services/depot";
import { reports as reportService } from "@/services/report";
import { subscriptions as subscriptionService } from "@/services/subscription";
import { BIN_STATUS, REPORT_TYPE, VEHICLE_STATUS } from "@/lib/labels";
import { includesText, timeAgo } from "@/lib/format";

const BIN_COLOR = { EMPTY: "green", FULL: "red", OUT_OF_SERVICE: "slate" };
const VEHICLE_COLOR = { AVAILABLE: "green", UNAVAILABLE: "blue", SLEEPING: "violet", BROKEN_DOWN: "red", OUT_OF_SERVICE: "slate" };
const REFRESH_MS = 30_000;

export default function AdminMapPage() {
  const bins = useAsync(() => withoutDrafts(garbagebins.getAll()), [], { initial: [], pollMs: REFRESH_MS });
  const fleet = useAsync(() => withoutDrafts(vehicleService.getAll()), [], { initial: [], pollMs: REFRESH_MS });
  const depots = useAsync(() => withoutDrafts(depotService.getAll()), [], { initial: [] });
  const reports = useAsync(() => reportService.getAll(), [], { initial: [], pollMs: REFRESH_MS });
  const premium = useAsync(() => subscriptionService.getAll("ACTIVE"), [], { initial: [] });

  const [layers, setLayers] = useState({ bins: true, fullOnly: false, vehicles: true, depots: true, reports: true, premium: false });
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(null);

  const openReports = reports.data.filter((r) => r.status === "NEW" || r.status === "IN_PROGRESS");
  const toggle = (k) => setLayers((l) => ({ ...l, [k]: !l[k] }));

  const markers = useMemo(() => {
    const list = [];
    if (layers.bins) {
      bins.data
        .filter((b) => !layers.fullOnly || b.status === "FULL")
        .filter((b) => includesText(`${b.code} ${b.quarter} ${b.town}`, query))
        .forEach((b) => list.push({
          id: `bin-${b.id}`, position: [b.latitude, b.longitude], kind: "bin", color: BIN_COLOR[b.status] || "slate",
          pulse: b.status === "FULL",
          popup: (
            <div className="min-w-[180px] space-y-1.5 text-sm">
              <p className="font-semibold text-slate-900">Bac {b.code}</p>
              <p className="text-xs text-slate-500">{b.quarter}, {b.town}</p>
              <StatusBadge map={BIN_STATUS} value={b.status} />
              {b.status === "FULL" && (
                <Link href={`/admin/newMission?bin=${b.id}`} className="mt-1 block font-semibold text-brand-700">→ Créer une mission</Link>
              )}
            </div>
          ),
        }));
    }
    if (layers.vehicles) {
      fleet.data
        .filter((v) => includesText(`${v.immatriculation} ${v.driverFullName} ${v.name}`, query))
        .forEach((v) => list.push({
          id: `veh-${v.id}`, position: [v.latitude, v.longitude], kind: "truck", color: VEHICLE_COLOR[v.status] || "slate", size: 38,
          popup: (
            <div className="min-w-[180px] space-y-1.5 text-sm">
              <p className="font-semibold text-slate-900">{v.immatriculation}</p>
              <p className="text-xs text-slate-500">{v.driverFullName || "Sans chauffeur"}{v.speed ? ` · ${Math.round(v.speed)} km/h` : ""}</p>
              <StatusBadge map={VEHICLE_STATUS} value={v.status} />
              <p className="text-[11px] text-slate-400">Position : {v.lastPositionAt ? timeAgo(v.lastPositionAt) : "inconnue"}</p>
            </div>
          ),
        }));
    }
    if (layers.depots) {
      depots.data.forEach((d) => list.push({
        id: `dep-${d.id}`, position: [d.latitude, d.longitude], kind: "depot", color: "dark",
        popup: <div className="text-sm"><p className="font-semibold">{d.name}</p><p className="text-xs text-slate-500">{d.vehicleCount} véhicule(s)</p></div>,
      }));
    }
    if (layers.reports) {
      openReports.filter((r) => r.latitude != null && !r.binId).forEach((r) => list.push({
        id: `rep-${r.id}`, position: [r.latitude, r.longitude], kind: "alert", color: "amber", pulse: r.status === "NEW",
        popup: (
          <div className="min-w-[180px] text-sm">
            <p className="font-semibold">{REPORT_TYPE[r.type]?.label}</p>
            <p className="text-xs text-slate-500">{r.authorName} · {timeAgo(r.createdAt)}</p>
            {r.photo && <img src={r.photo} alt="" className="mt-2 h-24 w-full rounded-lg object-cover" />}
            <Link href="/admin/reports" className="mt-1 block font-semibold text-brand-700">→ Traiter</Link>
          </div>
        ),
      }));
    }
    if (layers.premium) {
      premium.data.forEach((s) => list.push({
        id: `prm-${s.id}`, position: [s.latitude, s.longitude], kind: "home", color: "amber",
        popup: <div className="text-sm"><p className="font-semibold">{s.clientName}</p><p className="text-xs text-slate-500">{s.frequencyPerWeek} collecte(s)/sem. · reste {s.quotaRemaining}</p></div>,
      }));
    }
    return list;
  }, [layers, bins.data, fleet.data, depots.data, openReports, premium.data, query]);

  const fullBins = bins.data.filter((b) => b.status === "FULL");
  const reload = () => { bins.reload({ silent: true }); fleet.reload({ silent: true }); reports.reload({ silent: true }); };

  return (
    <div>
      <PageHeader
        title="Carte en direct"
        subtitle="Position des véhicules et état des bacs, mis à jour toutes les 30 secondes."
        actions={<button onClick={reload} className="btn-secondary"><RefreshCw size={15} /> Actualiser</button>}
      />
      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Card className="p-4">
            <SearchInput value={query} onChange={setQuery} placeholder="Bac, quartier, immatriculation…" />
            <div className="mt-4 space-y-1">
              <LayerToggle on={layers.bins} onClick={() => toggle("bins")} icon={<Recycle size={15} />} label="Bacs" count={bins.data.length} color="bg-emerald-500" />
              {layers.bins && (
                <label className="ml-9 flex cursor-pointer items-center gap-2 py-1 text-xs text-slate-500">
                  <input type="checkbox" checked={layers.fullOnly} onChange={() => toggle("fullOnly")} className="accent-brand-600" /> Seulement les bacs pleins
                </label>
              )}
              <LayerToggle on={layers.vehicles} onClick={() => toggle("vehicles")} icon={<Truck size={15} />} label="Véhicules" count={fleet.data.length} color="bg-blue-500" />
              <LayerToggle on={layers.reports} onClick={() => toggle("reports")} icon={<Siren size={15} />} label="Dépôts sauvages signalés" count={openReports.filter((r) => !r.binId).length} color="bg-amber-500" />
              <LayerToggle on={layers.depots} onClick={() => toggle("depots")} icon={<Building2 size={15} />} label="Casernes" count={depots.data.length} color="bg-slate-800" />
              <LayerToggle on={layers.premium} onClick={() => toggle("premium")} icon={<Crown size={15} />} label="Clients premium" count={premium.data.length} color="bg-amber-400" />
            </div>
          </Card>
          <Card className="p-4">
            <p className="mb-3 text-sm font-semibold text-slate-800">Bacs à vider en priorité</p>
            {fullBins.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun bac plein 🎉</p>
            ) : (
              <ul className="max-h-72 space-y-1 overflow-y-auto">
                {fullBins.map((b) => (
                  <li key={b.id}>
                    <button onClick={() => setFocus([b.latitude, b.longitude])} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      <span className="flex-1 truncate text-sm text-slate-700">{b.code} — {b.quarter}</span>
                      <span className="text-[11px] text-slate-400">{b.lastFullAt ? timeAgo(b.lastFullAt) : ""}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <Card className="h-[70vh] min-h-[480px] overflow-hidden">
          <LeafletMap markers={markers} flyTo={focus} fit={!focus} />
        </Card>
      </div>
    </div>
  );
}

function LayerToggle({ on, onClick, icon, label, count, color }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition ${on ? "text-slate-800" : "text-slate-400"} hover:bg-slate-50`}>
      <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-white ${on ? color : "bg-slate-200"}`}>{icon}</span>
      <span className="flex-1">{label}</span>
      <span className="text-xs text-slate-400">{count}</span>
      <span className={`relative h-5 w-9 rounded-full transition ${on ? "bg-brand-600" : "bg-slate-200"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
