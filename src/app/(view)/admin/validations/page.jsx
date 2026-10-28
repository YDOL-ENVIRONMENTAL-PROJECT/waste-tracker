"use client";

import Link from "next/link";
import { BadgeCheck, Boxes, Building2, Pencil, Recycle, Truck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import EmptyState, { ErrorState } from "@/components/ui/EmptyState";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import { ApprovalActions } from "@/components/approval/Approval";
import { useAsync } from "@/hooks/useAsync";
import { useSession } from "@/components/providers/SessionProvider";
import { vehicles } from "@/services/vehicle";
import { garbagebins } from "@/services/garbagebin";
import { depots } from "@/services/depot";
import { products } from "@/services/product";
import { formatDateTime } from "@/lib/format";

const KINDS = [
  { key: "bins", title: "Bacs à ordures", icon: Recycle, service: garbagebins, edit: (x) => `/admin/addGarbageBin?id=${x.id}`,
    name: (x) => x.code, detail: (x) => [x.quarter, x.town].filter(Boolean).join(", "), label: (x) => `le bac ${x.code}` },
  { key: "vehicles", title: "Véhicules", icon: Truck, service: vehicles, edit: (x) => `/admin/addVehicle?id=${x.id}`,
    name: (x) => x.immatriculation, detail: (x) => [x.name, x.brand, x.deviceId && `tél. ${x.deviceId}`].filter(Boolean).join(" · "), label: (x) => `le véhicule ${x.immatriculation}` },
  { key: "depots", title: "Casernes", icon: Building2, service: depots, edit: () => "/admin/depots",
    name: (x) => x.name, detail: (x) => [x.address, x.town].filter(Boolean).join(", "), label: (x) => `la caserne ${x.name}` },
  { key: "products", title: "Produits", icon: Boxes, service: products, edit: (x) => `/admin/addProduct?id=${x.id}`,
    name: (x) => x.name, detail: (x) => [x.category, x.reference].filter(Boolean).join(" · "), label: (x) => `le produit ${x.name}` },
];

export default function ValidationsPage() {
  const { user } = useSession();
  const data = useAsync(async () => {
    const results = await Promise.all(KINDS.map((k) => k.service.getAll()));
    const failed = results.find((r) => !r.success);
    if (failed) return failed;
    return { success: true, data: Object.fromEntries(KINDS.map((k, i) => [k.key, results[i].data.filter((x) => x.draft)])) };
  }, [], { initial: {}, pollMs: 60_000, sync: ["admin:bins", "admin:vehicles", "admin:depots", "admin:products"] });

  const total = KINDS.reduce((n, k) => n + (data.data[k.key]?.length || 0), 0);
  const superAdmin = user?.role === "SUPER_ADMIN";

  return (
    <div>
      <PageHeader title="Brouillons à valider"
        subtitle={superAdmin
          ? "Éléments créés par les administrateurs : validez-les pour les rendre opérationnels, ou supprimez-les. Une fois validé, un élément ne peut plus qu'être archivé."
          : "Créations en attente de validation par un super administrateur. Leur auteur peut encore les modifier ou les supprimer."} />
      {data.loading ? <CardsSkeleton count={2} /> : data.error ? <ErrorState message={data.error} onRetry={data.reload} /> : total === 0 ? (
        <Card><EmptyState icon={<BadgeCheck size={26} />} title="Rien à valider" description="Aucun brouillon en attente pour le moment." /></Card>
      ) : (
        <div className="space-y-6">
          {KINDS.filter((k) => data.data[k.key]?.length).map((k) => {
            const Icon = k.icon;
            return (
              <Card key={k.key}>
                <CardHeader title={`${k.title} (${data.data[k.key].length})`} icon={<Icon size={18} />} />
                <ul className="divide-y divide-slate-100 border-t border-slate-100">
                  {data.data[k.key].map((x) => (
                    <li key={x.id} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">{k.name(x)}</p>
                        <p className="truncate text-xs text-slate-500">{k.detail(x) || "—"}</p>
                        <p className="mt-0.5 text-xs text-violet-700">Créé par {x.requestedByName || "—"}{x.createdAt ? ` · ${formatDateTime(x.createdAt)}` : ""}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={k.edit(x)} className="btn-ghost px-2.5 py-1.5 text-xs"><Pencil size={14} /> Voir / modifier</Link>
                        <ApprovalActions item={x} service={k.service} label={k.label(x)} onDone={() => data.reload({ silent: true })} compact archive={false} />
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
