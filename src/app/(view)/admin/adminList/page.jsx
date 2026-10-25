"use client";

import Link from "next/link";
import { Archive, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { DataTable, IconButton, RowActions } from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import Avatar from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useAction, useAsync } from "@/hooks/useAsync";
import { useSession } from "@/components/providers/SessionProvider";
import { admins as adminService } from "@/services/admin";
import { notify } from "@/lib/notify";
import { fullName, timeAgo } from "@/lib/format";
import { ROLE, USER_STATUS } from "@/lib/labels";

export default function AdminListPage() {
  const { user } = useSession();
  const isSuper = user?.role === "SUPER_ADMIN";
  const list = useAsync(() => adminService.getAll(), [], { initial: [] });
  const [archiving, setArchiving] = useState(null);
  const [pending, run] = useAction();

  const columns = [
    { key: "name", header: "Administrateur", render: (a) => (
      <div className="flex items-center gap-3">
        <Avatar person={a} online={a.status === "ONLINE"} />
        <div><p className="font-semibold text-slate-800">{fullName(a)}{a.email === user?.email && <span className="ml-2 text-xs font-normal text-slate-400">(vous)</span>}</p><p className="text-xs text-slate-500">{a.email}</p></div>
      </div>
    ) },
    { key: "role", header: "Rôle", render: (a) => <Badge tone={ROLE[a.role]?.tone}>{ROLE[a.role]?.label}</Badge> },
    { key: "site", header: "Site", hideOnMobile: true, render: (a) => a.site || "—" },
    { key: "phone", header: "Téléphone", hideOnMobile: true, render: (a) => a.phone || "—" },
    { key: "status", header: "Présence", render: (a) => <div><StatusBadge map={USER_STATUS} value={a.status} /><p className="text-[11px] text-slate-400">{a.lastSeenAt ? timeAgo(a.lastSeenAt) : ""}</p></div> },
    ...(isSuper ? [{ key: "actions", header: "", render: (a) => a.email !== user?.email && (
      <RowActions><IconButton icon={<Archive size={16} />} label="Archiver" tone="red" onClick={() => setArchiving(a)} /></RowActions>
    ) }] : []),
  ];

  return (
    <div>
      <PageHeader title="Administrateurs" subtitle="Membres de la tour de contrôle."
        actions={isSuper && <Link href="/admin/addAdmin" className="btn-primary"><Plus size={16} /> Ajouter un administrateur</Link>} />
      {!isSuper && <p className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">Seul un super administrateur peut ajouter ou retirer des administrateurs.</p>}
      <Card>
        <DataTable columns={columns} rows={list.data} loading={list.loading} error={list.error} onRetry={list.reload}
          empty={<EmptyState icon={<ShieldCheck size={26} />} title="Aucun administrateur" />} />
      </Card>
      <ConfirmDialog open={!!archiving} onClose={() => setArchiving(null)} danger pending={pending} title="Retirer cet administrateur ?" confirmLabel="Retirer"
        message={`${archiving ? fullName(archiving) : ""} perdra immédiatement l'accès à la tour de contrôle.`}
        onConfirm={() => run(async () => {
          const r = await adminService.archive(archiving.id);
          if (r.success) { notify.success("Administrateur retiré"); setArchiving(null); list.reload({ silent: true }); } else notify.error(r.error);
        })} />
    </div>
  );
}
