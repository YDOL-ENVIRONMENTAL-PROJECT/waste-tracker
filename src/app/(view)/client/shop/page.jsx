"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Minus, Package, Plus, ReceiptText, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { FilterPills, SearchInput } from "@/components/ui/Table";
import { ChoiceCards, Input, Textarea } from "@/components/ui/Field";
import EmptyState from "@/components/ui/EmptyState";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import Spinner from "@/components/ui/Spinner";
import { Drawer, Modal } from "@/components/ui/Modal";
import { useAsync } from "@/hooks/useAsync";
import { useCart } from "@/components/providers/CartProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { products as productService } from "@/services/product";
import { orders as orderService } from "@/services/order";
import { notify } from "@/lib/notify";
import { formatFcfa, includesText } from "@/lib/format";

function Shop() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useSession();
  const cart = useCart();
  const catalog = useAsync(() => productService.getAll(), [], { initial: [], sync: ["products"] });
  const [category, setCategory] = useState("ALL");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);
  const [cartOpen, setCartOpen] = useState(params.get("cart") === "1");
  const [checkout, setCheckout] = useState(false);
  const [order, setOrder] = useState({ deliveryMode: "PICKUP", deliveryAddress: "", contactPhone: user?.phone || "", note: "" });
  const [placing, setPlacing] = useState(false);

  useEffect(() => { if (params.get("cart") === "1") setCartOpen(true); }, [params]);

  const categories = [...new Set(catalog.data.map((p) => p.category).filter(Boolean))];
  const rows = useMemo(() => catalog.data
    .filter((p) => category === "ALL" || p.category === category)
    .filter((p) => includesText(`${p.name} ${p.description} ${p.category}`, query)), [catalog.data, category, query]);

  const addToCart = (p) => {
    if (p.stock <= 0) return;
    cart.add(p);
    notify.success(`${p.name} ajouté au panier`);
  };

  const place = async (e) => {
    e.preventDefault();
    setPlacing(true);
    const r = await orderService.create({ ...order, items: cart.items.map((i) => ({ productId: i.id, quantity: i.quantity })) });
    setPlacing(false);
    if (r.success) {
      cart.reload(); // les produits commandés ont quitté le panier côté serveur
      setCheckout(false);
      setCartOpen(false);
      notify.success(`Commande ${r.data.reference} enregistrée`);
      router.push("/client/orders");
    } else notify.error(r.error);
  };

  return (
    <div>
      <PageHeader title="Boutique verte" subtitle="Des produits issus de la valorisation des déchets collectés dans votre ville."
        actions={<>
          <Link href="/client/orders" className="btn-secondary"><ReceiptText size={16} /> Mes commandes</Link>
          <button className="btn-primary" onClick={() => setCartOpen(true)}><ShoppingCart size={16} /> Panier{cart.count ? ` (${cart.count})` : ""}</button>
        </>} />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="overflow-x-auto"><FilterPills value={category} onChange={setCategory} options={[{ value: "ALL", label: "Tout" }, ...categories.map((c) => ({ value: c, label: c }))]} /></div>
        <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un produit…" className="lg:w-72" />
      </div>
      {catalog.loading ? <CardsSkeleton className="h-72" /> : rows.length === 0 ? (
        <Card><EmptyState icon={<ShoppingBag size={26} />} title="Aucun produit disponible" description="Le catalogue sera bientôt enrichi." /></Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {rows.map((p) => (
            <Card key={p.id} className="group flex flex-col overflow-hidden">
              <button className="relative aspect-square bg-gradient-to-br from-brand-50 to-emerald-100" onClick={() => setDetail(p)}>
                {p.photo ? <img src={p.photo} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <Package size={40} className="absolute inset-0 m-auto text-brand-300" />}
                {p.stock <= 0 && <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-slate-600">Épuisé</span>}
              </button>
              <div className="flex flex-1 flex-col p-3.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{p.category}</p>
                <button className="mt-0.5 text-left text-sm font-semibold leading-snug text-slate-900 hover:text-brand-700" onClick={() => setDetail(p)}>{p.name}</button>
                <p className="mt-auto pt-2 font-display text-base font-bold text-brand-700">{formatFcfa(p.unitPrice)}<span className="text-xs font-medium text-slate-400"> / {p.unit}</span></p>
                <button className="btn-primary mt-3 py-2 text-xs" disabled={p.stock <= 0} onClick={() => addToCart(p)}><Plus size={14} /> Ajouter</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name} subtitle={detail?.category} size="lg"
        footer={detail && <button className="btn-primary" disabled={detail.stock <= 0} onClick={() => { addToCart(detail); setDetail(null); }}><Plus size={16} /> Ajouter au panier — {formatFcfa(detail.unitPrice)}</button>}>
        {detail && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="aspect-square overflow-hidden rounded-2xl bg-brand-50">{detail.photo && <img src={detail.photo} alt="" className="h-full w-full object-cover" />}</div>
            <div>
              <p className="font-display text-2xl font-bold text-brand-700">{formatFcfa(detail.unitPrice)} <span className="text-sm font-medium text-slate-400">/ {detail.unit}</span></p>
              <p className={`mt-1 text-sm ${detail.stock > 0 ? "text-brand-700" : "text-red-600"}`}>{detail.stock > 0 ? `${detail.stock} disponible(s)` : "Épuisé"}</p>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">{detail.description || "Produit issu de la valorisation des déchets."}</p>
            </div>
          </div>
        )}
      </Modal>

      <Drawer open={cartOpen} onClose={() => setCartOpen(false)} title="Mon panier" subtitle={`${cart.count} article(s)`}
        footer={cart.count > 0 && <div className="w-full"><div className="mb-3 flex justify-between text-sm"><span className="text-slate-600">Total</span><span className="font-display text-lg font-bold text-slate-900">{formatFcfa(cart.total)}</span></div><button className="btn-primary w-full" onClick={() => setCheckout(true)}>Commander</button></div>}>
        {cart.items.length === 0 ? (
          <EmptyState icon={<ShoppingCart size={26} />} title="Votre panier est vide" description="Ajoutez des produits depuis la boutique." />
        ) : (
          <ul className="space-y-3">
            {cart.items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-50">{i.photo && <img src={i.photo} alt="" className="h-full w-full object-cover" />}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{i.name}</p>
                  <p className="text-xs text-slate-500">{formatFcfa(i.unitPrice)} / {i.unit}</p>
                  <div className="mt-1.5 flex items-center gap-1">
                    <button className="rounded-lg border border-slate-200 p-1 hover:bg-slate-50" onClick={() => cart.setQuantity(i.id, i.quantity - 1)} aria-label="Moins"><Minus size={12} /></button>
                    <span className="w-8 text-center text-sm font-semibold">{i.quantity}</span>
                    <button className="rounded-lg border border-slate-200 p-1 hover:bg-slate-50 disabled:opacity-40" disabled={i.quantity >= i.stock} onClick={() => cart.setQuantity(i.id, i.quantity + 1)} aria-label="Plus"><Plus size={12} /></button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatFcfa(i.unitPrice * i.quantity)}</p>
                  <button className="mt-1 text-slate-400 hover:text-red-600" onClick={() => cart.setQuantity(i.id, 0)} aria-label="Retirer"><Trash2 size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Drawer>

      <Modal open={checkout} onClose={() => setCheckout(false)} title="Finaliser la commande" subtitle={`Total : ${formatFcfa(cart.total)} — paiement à la remise`}
        footer={<><button className="btn-secondary" onClick={() => setCheckout(false)}>Retour</button><button className="btn-primary" form="checkout" disabled={placing}>{placing && <Spinner />} Confirmer la commande</button></>}>
        <form id="checkout" onSubmit={place} className="space-y-4">
          <ChoiceCards columns={2} value={order.deliveryMode} onChange={(deliveryMode) => setOrder({ ...order, deliveryMode })} options={[
            { value: "PICKUP", label: "Retrait", description: "Au point de vente YDOL" },
            { value: "DELIVERY", label: "Livraison", description: "À l'adresse de votre choix" },
          ]} />
          {order.deliveryMode === "DELIVERY" && <Input label="Adresse de livraison" required value={order.deliveryAddress} onChange={(e) => setOrder({ ...order, deliveryAddress: e.target.value })} placeholder={`Ex. ${user?.quarter || "Bastos"}, derrière la pharmacie`} />}
          <Input label="Téléphone de contact" type="tel" required value={order.contactPhone} onChange={(e) => setOrder({ ...order, contactPhone: e.target.value })} />
          <Textarea label="Note (facultatif)" rows={2} value={order.note} onChange={(e) => setOrder({ ...order, note: e.target.value })} />
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">Le paiement en ligne (Orange Money, MTN MoMo) arrive bientôt. Pour l'instant, vous réglez en espèces au retrait ou à la livraison.</p>
        </form>
      </Modal>
    </div>
  );
}

export default function ShopPage() {
  return <Suspense fallback={<Spinner />}><Shop /></Suspense>;
}
