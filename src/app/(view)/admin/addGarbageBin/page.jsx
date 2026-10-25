"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";
import ImageInput from "@/components/ui/ImageInput";
import Spinner from "@/components/ui/Spinner";
import { MapPicker } from "@/components/map";
import { garbagebins } from "@/services/garbagebin";
import { notify } from "@/lib/notify";
import { BIN_STATUS, TOWNS } from "@/lib/labels";

const EMPTY = { code: "", town: "Yaoundé", quarter: "", capacityLiters: "", description: "", photo: "", status: "EMPTY", position: null };

function BinForm() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    if (!id) return;
    garbagebins.getById(id).then((r) => {
      if (r.success) {
        const b = r.data;
        setForm({
          code: b.code, town: b.town || "", quarter: b.quarter || "", capacityLiters: b.capacityLiters ?? "",
          description: b.description || "", photo: b.photo || "", status: b.status,
          position: b.latitude != null ? { latitude: b.latitude, longitude: b.longitude } : null,
        });
      } else notify.error(r.error);
      setLoading(false);
    });
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.position) return notify.warning("Placez le bac sur la carte");
    setSaving(true);
    const payload = {
      code: form.code.trim(), town: form.town, quarter: form.quarter, description: form.description || null,
      photo: form.photo || null, capacityLiters: form.capacityLiters ? Number(form.capacityLiters) : null,
      latitude: form.position.latitude, longitude: form.position.longitude, status: form.status,
    };
    const r = id ? await garbagebins.update(id, payload) : await garbagebins.create(payload);
    setSaving(false);
    if (r.success) {
      notify.success(id ? "Bac mis à jour" : `Bac ${r.data.code} ajouté`);
      router.push("/admin/garbageBinList");
    } else notify.error(r.error);
  };

  if (loading) return <Spinner />;

  return (
    <form onSubmit={submit}>
      <PageHeader
        title={id ? `Modifier le bac ${form.code}` : "Ajouter un bac"}
        subtitle="Chaque bac doit être géolocalisé pour apparaître sur la carte et être proposé aux clients."
        actions={<Link href="/admin/garbageBinList" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Identification" />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              <Input label="Code du bac" required value={form.code} onChange={(e) => set({ code: e.target.value.toUpperCase() })} placeholder="Ex. YDE-BAS-001" hint="Identifiant unique, visible sur le bac" />
              <Input label="Capacité (litres)" type="number" min="0" value={form.capacityLiters} onChange={(e) => set({ capacityLiters: e.target.value })} placeholder="Ex. 660" />
              <Select label="Ville" required value={form.town} onChange={(e) => set({ town: e.target.value })} options={Object.keys(TOWNS).map((t) => ({ value: t, label: t }))} />
              <div>
                <Input label="Quartier" required list="bin-quarters" value={form.quarter} onChange={(e) => set({ quarter: e.target.value })} placeholder="Ex. Bastos" />
                <datalist id="bin-quarters">{(TOWNS[form.town] || []).map((q) => <option key={q} value={q} />)}</datalist>
              </div>
              <Textarea className="sm:col-span-2" label="Repère / description" value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="Ex. Face à la pharmacie, à côté du carrefour" />
              {id && <Select className="sm:col-span-2" label="État" value={form.status} onChange={(e) => set({ status: e.target.value })} options={["EMPTY", "FULL", "OUT_OF_SERVICE"].map((s) => ({ value: s, label: BIN_STATUS[s].label }))} />}
            </div>
          </Card>
          <Card>
            <CardHeader title="Photo" subtitle="Aide les chauffeurs à reconnaître le bac" />
            <div className="px-5 pb-5"><ImageInput value={form.photo} onChange={(photo) => set({ photo })} /></div>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader title="Position GPS" subtitle="Cliquez sur la carte ou utilisez votre position actuelle sur place" icon={<MapPin size={18} />} />
          <div className="px-5 pb-5"><MapPicker value={form.position} onChange={(position) => set({ position })} height={440} kind="bin" /></div>
        </Card>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Link href="/admin/garbageBinList" className="btn-secondary">Annuler</Link>
        <button className="btn-primary" disabled={saving}>{saving && <Spinner />} {id ? "Enregistrer" : "Ajouter le bac"}</button>
      </div>
    </form>
  );
}

export default function AddGarbageBinPage() {
  return <Suspense fallback={<Spinner />}><BinForm /></Suspense>;
}
