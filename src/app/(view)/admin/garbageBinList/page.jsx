"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Archive, ClipboardPlus, Pencil, Plus, Recycle, RotateCcw } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, StatCard } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { DataTable, FilterPills, IconButton, RowActions, SearchInput } from "@/components/ui/Table";
import { Select } from "@/components/ui/Field";
import EmptyState from "@/components/ui/EmptyState";
import { ConfirmDialog, DetailRow, Drawer } from "@/components/ui/Modal";
import { LeafletMap } from "@/components/map";
import { ApprovalActions, DraftBadge } from "@/components/approval/Approval";
import { useAction, useAsync } from "@/hooks/useAsync";
import { garbagebins } from "@/services/garbagebin";
import { notify } from "@/lib/notify";
import { formatDateTime, includesText, timeAgo } from "@/lib/format";
import { BIN_STATUS } from "@/lib/labels";

export default function GarbageBinListPage() {
  const [archived, setArchived] = useState(false);
  const list = useAsync(() => (archived ? garbagebins.getArchived() : garbagebins.getAll()), [archived], { initial: [], sync: ["admin:bins"] });
  const [status, setStatus] = useState("ALL");
  const [town, setTown] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [archiving, setArchiving] = useState(null);
  const [pending, run] = useAction();

  const towns = [...new Set(list.data.map((b) => b.town).filter(Boolean))].sort();
  const rows = useMemo(() => list.data
    .filter((b) => status === "ALL" || (status === "DRAFT" ? b.draft : !b.draft && b.status === status))
    .filter((b) => !town || b.town === town)
    .filter((b) => includesText(`${b.code} ${b.quarter} ${b.town} ${b.description}`, query)),
  [list.data, status, town, query]);
  const count = (s) => list.data.filter((b) => !b.draft && b.status === s).length;
  const drafts = list.data.filter((b) => b.draft).length;

  const act = (fn, msg, after) => run(async () => {
    const r = await fn();
    if (r.success) {
      notify.success(msg);
      after?.(r.data);
      list.reload({ silent: true });
    } else notify.error(r.error);
  });

  const columns = [
    { key: "code", header: "Bac", render: (b) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {b.photo ? <img src={b.photo} alt="" className="h-full w-full object-cover" /> : <Recycle size={18} className="m-2.5 text-slate-400" />}
        </div>
        <div><p className="font-semibold text-slate-800">{b.code}</p><p className="text-xs text-slate-500">{b.capacityLiters ? `${b.capacityLiters} kg` : "Capacité non renseignée"}</p></div>
      </div>
    ) },
    { key: "place", header: "Emplacement", render: (b) => <div><p className="text-slate-700">{b.quarter || "—"}</p><p className="text-xs text-slate-400">{b.town}</p></div> },
    { key: "emptied", header: "Dernier vidage", hideOnMobile: true, render: (b) => <span className="text-slate-500">{b.lastEmptiedAt ? timeAgo(b.lastEmptiedAt) : "—"}</span> },
    { key: "status", header: "État", render: (b) => (b.draft ? <DraftBadge item={b} /> : <StatusBadge map={BIN_STATUS} value={b.status} />) },
    { key: "actions", header: "", className: "w-40", render: (b) => (
      <RowActions>
        {archived ? (
          <IconButton icon={<RotateCcw size={16} />} label="Restaurer" tone="green" onClick={() => act(() => garbagebins.restore(b.id), `Bac ${b.code} restauré`)} />
        ) : (
          <>
            <Link href={`/admin/addGarbageBin?id=${b.id}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Modifier"><Pencil size={16} /></Link>
            {b.draft
              ? <ApprovalActions item={b} service={garbagebins} label={`le bac ${b.code}`} onDone={() => list.reload({ silent: true })} compact archive={false} />
              : <IconButton icon={<Archive size={16} />} label="Archiver" tone="red" onClick={() => setArchiving(b)} />}
          </>
        )}
      </RowActions>
    ) },
  ];

  return (
    <div>
      <PageHeader
        title="Bacs à ordures"
        subtitle="Référentiel géolocalisé des bacs et de leur état."
        actions={<Link href="/admin/addGarbageBin" className="btn-primary"><Plus size={16} /> Ajouter un bac</Link>}
      />
      {!archived && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard icon={<Recycle size={20} />} label="Bacs actifs" value={list.data.length - drafts} loading={list.loading} tone="green" />
          <StatCard icon={<Recycle size={20} />} label="Pleins à vider" value={count("FULL")} loading={list.loading} tone="red" />
          <StatCard icon={<Recycle size={20} />} label="Hors service" value={count("OUT_OF_SERVICE")} loading={list.loading} tone="slate" />
        </div>
      )}
      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <FilterPills value={archived ? "ARCH" : status} onChange={(v) => { if (v === "ARCH") { setArchived(true); setStatus("ALL"); } else { setArchived(false); setStatus(v); } }} options={[
              { value: "ALL", label: "Tous" },
              { value: "FULL", label: "Pleins" },
              { value: "EMPTY", label: "Vides" },
              { value: "OUT_OF_SERVICE", label: "Hors service" },
              { value: "DRAFT", label: "Brouillons", count: drafts },
              { value: "ARCH", label: "Archivés" },
            ]} />
            {towns.length > 1 && <Select value={town} onChange={(e) => setTown(e.target.value)} placeholder="Toutes les villes" options={towns.map((t) => ({ value: t, label: t }))} className="w-44" />}
          </div>
          <SearchInput value={query} onChange={setQuery} placeholder="Code, quartier…" className="lg:w-64" />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={list.loading}
          error={list.error}
          onRetry={list.reload}
          onRowClick={archived ? undefined : setSelected}
          empty={<EmptyState icon={<Recycle size={26} />} title="Aucun bac" description="Ajoutez les bacs de votre zone de collecte avec leur position GPS." action={!archived && <Link href="/admin/addGarbageBin" className="btn-primary"><Plus size={16} /> Ajouter un bac</Link>} />}
        />
      </Card>

      {selected && (
        <Drawer
          open
          onClose={() => setSelected(null)}
          title={`Bac ${selected.code}`}
          subtitle={selected.draft ? <DraftBadge item={selected} /> : <StatusBadge map={BIN_STATUS} value={selected.status} />}
          footer={
            <>
              <Link href={`/admin/addGarbageBin?id=${selected.id}`} className="btn-secondary"><Pencil size={15} /> Modifier</Link>
              {selected.draft && <ApprovalActions item={selected} service={garbagebins} label={`le bac ${selected.code}`} onDone={() => { setSelected(null); list.reload({ silent: true }); }} archive={false} />}
              {!selected.draft && selected.status === "FULL" && <Link href={`/admin/newMission?bin=${selected.id}`} className="btn-primary"><ClipboardPlus size={15} /> Créer une mission</Link>}
            </>
          }
        >
          {selected.photo && <img src={selected.photo} alt="" className="mb-4 h-48 w-full rounded-2xl object-cover" />}
          {selected.latitude != null && (
            <div className="mb-4 h-48 overflow-hidden rounded-2xl border border-slate-200">
              <LeafletMap markers={[{ id: selected.id, position: [selected.latitude, selected.longitude], kind: "bin", color: selected.status === "FULL" ? "red" : "green" }]} zoom={16} />
            </div>
          )}
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Changer l'état</p>
          <div className="mb-5 grid grid-cols-3 gap-2">
            {["EMPTY", "FULL", "OUT_OF_SERVICE"].map((s) => (
              <button key={s} disabled={pending || selected.status === s} onClick={() => act(() => garbagebins.setStatus(selected.id, s), "État mis à jour", setSelected)}
                className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${selected.status === s ? "border-brand-500 bg-brand-50 text-brand-800" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                {BIN_STATUS[s].label}
              </button>
            ))}
          </div>
          <DetailRow label="Quartier">{selected.quarter}</DetailRow>
          <DetailRow label="Ville">{selected.town}</DetailRow>
          <DetailRow label="Capacité">{selected.capacityLiters ? `${selected.capacityLiters} kg` : "—"}</DetailRow>
          <DetailRow label="Repère">{selected.description}</DetailRow>
          <DetailRow label="Dernier passage à plein">{formatDateTime(selected.lastFullAt)}</DetailRow>
          <DetailRow label="Dernier vidage">{formatDateTime(selected.lastEmptiedAt)}</DetailRow>
          <DetailRow label="Coordonnées">{selected.latitude?.toFixed(5)}, {selected.longitude?.toFixed(5)}</DetailRow>
          <DetailRow label="Ajouté le">{formatDateTime(selected.createdAt)}</DetailRow>
        </Drawer>
      )}

      <ConfirmDialog
        open={!!archiving}
        onClose={() => setArchiving(null)}
        pending={pending}
        danger
        title="Archiver ce bac ?"
        message={`Le bac ${archiving?.code} sera retiré de la carte et ne pourra plus être ciblé par une mission. Vous pourrez le restaurer depuis l'onglet « Archivés ».`}
        confirmLabel="Archiver"
        onConfirm={() => act(() => garbagebins.archive(archiving.id), "Bac archivé", () => setArchiving(null))}
      />
    </div>
  );
}
