"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Camera, UserRound } from "lucide-react";
import AuthLayout from "@/components/shell/AuthLayout";
import { ChoiceCards, Input, PasswordInput, Select, passwordError } from "@/components/ui/Field";
import Avatar from "@/components/ui/Avatar";
import Spinner from "@/components/ui/Spinner";
import { auth } from "@/services/auth";
import { compressImage } from "@/lib/image";
import { notify } from "@/lib/notify";
import { TOWNS } from "@/lib/labels";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    accountType: "INDIVIDUAL", firstName: "", lastName: "", dateOfBirth: "", name: "", email: "", phone: "",
    town: "Yaoundé", quarter: "", password: "", confirmPassword: "", profilePicture: "", accept: false,
  });
  const [loading, setLoading] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const enterprise = form.accountType === "ENTERPRISE";
  const pwdErr = passwordError(form.password);

  const next = (e) => {
    e.preventDefault();
    if (enterprise ? !form.name.trim() : !form.firstName.trim() || !form.lastName.trim() || !form.dateOfBirth) {
      return notify.warning(enterprise ? "La raison sociale est requise" : "Prénom, nom et date de naissance sont requis");
    }
    setStep(2);
  };

  const photo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try { set({ profilePicture: await compressImage(file, { maxSize: 400 }) }); } catch (err) { notify.error(err.message); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (pwdErr) return notify.warning(pwdErr);
    if (form.password !== form.confirmPassword) return notify.warning("Les mots de passe ne correspondent pas");
    if (!form.accept) return notify.warning("Veuillez accepter les conditions d'utilisation");
    setLoading(true);
    const r = await auth.register({
      accountType: form.accountType,
      firstName: enterprise ? null : form.firstName, lastName: enterprise ? null : form.lastName,
      dateOfBirth: enterprise ? null : form.dateOfBirth, name: enterprise ? form.name : null,
      email: form.email.trim(), phone: form.phone, town: form.town, quarter: form.quarter,
      password: form.password, profilePicture: form.profilePicture || null,
    });
    setLoading(false);
    if (r.success) {
      notify.success("Bienvenue sur WasteTracker !");
      router.push("/client/dashboard");
    } else notify.error(r.error, r.technical);
  };

  return (
    <AuthLayout wide image="/assets/create-account-image.png" imagePosition="70% center" title="Créer un compte" subtitle={`Étape ${step} sur 2 — ${step === 1 ? "qui êtes-vous ?" : "vos coordonnées"}`}
      footer={<>Déjà inscrit ? <Link href="/connexion" className="font-semibold text-brand-700 hover:underline">Se connecter</Link></>}>
      <div className="mb-6 flex gap-2">{[1, 2].map((s) => <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-brand-600" : "bg-slate-200"}`} />)}</div>
      {step === 1 ? (
        <form onSubmit={next} className="space-y-5">
          <ChoiceCards columns={2} value={form.accountType} onChange={(accountType) => set({ accountType })} options={[
            { value: "INDIVIDUAL", label: "Particulier", description: "Pour votre foyer", icon: <UserRound size={16} /> },
            { value: "ENTERPRISE", label: "Entreprise", description: "Commerce, bureau, institution", icon: <Building2 size={16} /> },
          ]} />
          <div className="flex items-center gap-4">
            <label className="group relative cursor-pointer">
              <Avatar person={enterprise ? { name: form.name } : form} src={form.profilePicture} size="lg" />
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-600 shadow ring-1 ring-slate-200"><Camera size={13} /></span>
              <input type="file" accept="image/*" className="hidden" onChange={photo} />
            </label>
            <p className="text-xs text-slate-500">Photo ou logo (facultatif)</p>
          </div>
          {enterprise ? (
            <Input label="Raison sociale" required value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ex. Boulangerie du Centre" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Prénom" required value={form.firstName} onChange={(e) => set({ firstName: e.target.value })} />
              <Input label="Nom" required value={form.lastName} onChange={(e) => set({ lastName: e.target.value })} />
              <Input className="sm:col-span-2" label="Date de naissance" type="date" required max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth} onChange={(e) => set({ dateOfBirth: e.target.value })} />
            </div>
          )}
          <button className="btn-primary w-full py-3">Continuer <ArrowRight size={16} /></button>
        </form>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Adresse e-mail" type="email" required autoComplete="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
            <Input label="Téléphone" type="tel" required value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="6XX XX XX XX" />
            <Select label="Ville" required value={form.town} onChange={(e) => set({ town: e.target.value })} options={Object.keys(TOWNS).map((t) => ({ value: t, label: t }))} />
            <div>
              <Input label="Quartier" required list="reg-quarters" value={form.quarter} onChange={(e) => set({ quarter: e.target.value })} hint="Pour être prévenu des collectes" />
              <datalist id="reg-quarters">{(TOWNS[form.town] || []).map((q) => <option key={q} value={q} />)}</datalist>
            </div>
            <PasswordInput label="Mot de passe" required autoComplete="new-password" value={form.password} onChange={(e) => set({ password: e.target.value })} error={form.password && pwdErr} hint="8 caractères minimum, avec une lettre et un chiffre" />
            <PasswordInput label="Confirmation" required autoComplete="new-password" value={form.confirmPassword} onChange={(e) => set({ confirmPassword: e.target.value })} error={form.confirmPassword && form.confirmPassword !== form.password ? "Ne correspond pas" : null} />
          </div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-600">
            <input type="checkbox" checked={form.accept} onChange={(e) => set({ accept: e.target.checked })} className="mt-0.5 h-4 w-4 accent-brand-600" />
            J'accepte que mes données (coordonnées, position, photos de signalement) soient utilisées pour la gestion de la collecte des déchets.
          </label>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={() => setStep(1)}><ArrowLeft size={16} /></button>
            <button className="btn-primary flex-1 py-3" disabled={loading}>{loading && <Spinner />} Créer mon compte</button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
