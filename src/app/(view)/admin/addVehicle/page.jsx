"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import ImageInput from "@/components/ui/ImageInput";
import Spinner from "@/components/ui/Spinner";
import { useAsync } from "@/hooks/useAsync";
import { vehicles as vehicleService } from "@/services/vehicle";
import { drivers as driverService } from "@/services/driver";
import { depots as depotService } from "@/services/depot";
import { notify } from "@/lib/notify";
import { VEHICLE_STATUS } from "@/lib/labels";

function VehicleForm() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const drivers = useAsync(() => driverService.getAll(), [], { initial: [] });
  const depots = useAsync(() => depotService.getAll(), [], { initial: [] });
  const fleet = useAsync(() => vehicleService.getAll(), [], { initial: [] });
  const [form, setForm] = useState({ immatriculation: "", name: "", brand: "", modele: "", maxCapacity: "", photo: "", driverId: "", depotId: "", status: "AVAILABLE" });
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const editing = id ? fleet.data.find((v) => v.id === id) : null;
  useEffect(() => {
    if (editing) {
      setForm({
        immatriculation: editing.immatriculation, name: editing.name || "", brand: editing.brand || "", modele: editing.modele || "",
        maxCapacity: editing.maxCapacity || "", photo: editing.photo || "", driverId: editing.driverId || "", depotId: editing.depotId || "", status: editing.status,
      });
    }
  }, [editing?.id]);

  const depot = depots.data.find((d) => d.id === form.depotId);
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      immatriculation: form.immatriculation, name: form.name || null, brand: form.brand || null, modele: form.modele || null,
      maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : null, photo: form.photo || null,
      driverId: form.driverId || null, depotId: form.depotId || null, status: form.status,
      // Un nouveau véhicule démarre à sa caserne tant que l'application chauffeur n'a pas transmis de position.
      ...(!id && depot ? { latitude: depot.latitude, longitude: depot.longitude } : {}),
    };
    const r = id ? await vehicleService.update(id, payload) : await vehicleService.create(payload);
    setSaving(false);
    if (r.success) { notify.success(id ? "Véhicule mis à jour" : "Véhicule ajouté"); router.push("/admin/vehicleList"); } else notify.error(r.error);
  };

  if (id && fleet.loading) return <Spinner />;
  const busyDrivers = new Map(fleet.data.filter((v) => v.driverId && v.id !== id).map((v) => [v.driverId, v.immatriculation]));

  return (
    <form onSubmit={submit}>
      <PageHeader title={id ? `Modifier ${form.immatriculation}` : "Ajouter un véhicule"} actions={<Link href="/admin/vehicleList" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Caractéristiques" />
          <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
            <Input label="Immatriculation" required value={form.immatriculation} onChange={(e) => set({ immatriculation: e.target.value.toUpperCase() })} placeholder="LT-123-AB" />
            <Input label="Nom d'usage" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Benne 01" />
            <Input label="Marque" value={form.brand} onChange={(e) => set({ brand: e.target.value })} placeholder="Renault" />
            <Input label="Modèle" value={form.modele} onChange={(e) => set({ modele: e.target.value })} placeholder="D-Wide" />
            <Input label="Capacité maximale (tonnes)" type="number" step="0.1" min="0" value={form.maxCapacity} onChange={(e) => set({ maxCapacity: e.target.value })} />
            <Select label="Statut" value={form.status} onChange={(e) => set({ status: e.target.value })} options={["AVAILABLE", "SLEEPING", "BROKEN_DOWN", "OUT_OF_SERVICE"].map((s) => ({ value: s, label: VEHICLE_STATUS[s].label }))} />
            <Select label="Caserne de rattachement" value={form.depotId} onChange={(e) => set({ depotId: e.target.value })} placeholder="— Aucune —" options={depots.data.map((d) => ({ value: d.id, label: d.name }))}
              hint={depots.data.length === 0 ? "Ajoutez d'abord une caserne (menu Casernes)." : null} />
            <Select label="Chauffeur affecté" value={form.driverId} onChange={(e) => set({ driverId: e.target.value })} placeholder="— Aucun —"
              options={drivers.data.map((d) => ({ value: d.id, label: `${d.firstName} ${d.lastName}${busyDrivers.has(d.id) ? ` (actuellement sur ${busyDrivers.get(d.id)})` : ""}` }))}
              hint="Un chauffeur n'est associé qu'à un véhicule à la fois." />
          </div>
        </Card>
        <Card className="h-fit">
          <CardHeader title="Photo" />
          <div className="px-5 pb-5"><ImageInput value={form.photo} onChange={(photo) => set({ photo })} /></div>
        </Card>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Link href="/admin/vehicleList" className="btn-secondary">Annuler</Link>
        <button className="btn-primary" disabled={saving}>{saving && <Spinner />} {id ? "Enregistrer" : "Ajouter le véhicule"}</button>
      </div>
    </form>
  );
}

export default function AddVehiclePage() {
  return <Suspense fallback={<Spinner />}><VehicleForm /></Suspense>;
}
