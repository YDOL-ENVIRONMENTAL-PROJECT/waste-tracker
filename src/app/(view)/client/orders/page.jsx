"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, ReceiptText } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useAction, useAsync } from "@/hooks/useAsync";
import { orders as orderService } from "@/services/order";
import { notify } from "@/lib/notify";
import { formatDateTime, formatFcfa } from "@/lib/format";
import { DELIVERY_MODE, ORDER_STATUS } from "@/lib/labels";

const STEPS = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED"];

export default function ClientOrdersPage() {
  const list = useAsync(() => orderService.mine(), [], { initial: [], sync: ["orders"] });
  const [cancelling, setCancelling] = useState(null);
  const [pending, run] = useAction();

  return (
    <div>
      <PageHeader title="Mes commandes" actions={<Link href="/client/shop" className="btn-ghost"><ArrowLeft size={16} /> Boutique</Link>} />
      {list.loading ? <CardsSkeleton count={2} className="h-40" /> : list.data.length === 0 ? (
        <Card><EmptyState icon={<ReceiptText size={26} />} title="Aucune commande" description="Découvrez les produits de la boutique verte." action={<Link href="/client/shop" className="btn-primary">Voir la boutique</Link>} /></Card>
      ) : (
        <div className="space-y-4">
          {list.data.map((o) => {
            const step = STEPS.indexOf(o.status);
            return (
              <Card key={o.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{o.reference}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(o.createdAt)} · {DELIVERY_MODE[o.deliveryMode]?.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={o.paymentStatus === "PAID" ? "green" : "amber"}>{o.paymentStatus === "PAID" ? "Payée" : "Paiement à la remise"}</Badge>
                    <StatusBadge map={ORDER_STATUS} value={o.status} />
                  </div>
                </div>
                {o.status !== "CANCELLED" && (
                  <div className="mt-5 flex items-center">
                    {STEPS.map((s, i) => (
                      <div key={s} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center">
                          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i <= step ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400"}`}>{i < step ? <Check size={14} /> : i + 1}</span>
                          <span className="mt-1 hidden text-[10.5px] text-slate-500 sm:block">{ORDER_STATUS[s].label}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 flex-1 rounded ${i < step ? "bg-brand-500" : "bg-slate-200"}`} />}
                      </div>
                    ))}
                  </div>
                )}
                <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
                  {o.items.map((i) => (
                    <li key={i.productId} className="flex justify-between text-slate-600"><span>{i.quantity} × {i.productName}</span><span>{formatFcfa(i.lineTotal)}</span></li>
                  ))}
                  <li className="flex justify-between pt-1 font-semibold text-slate-900"><span>Total</span><span>{formatFcfa(o.totalAmount)}</span></li>
                </ul>
                {o.cancelReason && <p className="mt-3 text-xs text-slate-500">Annulée : {o.cancelReason}</p>}
                {o.status === "PENDING" && <button className="btn-danger-soft mt-4 py-2 text-xs" onClick={() => setCancelling(o)}>Annuler la commande</button>}
              </Card>
            );
          })}
        </div>
      )}
      <ConfirmDialog open={!!cancelling} onClose={() => setCancelling(null)} danger pending={pending} title="Annuler la commande ?" confirmLabel="Annuler la commande"
        message={`La commande ${cancelling?.reference} sera annulée.`}
        onConfirm={() => run(async () => {
          const r = await orderService.cancelMine(cancelling.id);
          if (r.success) { notify.success("Commande annulée"); setCancelling(null); list.reload({ silent: true }); } else notify.error(r.error);
        })} />
    </div>
  );
}
