"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, Smartphone } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, PasswordInput, passwordError } from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import { drivers as driverService } from "@/services/driver";
import { notify } from "@/lib/notify";
import { TOWNS } from "@/lib/labels";

function generatePassword() {
  const letters = "abcdefghjkmnpqrstuvwxyz";
  const pick = (s) => s[Math.floor(Math.random() * s.length)];
  return `${pick(letters).toUpperCase()}${Array.from({ length: 5 }, () => pick(letters)).join("")}${Math.floor(10 + Math.random() * 89)}`;
}

function DriverForm() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", town: "Yaoundé", quarter: "", site: "", dateOfBirth: "", password: id ? "" : generatePassword() });
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
    if ((!id || form.password) && pwdError) return notify.warning(pwdError);
    setSaving(true);
    const payload = { ...form, dateOfBirth: form.dateOfBirth || null, password: form.password || null };
    const r = id ? await driverService.update(id, payload) : await driverService.create(payload);
    setSaving(false);
    if (r.success) {
      notify.success(id ? "Chauffeur mis à jour" : `Compte créé : communiquez le mot de passe provisoire à ${form.firstName}`);
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
            <div>
              <PasswordInput label={id ? "Nouveau mot de passe (facultatif)" : "Mot de passe provisoire"} required={!id} value={form.password} onChange={(e) => set({ password: e.target.value })} error={form.password && pwdError} hint="Au moins 8 caractères, dont une lettre et un chiffre" />
              <button type="button" className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline" onClick={() => set({ password: generatePassword() })}><KeyRound size={13} /> Générer un mot de passe</button>
            </div>
            {!id && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">Notez ce mot de passe et remettez-le au chauffeur : il pourra le modifier depuis son profil.</p>}
          </div>
        </Card>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Link href="/admin/driverList" className="btn-secondary">Annuler</Link>
        <button className="btn-primary" disabled={saving}>{saving && <Spinner />} {id ? "Enregistrer" : "Créer le compte"}</button>
      </div>
    </form>
  );
}

export default function AddDriverPage() {
  return <Suspense fallback={<Spinner />}><DriverForm /></Suspense>;
}
