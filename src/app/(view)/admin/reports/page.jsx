"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ClipboardPlus, ImageOff, MapPin, Siren, UserRound, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { FilterPills } from "@/components/ui/Table";
import EmptyState, { ErrorState } from "@/components/ui/EmptyState";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import { Modal, ReasonDialog } from "@/components/ui/Modal";
import { LeafletMap } from "@/components/map";
import { useAction, useAsync } from "@/hooks/useAsync";
import { reports as reportService } from "@/services/report";
import { notify } from "@/lib/notify";
import { formatDateTime, timeAgo } from "@/lib/format";
import { REPORT_STATUS, REPORT_TYPE, ROLE } from "@/lib/labels";

export default function AdminReportsPage() {
  const list = useAsync(() => reportService.getAll(), [], { initial: [], pollMs: 30_000, sync: ["admin:reports"] });
  const [filter, setFilter] = useState("NEW");
  const [rejecting, setRejecting] = useState(null);
  const [zoom, setZoom] = useState(null);
  const [pending, run] = useAction();

  const rows = list.data.filter((r) => filter === "ALL" || r.status === filter);
  const count = (s) => list.data.filter((r) => r.status === s).length;

  const act = (fn, success) => run(async () => {
    const r = await fn();
    if (r.success) {
      notify.success(success);
      list.reload({ silent: true });
      return true;
    }
    notify.error(r.error);
    return false;
  });

  return (
    <div>
      <PageHeader
        title="Signalements"
        subtitle="Les alertes de la population et des chauffeurs. Validez-les pour mettre à jour l'état des bacs, puis créez la mission de collecte."
      />
      <div className="mb-5">
        <FilterPills value={filter} onChange={setFilter} options={[
          { value: "NEW", label: "À traiter", count: count("NEW") },
          { value: "IN_PROGRESS", label: "Pris en charge", count: count("IN_PROGRESS") },
          { value: "RESOLVED", label: "Résolus", count: count("RESOLVED") },
          { value: "REJECTED", label: "Non retenus", count: count("REJECTED") },
          { value: "ALL", label: "Tous", count: list.data.length },
        ]} />
      </div>

      {list.loading ? <CardsSkeleton className="h-80" /> : list.error ? <ErrorState message={list.error} onRetry={list.reload} /> : rows.length === 0 ? (
        <Card><EmptyState icon={<Siren size={26} />} title={filter === "NEW" ? "Aucun signalement à traiter" : "Aucun signalement"} description="Les nouveaux signalements apparaîtront ici automatiquement." /></Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {rows.map((r) => (
            <Card key={r.id} className="flex flex-col overflow-hidden">
              <button type="button" onClick={() => setZoom(r)} className="relative h-44 bg-slate-100">
                {r.photo ? (
                  <img src={r.photo} alt="" className="h-full w-full object-cover" />
                ) : r.latitude != null ? (
                  <div className="pointer-events-none h-full"><LeafletMap controls={false} markers={[{ id: r.id, position: [r.latitude, r.longitude], kind: "alert", color: "amber" }]} zoom={15} /></div>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300"><ImageOff size={28} /></div>
                )}
                <div className="absolute left-3 top-3 flex gap-2">
                  <span className="chip bg-white/95 font-semibold text-slate-800 shadow-sm">{REPORT_TYPE[r.type]?.emoji} {REPORT_TYPE[r.type]?.label}</span>
                  {r.duplicateCount > 0 && <span className="chip bg-red-600 font-semibold text-white">+{r.duplicateCount} signalement(s)</span>}
                </div>
              </button>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-sm font-semibold text-slate-800">
                      <MapPin size={14} className="text-slate-400" />
                      {r.binCode ? `Bac ${r.binCode} — ${r.binQuarter || ""}` : "Position GPS"}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <UserRound size={12} /> {r.authorName} · <Badge tone={ROLE[r.authorRole]?.tone}>{ROLE[r.authorRole]?.label}</Badge>
                    </p>
                  </div>
                  <StatusBadge map={REPORT_STATUS} value={r.status} />
                </div>
                {r.comment && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">« {r.comment} »</p>}
                {r.rejectionReason && <p className="mt-3 text-xs text-slate-500">Motif : {r.rejectionReason}</p>}
                <p className="mt-3 text-xs text-slate-400" title={formatDateTime(r.createdAt)}>Signalé {timeAgo(r.createdAt)}{r.missionId ? ` · Mission #${r.missionId}` : ""}</p>

                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  {r.status === "NEW" && (
                    <>
                      {r.binId ? (
                        <Link href={`/admin/newMission?bin=${r.binId}&report=${r.id}`} className="btn-primary flex-1 px-3 py-2"><ClipboardPlus size={15} /> Créer la mission</Link>
                      ) : (
                        <Link href={`/admin/newMission?report=${r.id}`} className="btn-primary flex-1 px-3 py-2"><ClipboardPlus size={15} /> Mission</Link>
                      )}
                      <button className="btn-secondary px-3 py-2" disabled={pending} onClick={() => act(() => reportService.validate(r.id), "Signalement pris en charge")} title="Valider sans créer de mission">
                        <Check size={15} /> Valider
                      </button>
                      <button className="btn-ghost px-2.5 py-2 text-red-600" onClick={() => setRejecting(r)} title="Rejeter"><X size={16} /></button>
                    </>
                  )}
                  {r.status === "IN_PROGRESS" && (
                    <>
                      {!r.missionId && r.binId && <Link href={`/admin/newMission?bin=${r.binId}&report=${r.id}`} className="btn-primary flex-1 px-3 py-2"><ClipboardPlus size={15} /> Créer la mission</Link>}
                      <button className="btn-secondary flex-1 px-3 py-2" disabled={pending} onClick={() => act(() => reportService.resolve(r.id), "Signalement clôturé")}>
                        <Check size={15} /> Clôturer
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ReasonDialog
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        pending={pending}
        title="Rejeter le signalement"
        message="L'auteur sera informé du motif."
        confirmLabel="Rejeter"
        suggestions={["Doublon", "Bac déjà vidé", "Signalement non fondé", "Hors zone de collecte"]}
        onConfirm={async (reason) => {
          if (await act(() => reportService.reject(rejecting.id, reason), "Signalement rejeté")) setRejecting(null);
        }}
      />

      <Modal open={!!zoom} onClose={() => setZoom(null)} title={zoom ? REPORT_TYPE[zoom.type]?.label : ""} subtitle={zoom ? `${zoom.authorName} · ${formatDateTime(zoom.createdAt)}` : ""} size="lg">
        {zoom && (
          <div className="grid gap-4 md:grid-cols-2">
            {zoom.photo ? <img src={zoom.photo} alt="" className="w-full rounded-2xl" /> : <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">Pas de photo</div>}
            <div className="h-64 overflow-hidden rounded-2xl border border-slate-200 md:h-auto">
              {zoom.latitude != null && <LeafletMap markers={[{ id: "r", position: [zoom.latitude, zoom.longitude], kind: "alert", color: "amber" }]} />}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
