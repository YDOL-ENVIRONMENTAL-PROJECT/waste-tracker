"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Smartphone } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, SearchSelect, Select } from "@/components/ui/Field";
import ImageInput from "@/components/ui/ImageInput";
import Spinner from "@/components/ui/Spinner";
import { ApprovalHint, SaveButtons } from "@/components/approval/Approval";
import { useAsync } from "@/hooks/useAsync";
import { vehicles as vehicleService } from "@/services/vehicle";
import { depots as depotService } from "@/services/depot";
import { notify } from "@/lib/notify";
import { VEHICLE_STATUS } from "@/lib/labels";

function VehicleForm() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const depots = useAsync(() => depotService.getAll(), [], { initial: [] });
  const fleet = useAsync(() => vehicleService.getAll(), [], { initial: [] });
  const [form, setForm] = useState({ immatriculation: "", name: "", brand: "", modele: "", maxCapacity: "", photo: "", deviceId: "", depotId: "", status: "AVAILABLE" });
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const editing = id ? fleet.data.find((v) => v.id === id) : null;
  useEffect(() => {
    if (editing) {
      setForm({
        immatriculation: editing.immatriculation, name: editing.name || "", brand: editing.brand || "", modele: editing.modele || "",
        maxCapacity: editing.maxCapacity || "", photo: editing.photo || "", deviceId: editing.deviceId || "", depotId: editing.depotId || "", status: editing.status,
      });
    }
  }, [editing?.id]);

  const depot = depots.data.find((d) => d.id === form.depotId);
  const save = async (saveAsDraft) => {
    if (!form.immatriculation.trim()) return notify.warning("L'immatriculation est obligatoire");
    if (!form.depotId) return notify.warning("Choisissez la caserne de rattachement du véhicule");
    setSaving(true);
    const payload = {
      immatriculation: form.immatriculation, name: form.name || null, brand: form.brand || null, modele: form.modele || null,
      maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : null, photo: form.photo || null,
      deviceId: form.deviceId || null, depotId: form.depotId || null, status: form.status, saveAsDraft,
      // Un nouveau véhicule démarre à sa caserne tant que le téléphone n'a pas transmis de position.
      ...(!id && depot ? { latitude: depot.latitude, longitude: depot.longitude } : {}),
    };
    const r = id ? await vehicleService.update(id, payload) : await vehicleService.create(payload);
    setSaving(false);
    if (r.success) {
      notify.success(id ? "Véhicule mis à jour" : r.data.draft ? "Véhicule enregistré en brouillon" : "Véhicule créé");
      router.push("/admin/vehicleList");
    } else notify.error(r.error);
  };

  if (id && fleet.loading) return <Spinner />;
  return (
    <form onSubmit={(e) => { e.preventDefault(); save(undefined); }}>
      <PageHeader title={id ? `Modifier ${form.immatriculation}` : "Ajouter un véhicule"} actions={<Link href="/admin/vehicleList" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>} />
      {!id && <ApprovalHint />}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Caractéristiques" />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              <Input label="Immatriculation" required value={form.immatriculation} onChange={(e) => set({ immatriculation: e.target.value.toUpperCase() })} placeholder="LT-123-AB" />
              <Input label="Nom d'usage" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Benne 01" />
              <Input label="Marque" value={form.brand} onChange={(e) => set({ brand: e.target.value })} placeholder="Renault" />
              <Input label="Modèle" value={form.modele} onChange={(e) => set({ modele: e.target.value })} placeholder="D-Wide" />
              <Input label="Capacité maximale (tonnes)" type="number" step="0.1" min="0" value={form.maxCapacity} onChange={(e) => set({ maxCapacity: e.target.value })} />
              <Select label="Statut" value={form.status} onChange={(e) => set({ status: e.target.value })} options={["AVAILABLE", "SLEEPING", "BROKEN_DOWN", "OUT_OF_SERVICE"].map((s) => ({ value: s, label: VEHICLE_STATUS[s].label }))} />
              <SearchSelect className="sm:col-span-2" label="Caserne de rattachement" required value={form.depotId} onChange={(depotId) => set({ depotId })}
                placeholder="Tapez pour rechercher une caserne…" emptyText="Aucune caserne validée ne correspond"
                options={depots.data.filter((d) => !d.draft).map((d) => ({ value: d.id, label: d.name, description: [d.address, d.town].filter(Boolean).join(", ") }))}
                hint={depots.data.length === 0 ? "Ajoutez d'abord une caserne (menu Casernes)." : "Lieu de stationnement du véhicule : obligatoire."} />
            </div>
          </Card>
          <Card>
            <CardHeader title="Téléphone de service" icon={<Smartphone size={18} />} />
            <div className="space-y-3 px-5 pb-5">
              <Input label="Identifiant du téléphone" value={form.deviceId} onChange={(e) => set({ deviceId: e.target.value })} placeholder="Ex. TEL-001 (affiché dans l'application chauffeur)"
                hint="Le chauffeur qui se connecte depuis ce téléphone est relié automatiquement à ce véhicule ; il en est détaché à sa déconnexion." />
              {editing?.driverFullName && <p className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-900">Chauffeur actuellement connecté : <b>{editing.driverFullName}</b></p>}
            </div>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader title="Photo" />
          <div className="px-5 pb-5"><ImageInput value={form.photo} onChange={(photo) => set({ photo })} /></div>
        </Card>
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Link href="/admin/vehicleList" className="btn-secondary">Annuler</Link>
        <SaveButtons isEdit={!!id} saving={saving} onSave={save} />
      </div>
    </form>
  );
}

export default function AddVehiclePage() {
  return <Suspense fallback={<Spinner />}><VehicleForm /></Suspense>;
}
