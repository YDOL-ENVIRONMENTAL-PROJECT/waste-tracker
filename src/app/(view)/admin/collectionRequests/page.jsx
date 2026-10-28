"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, ClipboardPlus, MapPin, Phone, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { FilterPills } from "@/components/ui/Table";
import EmptyState, { ErrorState } from "@/components/ui/EmptyState";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import { ReasonDialog } from "@/components/ui/Modal";
import { useAction, useAsync } from "@/hooks/useAsync";
import { collectionRequests } from "@/services/collectionRequest";
import { notify } from "@/lib/notify";
import { formatDate, timeAgo } from "@/lib/format";
import { MISSION_STATUS, REQUEST_STATUS, SLOTS } from "@/lib/labels";

export default function CollectionRequestsPage() {
  const list = useAsync(() => collectionRequests.getAll(), [], { initial: [], pollMs: 60_000, sync: ["admin:collectionRequests"] });
  const [filter, setFilter] = useState("PENDING");
  const [rejecting, setRejecting] = useState(null);
  const [pending, run] = useAction();
  const rows = list.data.filter((r) => filter === "ALL" || r.status === filter);
  const count = (s) => list.data.filter((r) => r.status === s).length;

  return (
    <div>
      <PageHeader title="Demandes de collecte premium" subtitle="Transformez chaque demande d'un abonné en mission « Collecte premium »." />
      <div className="mb-5">
        <FilterPills value={filter} onChange={setFilter} options={[
          { value: "PENDING", label: "À planifier", count: count("PENDING") },
          { value: "PLANNED", label: "Planifiées", count: count("PLANNED") },
          { value: "DONE", label: "Réalisées", count: count("DONE") },
          { value: "ALL", label: "Toutes", count: list.data.length },
        ]} />
      </div>
      {list.loading ? <CardsSkeleton count={3} className="h-48" /> : list.error ? <ErrorState message={list.error} onRetry={list.reload} /> : rows.length === 0 ? (
        <Card><EmptyState icon={<CalendarClock size={26} />} title="Aucune demande" description="Les demandes des clients premium apparaîtront ici." /></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => (
            <Card key={r.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
                    <span className="text-[10px] font-semibold uppercase">{new Date(r.requestedDate).toLocaleDateString("fr-FR", { month: "short" })}</span>
                    <span className="font-display text-lg font-bold leading-none">{new Date(r.requestedDate).getDate()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{r.clientName}</p>
                    <p className="text-xs text-slate-500">{SLOTS[r.slot]?.label || "Créneau libre"}</p>
                  </div>
                </div>
                <StatusBadge map={REQUEST_STATUS} value={r.status} />
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-slate-600">
                <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-400" />{r.address || "Position GPS enregistrée"}</p>
                <p className="flex items-center gap-2"><Phone size={14} className="text-slate-400" />{r.clientPhone}{r.callBefore && <span className="text-xs text-amber-700">· appeler avant</span>}</p>
                {r.accessNotes && <p className="text-xs text-slate-500">Accès : {r.accessNotes}</p>}
                {r.comment && <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs">« {r.comment} »</p>}
                {r.missionId && <p className="text-xs">Mission #{r.missionId} · {MISSION_STATUS[r.missionStatus]?.label} {r.driverName ? `· ${r.driverName}` : ""}</p>}
                {r.rejectionReason && <p className="text-xs text-red-600">Motif : {r.rejectionReason}</p>}
              </div>
              <p className="mt-3 text-[11px] text-slate-400">Demandée {timeAgo(r.createdAt)} pour le {formatDate(r.requestedDate)}</p>
              {r.status === "PENDING" && (
                <div className="mt-auto flex gap-2 pt-4">
                  <Link href={`/admin/newMission?request=${r.id}`} className="btn-primary flex-1 py-2"><ClipboardPlus size={15} /> Planifier</Link>
                  <button className="btn-ghost px-2.5 text-red-600" onClick={() => setRejecting(r)} title="Refuser"><X size={16} /></button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      <ReasonDialog open={!!rejecting} onClose={() => setRejecting(null)} pending={pending} title="Refuser la demande" confirmLabel="Refuser"
        message="Le client sera notifié. La collecte ne sera pas décomptée de son quota."
        suggestions={["Aucun véhicule disponible ce jour", "Zone inaccessible", "Date non desservie"]}
        onConfirm={(reason) => run(async () => {
          const res = await collectionRequests.reject(rejecting.id, reason);
          if (res.success) { notify.success("Demande refusée"); setRejecting(null); list.reload({ silent: true }); } else notify.error(res.error);
        })} />
    </div>
  );
}
