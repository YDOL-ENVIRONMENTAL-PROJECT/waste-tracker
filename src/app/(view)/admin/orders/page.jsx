"use client";

import { useState } from "react";
import { BadgeCheck, MapPin, Phone, ShoppingBag, XCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { DataTable, FilterPills, SearchInput } from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { DetailRow, Drawer, ReasonDialog } from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { useAction, useAsync } from "@/hooks/useAsync";
import { orders as orderService } from "@/services/order";
import { notify } from "@/lib/notify";
import { formatDateTime, formatFcfa, includesText, timeAgo } from "@/lib/format";
import { DELIVERY_MODE, ORDER_NEXT, ORDER_STATUS } from "@/lib/labels";

export default function OrdersPage() {
  const list = useAsync(() => orderService.getAll(), [], { initial: [], pollMs: 60_000 });
  const [filter, setFilter] = useState("PENDING");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [pending, run] = useAction();

  const rows = list.data.filter((o) => filter === "ALL" || o.status === filter).filter((o) => includesText(`${o.reference} ${o.clientName} ${o.contactPhone}`, query));
  const count = (s) => list.data.filter((o) => o.status === s).length;

  const act = (fn, msg) => run(async () => {
    const r = await fn();
    if (r.success) { notify.success(msg); setSelected(r.data); setCancelling(false); list.reload({ silent: true }); } else notify.error(r.error);
  });

  const columns = [
    { key: "ref", header: "Commande", render: (o) => <div><p className="font-semibold text-slate-800">{o.reference}</p><p className="text-xs text-slate-400">{timeAgo(o.createdAt)}</p></div> },
    { key: "client", header: "Client", render: (o) => <div><p className="text-slate-700">{o.clientName}</p><p className="text-xs text-slate-400">{o.contactPhone}</p></div> },
    { key: "items", header: "Articles", hideOnMobile: true, render: (o) => <span className="text-slate-600">{o.items.map((i) => `${i.quantity} × ${i.productName}`).join(", ")}</span> },
    { key: "total", header: "Total", render: (o) => <span className="font-semibold text-slate-900">{formatFcfa(o.totalAmount)}</span> },
    { key: "pay", header: "Paiement", hideOnMobile: true, render: (o) => <Badge tone={o.paymentStatus === "PAID" ? "green" : "amber"}>{o.paymentStatus === "PAID" ? "Payée" : "À encaisser"}</Badge> },
    { key: "status", header: "Statut", render: (o) => <StatusBadge map={ORDER_STATUS} value={o.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Commandes" subtitle="Préparez, livrez et encaissez les commandes de la boutique (paiement à la livraison ou au retrait)." />
      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterPills value={filter} onChange={setFilter} options={[
            { value: "PENDING", label: "Nouvelles", count: count("PENDING") },
            { value: "CONFIRMED", label: "Confirmées", count: count("CONFIRMED") },
            { value: "PREPARING", label: "En préparation", count: count("PREPARING") },
            { value: "READY", label: "Prêtes", count: count("READY") },
            { value: "DELIVERED", label: "Livrées", count: count("DELIVERED") },
            { value: "ALL", label: "Toutes", count: list.data.length },
          ]} />
          <SearchInput value={query} onChange={setQuery} placeholder="Référence, client…" className="lg:w-64" />
        </div>
        <DataTable columns={columns} rows={rows} loading={list.loading} error={list.error} onRetry={list.reload} onRowClick={setSelected}
          empty={<EmptyState icon={<ShoppingBag size={26} />} title="Aucune commande" />} />
      </Card>

      {selected && (
        <Drawer open onClose={() => setSelected(null)} title={`Commande ${selected.reference}`} subtitle={<StatusBadge map={ORDER_STATUS} value={selected.status} />}
          footer={!["DELIVERED", "CANCELLED"].includes(selected.status) && <>
            <button className="btn-danger-soft" onClick={() => setCancelling(true)}><XCircle size={15} /> Annuler</button>
            {selected.paymentStatus !== "PAID" && <button className="btn-secondary" disabled={pending} onClick={() => act(() => orderService.markPaid(selected.id), "Paiement enregistré")}><BadgeCheck size={15} /> Marquer payée</button>}
            {(ORDER_NEXT[selected.status] || []).map((s) => (
              <button key={s} className="btn-primary" disabled={pending} onClick={() => act(() => orderService.setStatus(selected.id, s), `Commande ${ORDER_STATUS[s].label.toLowerCase()}`)}>
                {pending && <Spinner />} {ORDER_STATUS[s].label}
              </button>
            ))}
          </>}>
          <ul className="mb-5 divide-y divide-slate-100 rounded-2xl border border-slate-200">
            {selected.items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3 p-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">{i.photo && <img src={i.photo} alt="" className="h-full w-full object-cover" />}</div>
                <div className="flex-1"><p className="text-sm font-medium text-slate-800">{i.productName}</p><p className="text-xs text-slate-500">{i.quantity} × {formatFcfa(i.unitPrice)}</p></div>
                <p className="text-sm font-semibold">{formatFcfa(i.lineTotal)}</p>
              </li>
            ))}
            <li className="flex justify-between p-3 text-sm font-semibold"><span>Total</span><span className="text-brand-700">{formatFcfa(selected.totalAmount)}</span></li>
          </ul>
          <DetailRow label="Client">{selected.clientName}</DetailRow>
          <DetailRow label="Téléphone"><a href={`tel:${selected.contactPhone}`} className="flex items-center justify-end gap-1 text-brand-700"><Phone size={13} />{selected.contactPhone}</a></DetailRow>
          <DetailRow label="Remise">{DELIVERY_MODE[selected.deliveryMode]?.label}</DetailRow>
          {selected.deliveryAddress && <DetailRow label="Adresse"><span className="flex items-center justify-end gap-1"><MapPin size={13} />{selected.deliveryAddress}</span></DetailRow>}
          {selected.note && <DetailRow label="Note">{selected.note}</DetailRow>}
          <DetailRow label="Paiement">{selected.paymentStatus === "PAID" ? "Encaissé" : "À encaisser"}</DetailRow>
          <DetailRow label="Passée le">{formatDateTime(selected.createdAt)}</DetailRow>
          {selected.cancelReason && <DetailRow label="Motif d'annulation">{selected.cancelReason}</DetailRow>}
        </Drawer>
      )}
      <ReasonDialog open={cancelling} onClose={() => setCancelling(false)} pending={pending} title="Annuler la commande" confirmLabel="Annuler la commande"
        message="Le stock réservé sera restitué et le client notifié." suggestions={["Rupture de stock", "Client injoignable", "Demande du client"]}
        onConfirm={(reason) => act(() => orderService.setStatus(selected.id, "CANCELLED", reason), "Commande annulée")} />
    </div>
  );
}
