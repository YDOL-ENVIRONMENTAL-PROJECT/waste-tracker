"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, ShieldPlus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { ChoiceCards, Input, PasswordInput, passwordError } from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import { useSession } from "@/components/providers/SessionProvider";
import { admins as adminService } from "@/services/admin";
import { notify } from "@/lib/notify";

export default function AddAdminPage() {
  const router = useRouter();
  const { user } = useSession();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", site: "", role: "ADMIN", password: "" });
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const pwdError = passwordError(form.password);

  if (user?.role !== "SUPER_ADMIN") {
    return <Card className="p-8 text-center text-sm text-slate-600">Cette page est réservée au super administrateur.</Card>;
  }

  const submit = async (e) => {
    e.preventDefault();
    if (pwdError) return notify.warning(pwdError);
    setSaving(true);
    const r = await adminService.create(form);
    setSaving(false);
    if (r.success) { notify.success("Administrateur ajouté"); router.push("/admin/adminList"); } else notify.error(r.error);
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl">
      <PageHeader title="Ajouter un administrateur" actions={<Link href="/admin/adminList" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>} />
      <Card>
        <CardHeader title="Identité et accès" />
        <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
          <Input label="Prénom" required value={form.firstName} onChange={(e) => set({ firstName: e.target.value })} />
          <Input label="Nom" required value={form.lastName} onChange={(e) => set({ lastName: e.target.value })} />
          <Input label="E-mail" type="email" required value={form.email} onChange={(e) => set({ email: e.target.value })} />
          <Input label="Téléphone" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
          <Input className="sm:col-span-2" label="Site" value={form.site} onChange={(e) => set({ site: e.target.value })} placeholder="Ex. Yaoundé" />
          <div className="sm:col-span-2">
            <p className="label">Rôle</p>
            <ChoiceCards columns={2} value={form.role} onChange={(role) => set({ role })} options={[
              { value: "ADMIN", label: "Administrateur", description: "Pilote les opérations de collecte", icon: <ShieldCheck size={16} /> },
              { value: "SUPER_ADMIN", label: "Super administrateur", description: "Gère aussi les administrateurs", icon: <ShieldPlus size={16} /> },
            ]} />
          </div>
          <PasswordInput className="sm:col-span-2" label="Mot de passe provisoire" required value={form.password} onChange={(e) => set({ password: e.target.value })} error={form.password && pwdError} hint="Au moins 8 caractères, dont une lettre et un chiffre" />
        </div>
      </Card>
      <div className="mt-6 flex justify-end gap-2">
        <Link href="/admin/adminList" className="btn-secondary">Annuler</Link>
        <button className="btn-primary" disabled={saving}>{saving && <Spinner />} Créer le compte</button>
      </div>
    </form>
  );
}
