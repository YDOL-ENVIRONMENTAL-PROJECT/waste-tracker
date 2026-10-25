"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Archive, Mail, Pencil, Phone, Plus, RotateCcw, Truck, UserRound } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { DataTable, FilterPills, IconButton, RowActions, SearchInput } from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import Avatar from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useAction, useAsync } from "@/hooks/useAsync";
import { drivers as driverService } from "@/services/driver";
import { notify } from "@/lib/notify";
import { includesText, timeAgo } from "@/lib/format";
import { USER_STATUS } from "@/lib/labels";

export default function DriverListPage() {
  const list = useAsync(() => driverService.getAll(), [], { initial: [], pollMs: 60_000 });
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [archiving, setArchiving] = useState(null);
  const [pending, run] = useAction();

  const rows = useMemo(() => list.data
    .filter((d) => filter === "ALL" || (filter === "ONLINE" ? d.status === "ONLINE" : filter === "NOVEHICLE" ? !d.vehicleId : true))
    .filter((d) => includesText(`${d.firstName} ${d.lastName} ${d.email} ${d.phone} ${d.site} ${d.vehicleImmatriculation}`, query)), [list.data, filter, query]);

  const columns = [
    { key: "name", header: "Chauffeur", render: (d) => (
      <div className="flex items-center gap-3">
        <Avatar person={d} online={d.status === "ONLINE"} />
        <div className="min-w-0"><p className="font-semibold text-slate-800">{d.firstName} {d.lastName}</p><p className="truncate text-xs text-slate-500">{d.site || d.town || "—"}</p></div>
      </div>
    ) },
    { key: "contact", header: "Contact", hideOnMobile: true, render: (d) => (
      <div className="space-y-0.5 text-xs text-slate-600">
        <p className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400" />{d.phone || "—"}</p>
        <p className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400" />{d.email}</p>
      </div>
    ) },
    { key: "vehicle", header: "Véhicule", render: (d) => d.vehicleImmatriculation ? <span className="flex items-center gap-1.5 font-medium text-slate-700"><Truck size={14} className="text-slate-400" />{d.vehicleImmatriculation}</span> : <Link href="/admin/vehicleList" className="text-xs text-amber-700 hover:underline">À affecter</Link> },
    { key: "status", header: "Présence", render: (d) => (
      <div><StatusBadge map={USER_STATUS} value={d.status} /><p className="mt-0.5 text-[11px] text-slate-400">{d.lastSeenAt ? `vu ${timeAgo(d.lastSeenAt)}` : "jamais connecté"}</p></div>
    ) },
    { key: "actions", header: "", render: (d) => (
      <RowActions>
        <Link href={`/admin/addDriver?id=${d.id}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Modifier"><Pencil size={16} /></Link>
        <IconButton icon={<Archive size={16} />} label="Archiver" tone="red" onClick={() => setArchiving(d)} />
      </RowActions>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Chauffeurs" subtitle="Les chauffeurs reçoivent et exécutent leurs missions depuis l'application mobile." actions={<Link href="/admin/addDriver" className="btn-primary"><Plus size={16} /> Ajouter un chauffeur</Link>} />
      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterPills value={filter} onChange={setFilter} options={[
            { value: "ALL", label: "Tous", count: list.data.length },
            { value: "ONLINE", label: "En ligne", count: list.data.filter((d) => d.status === "ONLINE").length },
            { value: "NOVEHICLE", label: "Sans véhicule", count: list.data.filter((d) => !d.vehicleId).length },
          ]} />
          <SearchInput value={query} onChange={setQuery} placeholder="Nom, téléphone, véhicule…" className="lg:w-72" />
        </div>
        <DataTable columns={columns} rows={rows} loading={list.loading} error={list.error} onRetry={list.reload}
          empty={<EmptyState icon={<UserRound size={26} />} title="Aucun chauffeur" description="Créez les comptes de vos chauffeurs : ils se connecteront à l'application mobile avec ces identifiants." action={<Link href="/admin/addDriver" className="btn-primary"><Plus size={16} /> Ajouter un chauffeur</Link>} />} />
      </Card>
      <ConfirmDialog open={!!archiving} onClose={() => setArchiving(null)} danger pending={pending} title="Archiver ce chauffeur ?" confirmLabel="Archiver"
        message={`${archiving?.firstName} ${archiving?.lastName} ne pourra plus se connecter et son véhicule sera libéré.`}
        onConfirm={() => run(async () => {
          const r = await driverService.archive(archiving.id);
          if (r.success) { notify.success("Chauffeur archivé"); setArchiving(null); list.reload({ silent: true }); } else notify.error(r.error);
        })} />
    </div>
  );
}
