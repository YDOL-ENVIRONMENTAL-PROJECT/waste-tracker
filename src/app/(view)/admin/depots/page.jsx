"use client";

import { useState } from "react";
import { Archive, Building2, MapPin, Pencil, Plus, Truck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import EmptyState, { ErrorState } from "@/components/ui/EmptyState";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import { LeafletMap, MapPicker } from "@/components/map";
import { useAction, useAsync } from "@/hooks/useAsync";
import { depots as depotService } from "@/services/depot";
import { notify } from "@/lib/notify";

const EMPTY = { name: "", address: "", town: "Yaoundé", capacity: "", position: null };

export default function DepotsPage() {
  const list = useAsync(() => depotService.getAll(), [], { initial: [] });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [archiving, setArchiving] = useState(null);
  const [pending, run] = useAction();
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const open = (d) => {
    setEditing(d || "new");
    setForm(d ? { name: d.name, address: d.address || "", town: d.town || "", capacity: d.capacity ?? "", position: { latitude: d.latitude, longitude: d.longitude } } : EMPTY);
  };

  const save = () => run(async () => {
    if (!form.name.trim() || !form.position) return notify.warning("Indiquez le nom et placez la caserne sur la carte");
    const payload = { name: form.name, address: form.address, town: form.town, capacity: form.capacity ? Number(form.capacity) : null, latitude: form.position.latitude, longitude: form.position.longitude };
    const r = editing === "new" ? await depotService.create(payload) : await depotService.update(editing.id, payload);
    if (r.success) { notify.success("Caserne enregistrée"); setEditing(null); list.reload({ silent: true }); } else notify.error(r.error);
  });

  return (
    <div>
      <PageHeader
        title="Casernes"
        subtitle="Sites de stationnement des véhicules. Ils servent de point de départ des missions et au calcul du prix des abonnements premium."
        actions={<button className="btn-primary" onClick={() => open(null)}><Plus size={16} /> Ajouter une caserne</button>}
      />
      {list.loading ? <CardsSkeleton count={3} /> : list.error ? <ErrorState message={list.error} onRetry={list.reload} /> : list.data.length === 0 ? (
        <Card><EmptyState icon={<Building2 size={26} />} title="Aucune caserne" description="Ajoutez au moins une caserne : sans elle, le prix des abonnements premium ne peut pas être calculé." action={<button className="btn-primary" onClick={() => open(null)}><Plus size={16} /> Ajouter une caserne</button>} /></Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <div className="space-y-3">
            {list.data.map((d) => (
              <Card key={d.id} className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white"><Building2 size={22} /></div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{d.name}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-slate-500"><MapPin size={12} />{[d.address, d.town].filter(Boolean).join(", ") || "—"}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><Truck size={12} />{d.vehicleCount} véhicule(s){d.capacity ? ` / ${d.capacity} places` : ""}</p>
                </div>
                <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => open(d)} title="Modifier"><Pencil size={16} /></button>
                <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => setArchiving(d)} title="Archiver"><Archive size={16} /></button>
              </Card>
            ))}
          </div>
          <Card className="h-[480px] overflow-hidden">
            <LeafletMap markers={list.data.map((d) => ({ id: d.id, position: [d.latitude, d.longitude], kind: "depot", color: "dark", popup: <b>{d.name}</b> }))} />
          </Card>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Nouvelle caserne" : "Modifier la caserne"} size="lg"
        footer={<><button className="btn-secondary" onClick={() => setEditing(null)}>Annuler</button><button className="btn-primary" onClick={save} disabled={pending}>{pending && <Spinner />} Enregistrer</button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nom" required value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Caserne de Mvan" />
          <Input label="Ville" value={form.town} onChange={(e) => set({ town: e.target.value })} />
          <Input label="Adresse" value={form.address} onChange={(e) => set({ address: e.target.value })} />
          <Input label="Capacité (véhicules)" type="number" min="0" value={form.capacity} onChange={(e) => set({ capacity: e.target.value })} />
          <div className="sm:col-span-2"><MapPicker value={form.position} onChange={(position) => set({ position })} kind="depot" height={300} /></div>
        </div>
      </Modal>

      <ConfirmDialog open={!!archiving} onClose={() => setArchiving(null)} danger pending={pending} title="Archiver cette caserne ?" confirmLabel="Archiver"
        message={`${archiving?.name} ne sera plus utilisée pour le calcul des prix premium.`}
        onConfirm={() => run(async () => {
          const r = await depotService.archive(archiving.id);
          if (r.success) { notify.success("Caserne archivée"); setArchiving(null); list.reload({ silent: true }); } else notify.error(r.error);
        })} />
    </div>
  );
}
