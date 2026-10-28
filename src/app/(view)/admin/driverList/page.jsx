"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Archive, FileUp, Mail, MailWarning, Pencil, Phone, Plus, RefreshCw, Trash2, Truck, UserRound } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { DataTable, FilterPills, IconButton, RowActions, SearchInput } from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import Avatar from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/Modal";
import CsvImportModal from "@/components/shared/CsvImportModal";
import { useAction, useAsync } from "@/hooks/useAsync";
import { depots as depotService } from "@/services/depot";
import { useSession } from "@/components/providers/SessionProvider";
import { drivers as driverService } from "@/services/driver";
import { notify } from "@/lib/notify";
import { formatDateTime, includesText, timeAgo } from "@/lib/format";
import { ACTIVATION_STATUS, USER_STATUS } from "@/lib/labels";

const CSV_COLUMNS = [
  { key: "firstName", label: "Prénom", required: true },
  { key: "lastName", label: "Nom", required: true },
  { key: "email", label: "E-mail (reçoit le lien d'activation)", required: true },
  { key: "phone", label: "Téléphone" },
  { key: "town", label: "Ville" },
  { key: "quarter", label: "Quartier" },
  { key: "depot", label: "Nom de la caserne de rattachement", required: true },
  { key: "dateOfBirth", label: "Date de naissance (aaaa-mm-jj)" },
];

