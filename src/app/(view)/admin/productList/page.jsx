"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Archive, Boxes, Package, Pencil, Plus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { FilterPills, SearchInput } from "@/components/ui/Table";
import EmptyState, { ErrorState } from "@/components/ui/EmptyState";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useAction, useAsync } from "@/hooks/useAsync";
import { products as productService } from "@/services/product";
import { notify } from "@/lib/notify";
import { formatFcfa, includesText } from "@/lib/format";
import { PRODUCT_STATUS } from "@/lib/labels";

export default function ProductListPage() {
  const list = useAsync(() => productService.getAll(), [], { initial: [] });
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [archiving, setArchiving] = useState(null);
  const [pending, run] = useAction();

  const rows = useMemo(() => list.data
    .filter((p) => filter === "ALL" || (filter === "LOW" ? p.lowStock : p.status === filter))
    .filter((p) => includesText(`${p.name} ${p.reference} ${p.category}`, query)), [list.data, filter, query]);

  return (
    <div>
      <PageHeader title="Produits dérivés" subtitle="Catalogue des produits issus de la valorisation des déchets, vendus aux clients."
        actions={<Link href="/admin/addProduct" className="btn-primary"><Plus size={16} /> Ajouter un produit</Link>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Boxes size={20} />} label="Produits en vente" value={list.data.filter((p) => p.status === "PUBLISHED").length} loading={list.loading} tone="green" />
        <StatCard icon={<Package size={20} />} label="Brouillons" value={list.data.filter((p) => p.status === "DRAFT").length} loading={list.loading} tone="slate" />
        <StatCard icon={<AlertTriangle size={20} />} label="Stock bas" value={list.data.filter((p) => p.lowStock).length} loading={list.loading} tone="red" />
      </div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterPills value={filter} onChange={setFilter} options={[{ value: "ALL", label: "Tous" }, { value: "PUBLISHED", label: "En vente" }, { value: "DRAFT", label: "Brouillons" }, { value: "LOW", label: "Stock bas" }]} />
        <SearchInput value={query} onChange={setQuery} placeholder="Nom, référence…" className="lg:w-64" />
      </div>
      {list.loading ? <CardsSkeleton /> : list.error ? <ErrorState message={list.error} onRetry={list.reload} /> : rows.length === 0 ? (
        <Card><EmptyState icon={<Boxes size={26} />} title="Aucun produit" description="Ajoutez compost, briquettes, matériaux recyclés…" action={<Link href="/admin/addProduct" className="btn-primary"><Plus size={16} /> Ajouter un produit</Link>} /></Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {rows.map((p) => (
            <Card key={p.id} className="flex flex-col overflow-hidden">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-brand-50 to-emerald-100">
                {p.photo ? <img src={p.photo} alt="" className="h-full w-full object-cover" /> : <Package size={40} className="absolute inset-0 m-auto text-brand-300" />}
                <div className="absolute left-3 top-3 flex gap-1.5"><StatusBadge map={PRODUCT_STATUS} value={p.status} />{p.lowStock && <Badge tone="red">Stock bas</Badge>}</div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{p.category || "—"} · {p.reference}</p>
                <p className="mt-0.5 font-semibold text-slate-900">{p.name}</p>
                <p className="mt-2 font-display text-lg font-bold text-brand-700">{formatFcfa(p.unitPrice)} <span className="text-xs font-medium text-slate-400">/ {p.unit || "unité"}</span></p>
                <p className={`text-xs ${p.lowStock ? "text-red-600" : "text-slate-500"}`}>{p.stock} en stock (alerte à {p.alertThreshold})</p>
                <div className="mt-auto flex gap-2 pt-4">
                  <Link href={`/admin/addProduct?id=${p.id}`} className="btn-secondary flex-1 py-2 text-xs"><Pencil size={14} /> Modifier</Link>
                  <button className="btn-ghost px-2.5 py-2 text-red-600" onClick={() => setArchiving(p)} title="Archiver"><Archive size={15} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!archiving} onClose={() => setArchiving(null)} danger pending={pending} title="Archiver ce produit ?" confirmLabel="Archiver"
        message={`${archiving?.name} sera retiré de la boutique.`}
        onConfirm={() => run(async () => {
          const r = await productService.archive(archiving.id);
          if (r.success) { notify.success("Produit archivé"); setArchiving(null); list.reload({ silent: true }); } else notify.error(r.error);
        })} />
    </div>
  );
}
