"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";
import ImageInput from "@/components/ui/ImageInput";
import Spinner from "@/components/ui/Spinner";
import { ApprovalHint, SaveButtons } from "@/components/approval/Approval";
import { products as productService } from "@/services/product";
import { notify } from "@/lib/notify";
import { formatFcfa } from "@/lib/format";
import { PRODUCT_CATEGORIES, PRODUCT_STATUS, PRODUCT_UNITS } from "@/lib/labels";

function ProductForm() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const [form, setForm] = useState({ reference: "", name: "", category: PRODUCT_CATEGORIES[0], description: "", photo: "", unitPrice: "", unit: "sac", stock: "", alertThreshold: "5", status: "PUBLISHED" });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    if (!id) return;
    productService.getById(id).then((r) => {
      if (r.success) setForm({ ...r.data, description: r.data.description || "", photo: r.data.photo || "", category: r.data.category || "", unit: r.data.unit || "" });
      else notify.error(r.error);
      setLoading(false);
    });
  }, [id]);

  const save = async (saveAsDraft) => {
    if (!form.name.trim()) return notify.warning("Le nom du produit est obligatoire");
    setSaving(true);
    const payload = { ...form, unitPrice: Number(form.unitPrice || 0), stock: Number(form.stock || 0), alertThreshold: Number(form.alertThreshold || 0), reference: form.reference || null, saveAsDraft };
    const r = id ? await productService.update(id, payload) : await productService.create(payload);
    setSaving(false);
    if (r.success) { notify.success(id ? "Produit mis à jour" : r.data.draft ? "Produit enregistré en brouillon" : "Produit ajouté"); router.push("/admin/productList"); } else notify.error(r.error);
  };

  if (loading) return <Spinner />;
  return (
    <form onSubmit={(e) => { e.preventDefault(); save(undefined); }}>
      <PageHeader title={id ? "Modifier le produit" : "Ajouter un produit"} actions={<Link href="/admin/productList" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>} />
      {!id && <ApprovalHint />}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Description" />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              <Input className="sm:col-span-2" label="Nom du produit" required value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ex. Compost organique — sac de 25 kg" />
              <Select label="Catégorie" value={form.category} onChange={(e) => set({ category: e.target.value })} options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))} />
              <Input label="Référence" value={form.reference} disabled={!!id} onChange={(e) => set({ reference: e.target.value })} placeholder="Générée automatiquement" />
              <Textarea className="sm:col-span-2" label="Description" rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="Composition, usage conseillé, conditionnement…" />
            </div>
          </Card>
          <Card>
            <CardHeader title="Prix et stock" />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              <Input label="Prix unitaire (F CFA)" type="number" min="0" required value={form.unitPrice} onChange={(e) => set({ unitPrice: e.target.value })} hint={form.unitPrice ? formatFcfa(form.unitPrice) : null} />
              <Select label="Unité de vente" value={form.unit} onChange={(e) => set({ unit: e.target.value })} options={PRODUCT_UNITS.map((u) => ({ value: u, label: u }))} />
              <Input label="Stock disponible" type="number" min="0" required value={form.stock} onChange={(e) => set({ stock: e.target.value })} />
              <Input label="Seuil d'alerte" type="number" min="0" value={form.alertThreshold} onChange={(e) => set({ alertThreshold: e.target.value })} hint="Une alerte est envoyée sous ce niveau" />
              <Select className="sm:col-span-2" label="Mise en vente" hint="« Hors vente » masque le produit de la boutique, même une fois validé." value={form.status} onChange={(e) => set({ status: e.target.value })} options={["PUBLISHED", "DRAFT"].map((s) => ({ value: s, label: PRODUCT_STATUS[s].label }))} />
            </div>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader title="Photo" />
          <div className="px-5 pb-5"><ImageInput value={form.photo} onChange={(photo) => set({ photo })} aspect="aspect-[4/3]" /></div>
        </Card>
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Link href="/admin/productList" className="btn-secondary">Annuler</Link>
        <SaveButtons isEdit={!!id} saving={saving} onSave={save} />
      </div>
    </form>
  );
}

export default function AddProductPage() {
  return <Suspense fallback={<Spinner />}><ProductForm /></Suspense>;
}