export default function DriverListPage() {
  const { user } = useSession();
  const list = useAsync(() => driverService.getAll(), [], { initial: [], pollMs: 60_000, sync: ["admin:drivers"] });
  const depots = useAsync(() => depotService.getAll(), [], { initial: [], sync: ["admin:depots"] });
  const depotId = (name) => depots.data.find((d) => !d.draft && d.name.toLowerCase() === (name || "").trim().toLowerCase())?.id || null;
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState(null); // { driver, action: "archive" | "delete" }
  const [importOpen, setImportOpen] = useState(false);
  const [pending, run] = useAction();

  const isPending = (d) => d.status === "PENDING";
  const canDelete = (d) => isPending(d) && (user?.role === "SUPER_ADMIN" || d.createdById === user?.id);

  const rows = useMemo(() => list.data
    .filter((d) => filter === "ALL" || (filter === "ONLINE" ? d.status === "ONLINE" : filter === "PENDING" ? isPending(d) : filter === "NOVEHICLE" ? !isPending(d) && !d.vehicleId : true))
    .filter((d) => includesText(`${d.firstName} ${d.lastName} ${d.email} ${d.phone} ${d.depotName} ${d.vehicleImmatriculation}`, query)), [list.data, filter, query]);

  const act = (fn, msg) => run(async () => {
    const r = await fn();
    if (r.success) { notify.success(msg); setConfirm(null); list.reload({ silent: true }); } else notify.error(r.error);
  });

  const columns = [
    { key: "name", header: "Chauffeur", render: (d) => (
      <div className="flex items-center gap-3">
        <Avatar person={d} online={isPending(d) ? undefined : d.status === "ONLINE"} />
        <div className="min-w-0"><p className="font-semibold text-slate-800">{d.firstName} {d.lastName}</p><p className="truncate text-xs text-slate-500">{d.depotName || <span className="text-amber-700">Caserne à renseigner</span>}</p></div>
      </div>
    ) },
    { key: "contact", header: "Contact", hideOnMobile: true, render: (d) => (
      <div className="space-y-0.5 text-xs text-slate-600">
        <p className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400" />{d.phone || "—"}</p>
        <p className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400" />{d.email}</p>
      </div>
    ) },
    { key: "vehicle", header: "Véhicule", render: (d) => d.vehicleImmatriculation
      ? <span className="flex items-center gap-1.5 font-medium text-slate-700"><Truck size={14} className="text-slate-400" />{d.vehicleImmatriculation}</span>
      : <span className="text-xs text-slate-400" title="Le chauffeur est relié au véhicule en se connectant depuis le téléphone de service">Non connecté</span> },
    { key: "status", header: "Compte", render: (d) => isPending(d) ? (
      <div>
        <StatusBadge map={ACTIVATION_STATUS} value={d.activationStatus} />
        <p className="mt-0.5 text-[11px] text-slate-400">{d.activationStatus === "EXPIRED" ? "lien à renvoyer" : `expire ${formatDateTime(d.activationExpiresAt)}`}</p>
      </div>
    ) : (
      <div><StatusBadge map={USER_STATUS} value={d.status} /><p className="mt-0.5 text-[11px] text-slate-400">{d.lastSeenAt ? `vu ${timeAgo(d.lastSeenAt)}` : "jamais connecté"}</p></div>
    ) },
    { key: "actions", header: "", render: (d) => (
      <RowActions>
        {isPending(d) && (
          <IconButton icon={d.activationStatus === "EXPIRED" ? <MailWarning size={16} /> : <RefreshCw size={16} />} label="Renvoyer le lien d'activation" tone="green"
            onClick={() => act(() => driverService.resendActivation(d.id), `Nouveau lien envoyé à ${d.email}`)} disabled={pending} />
        )}
        <Link href={`/admin/addDriver?id=${d.id}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Modifier"><Pencil size={16} /></Link>
        {canDelete(d) && <IconButton icon={<Trash2 size={16} />} label="Supprimer définitivement" tone="red" onClick={() => setConfirm({ driver: d, action: "delete" })} />}
        {!isPending(d) && <IconButton icon={<Archive size={16} />} label="Archiver" tone="red" onClick={() => setConfirm({ driver: d, action: "archive" })} />}
      </RowActions>
    ) },
  ];

  const pendingCount = list.data.filter(isPending).length;
  return (
    <div>
      <PageHeader title="Chauffeurs" subtitle="Chaque chauffeur reçoit un lien d'activation par e-mail avec son mot de passe ; il ajoute sa photo puis utilise l'application mobile."
        actions={<>
          <button className="btn-secondary" onClick={() => setImportOpen(true)}><FileUp size={16} /> Importer (CSV)</button>
          <Link href="/admin/addDriver" className="btn-primary"><Plus size={16} /> Ajouter un chauffeur</Link>
        </>} />
      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterPills value={filter} onChange={setFilter} options={[
            { value: "ALL", label: "Tous", count: list.data.length },
            { value: "ONLINE", label: "En ligne", count: list.data.filter((d) => d.status === "ONLINE").length },
            { value: "PENDING", label: "Non activés", count: pendingCount },
            { value: "NOVEHICLE", label: "Sans véhicule", count: list.data.filter((d) => !isPending(d) && !d.vehicleId).length },
          ]} />
          <SearchInput value={query} onChange={setQuery} placeholder="Nom, téléphone, véhicule…" className="lg:w-72" />
        </div>
        <DataTable columns={columns} rows={rows} loading={list.loading} error={list.error} onRetry={list.reload}
          empty={<EmptyState icon={<UserRound size={26} />} title="Aucun chauffeur" description="Créez les comptes de vos chauffeurs : ils recevront un e-mail d'activation." action={<Link href="/admin/addDriver" className="btn-primary"><Plus size={16} /> Ajouter un chauffeur</Link>} />} />
      </Card>

      <ConfirmDialog open={confirm?.action === "archive"} onClose={() => setConfirm(null)} danger pending={pending} title="Archiver ce chauffeur ?" confirmLabel="Archiver"
        message={`${confirm?.driver.firstName} ${confirm?.driver.lastName} ne pourra plus se connecter et son véhicule sera libéré.`}
        onConfirm={() => act(() => driverService.archive(confirm.driver.id), "Chauffeur archivé")} />
      <ConfirmDialog open={confirm?.action === "delete"} onClose={() => setConfirm(null)} danger pending={pending} title="Supprimer définitivement ce compte ?" confirmLabel="Supprimer"
        message={`Le compte non activé de ${confirm?.driver.firstName} ${confirm?.driver.lastName} sera supprimé et son lien d'activation désactivé.`}
        onConfirm={() => act(() => driverService.remove(confirm.driver.id), "Compte supprimé")} />

      <CsvImportModal open={importOpen} onClose={() => setImportOpen(false)} title="Importer des chauffeurs"
        description="Chaque chauffeur importé reçoit un e-mail avec son lien d'activation (valable 24 h) et son mot de passe."
        columns={CSV_COLUMNS} templateName="modele_chauffeurs.csv"
        example={["Paul", "Mba", "paul.mba@exemple.cm", "677000000", "Yaoundé", "Mvan", depots.data.find((d) => !d.draft)?.name || "Caserne de Mvan", "1990-05-14"]}
        toRow={(r) => ({ firstName: r.firstname, lastName: r.lastname, email: r.email, phone: r.phone || null, town: r.town || null,
          quarter: r.quarter || null, depotId: depotId(r.depot), dateOfBirth: r.dateofbirth || null })}
        onImport={(rows) => driverService.importMany(rows)} onDone={() => list.reload({ silent: true })} />
    </div>
  );
}
