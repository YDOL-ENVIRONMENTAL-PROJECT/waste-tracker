"use client";

import { useMemo, useState } from "react";
import { Archive, Building, Crown, Mail, MapPin, Phone, RotateCcw, Users } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { DataTable, FilterPills, IconButton, RowActions, SearchInput } from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import Avatar from "@/components/ui/Avatar";
import { ConfirmDialog, DetailRow, Drawer } from "@/components/ui/Modal";
import { LeafletMap } from "@/components/map";
import { useAction, useAsync } from "@/hooks/useAsync";
import { clients as clientService } from "@/services/client";
import { notify } from "@/lib/notify";
import { formatDate, fullName, includesText, timeAgo } from "@/lib/format";
import { CLIENT_TYPE, USER_STATUS } from "@/lib/labels";

export default function ClientListPage() {
  const list = useAsync(() => clientService.getAll(), [], { initial: [] });
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [archiving, setArchiving] = useState(null);
  const [pending, run] = useAction();

  const isEnterprise = (c) => !c.lastName && !!c.name;
  const rows = useMemo(() => list.data
    .filter((c) => filter === "ALL" || (filter === "PREMIUM" ? c.type === "PREMIUM" : filter === "ENTERPRISE" ? isEnterprise(c) : !isEnterprise(c)))
    .filter((c) => includesText(`${fullName(c)} ${c.email} ${c.phone} ${c.town} ${c.quarter}`, query)), [list.data, filter, query]);

  const columns = [
    { key: "name", header: "Client", render: (c) => (
      <div className="flex items-center gap-3">
        <Avatar person={c} online={c.status === "ONLINE"} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-semibold text-slate-800">{fullName(c)}{c.type === "PREMIUM" && <Crown size={14} className="text-amber-500" />}</p>
          <p className="text-xs text-slate-500">{isEnterprise(c) ? "Entreprise" : "Particulier"}</p>
        </div>
      </div>
    ) },
    { key: "contact", header: "Contact", hideOnMobile: true, render: (c) => <div className="text-xs text-slate-600"><p>{c.phone || "—"}</p><p className="text-slate-400">{c.email}</p></div> },
    { key: "place", header: "Localisation", render: (c) => <div><p className="text-slate-700">{c.quarter || "—"}</p><p className="text-xs text-slate-400">{c.town}</p></div> },
    { key: "type", header: "Offre", render: (c) => <StatusBadge map={CLIENT_TYPE} value={c.type} dot={false} /> },
    { key: "seen", header: "Activité", hideOnMobile: true, render: (c) => <span className="text-xs text-slate-500">{c.lastSeenAt ? timeAgo(c.lastSeenAt) : "—"}</span> },
    { key: "actions", header: "", render: (c) => <RowActions><IconButton icon={<Archive size={16} />} label="Archiver" tone="red" onClick={() => setArchiving(c)} /></RowActions> },
  ];

  return (
    <div>
      <PageHeader title="Clients" subtitle="Particuliers et entreprises inscrits sur la plateforme." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Users size={20} />} label="Clients inscrits" value={list.data.length} loading={list.loading} tone="green" />
        <StatCard icon={<Crown size={20} />} label="Clients premium" value={list.data.filter((c) => c.type === "PREMIUM").length} loading={list.loading} tone="amber" href="/admin/subscriptions" />
        <StatCard icon={<Building size={20} />} label="Entreprises" value={list.data.filter(isEnterprise).length} loading={list.loading} tone="blue" />
      </div>
      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterPills value={filter} onChange={setFilter} options={[
            { value: "ALL", label: "Tous" }, { value: "INDIVIDUAL", label: "Particuliers" }, { value: "ENTERPRISE", label: "Entreprises" }, { value: "PREMIUM", label: "Premium" },
          ]} />
          <SearchInput value={query} onChange={setQuery} placeholder="Nom, téléphone, quartier…" className="lg:w-72" />
        </div>
        <DataTable columns={columns} rows={rows} loading={list.loading} error={list.error} onRetry={list.reload} onRowClick={setSelected}
          empty={<EmptyState icon={<Users size={26} />} title="Aucun client" description="Les clients s'inscrivent eux-mêmes depuis la page d'accueil." />} />
      </Card>

      {selected && (
        <Drawer open onClose={() => setSelected(null)} title={fullName(selected)} subtitle={<div className="flex gap-2"><StatusBadge map={CLIENT_TYPE} value={selected.type} dot={false} /><StatusBadge map={USER_STATUS} value={selected.status} /></div>}>
          <div className="mb-5 flex justify-center"><Avatar person={selected} size="xl" /></div>
          <DetailRow label="Type de compte">{isEnterprise(selected) ? "Entreprise" : "Particulier"}</DetailRow>
          <DetailRow label="E-mail"><span className="flex items-center justify-end gap-1"><Mail size={13} />{selected.email}</span></DetailRow>
          <DetailRow label="Téléphone"><span className="flex items-center justify-end gap-1"><Phone size={13} />{selected.phone || "—"}</span></DetailRow>
          <DetailRow label="Localisation"><span className="flex items-center justify-end gap-1"><MapPin size={13} />{[selected.quarter, selected.town].filter(Boolean).join(", ")}</span></DetailRow>
          {selected.dateOfBirth && <DetailRow label="Date de naissance">{formatDate(selected.dateOfBirth)}</DetailRow>}
          <DetailRow label="Inscrit le">{formatDate(selected.createdAt)}</DetailRow>
          <DetailRow label="Dernière activité">{selected.lastSeenAt ? timeAgo(selected.lastSeenAt) : "—"}</DetailRow>
          {selected.latitude != null && (
            <div className="mt-5 h-48 overflow-hidden rounded-2xl border border-slate-200">
              <LeafletMap markers={[{ id: "c", position: [selected.latitude, selected.longitude], kind: "home", color: selected.type === "PREMIUM" ? "amber" : "green" }]} zoom={15} />
            </div>
          )}
          {selected.type === "PREMIUM" && <Badge tone="amber" className="mt-4">Abonnement premium actif</Badge>}
        </Drawer>
      )}

      <ConfirmDialog open={!!archiving} onClose={() => setArchiving(null)} danger pending={pending} title="Archiver ce client ?" confirmLabel="Archiver"
        message={`${archiving ? fullName(archiving) : ""} ne pourra plus se connecter. Son historique est conservé.`}
        onConfirm={() => run(async () => {
          const r = await clientService.archive(archiving.id);
          if (r.success) { notify.success("Client archivé"); setArchiving(null); list.reload({ silent: true }); } else notify.error(r.error);
        })} />
    </div>
  );
}
