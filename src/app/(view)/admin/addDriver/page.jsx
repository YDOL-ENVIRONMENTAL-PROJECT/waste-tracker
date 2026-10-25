"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MailCheck, Smartphone } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, PasswordInput, passwordError } from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import { drivers as driverService } from "@/services/driver";
import { notify } from "@/lib/notify";
import { TOWNS } from "@/lib/labels";

function DriverForm() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", town: "Yaoundé", quarter: "", site: "", dateOfBirth: "", password: "" });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    if (!id) return;
    driverService.getById(id).then((r) => {
      if (r.success) {
        const d = r.data;
        setForm({ firstName: d.firstName || "", lastName: d.lastName || "", email: d.email || "", phone: d.phone || "", town: d.town || "", quarter: d.quarter || "", site: d.site || "", dateOfBirth: d.dateOfBirth || "", password: "" });
      } else notify.error(r.error);
      setLoading(false);
    });
  }, [id]);

  const pwdError = passwordError(form.password);
  const submit = async (e) => {
    e.preventDefault();
    if (id && form.password && pwdError) return notify.warning(pwdError);
    setSaving(true);
    const payload = { ...form, dateOfBirth: form.dateOfBirth || null, password: id ? form.password || null : null };
    const r = id ? await driverService.update(id, payload) : await driverService.create(payload);
    setSaving(false);
    if (r.success) {
      notify.success(id ? "Chauffeur mis à jour" : `Compte créé : un e-mail d'activation a été envoyé à ${r.data.email}`);
      router.push("/admin/driverList");
    } else notify.error(r.error);
  };

  if (loading) return <Spinner />;
  return (
    <form onSubmit={submit}>
      <PageHeader title={id ? "Modifier le chauffeur" : "Ajouter un chauffeur"} actions={<Link href="/admin/driverList" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>} />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader title="Informations personnelles" />
          <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
            <Input label="Prénom" required value={form.firstName} onChange={(e) => set({ firstName: e.target.value })} />
            <Input label="Nom" required value={form.lastName} onChange={(e) => set({ lastName: e.target.value })} />
            <Input label="Téléphone" type="tel" required value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="6XX XX XX XX" />
            <Input label="Date de naissance" type="date" value={form.dateOfBirth} onChange={(e) => set({ dateOfBirth: e.target.value })} />
            <Input label="Ville" list="towns" value={form.town} onChange={(e) => set({ town: e.target.value })} />
            <Input label="Quartier" value={form.quarter} onChange={(e) => set({ quarter: e.target.value })} />
            <Input className="sm:col-span-2" label="Site d'affectation" value={form.site} onChange={(e) => set({ site: e.target.value })} placeholder="Ex. Caserne de Mvan" />
            <datalist id="towns">{Object.keys(TOWNS).map((t) => <option key={t} value={t} />)}</datalist>
          </div>
        </Card>
        <Card className="h-fit">
          <CardHeader title="Accès à l'application mobile" icon={<Smartphone size={18} />} />
          <div className="space-y-4 px-5 pb-5">
            <Input label="Adresse e-mail (identifiant)" type="email" required value={form.email} onChange={(e) => set({ email: e.target.value })} />
            {id ? (
              <PasswordInput label="Nouveau mot de passe (facultatif)" value={form.password} onChange={(e) => set({ password: e.target.value })} error={form.password && pwdError} hint="Au moins 8 caractères, dont une lettre et un chiffre" />
            ) : (
              <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-900">
                <p className="flex items-center gap-2 font-semibold"><MailCheck size={16} /> Activation par e-mail</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px]">
                  <li>Un mot de passe est généré automatiquement et envoyé au chauffeur avec un lien d'activation valable 24 h.</li>
                  <li>En ouvrant le lien, il ajoute sa photo de profil (obligatoire) : le compte est alors activé.</li>
                  <li>Il se connecte ensuite depuis le téléphone de service : il est relié automatiquement au véhicule.</li>
                </ul>
              </div>
            )}
          </div>
        </Card>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Link href="/admin/driverList" className="btn-secondary">Annuler</Link>
        <button className="btn-primary" disabled={saving}>{saving && <Spinner />} {id ? "Enregistrer" : "Créer et envoyer le lien"}</button>
      </div>
    </form>
  );
}

export default function AddDriverPage() {
  return <Suspense fallback={<Spinner />}><DriverForm /></Suspense>;
}
