"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, KeyRound, Trash2, UserRound } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input, PasswordInput, passwordError } from "@/components/ui/Field";
import Avatar from "@/components/ui/Avatar";
import Spinner from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { useSession } from "@/components/providers/SessionProvider";
import { fetchCurrentUserProfile, updateProfile } from "@/services/user";
import { auth } from "@/services/auth";
import { compressImage } from "@/lib/image";
import { notify } from "@/lib/notify";
import { fullName } from "@/lib/format";
import { CLIENT_TYPE, ROLE, TOWNS } from "@/lib/labels";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, signOut } = useSession();
  const isClient = user?.role === "CLIENT";
  const isEnterprise = user?.accountType === "ENTERPRISE";
  const [form, setForm] = useState({
    firstName: user?.firstName || "", lastName: user?.lastName || "", name: user?.name || "", email: user?.email || "",
    phone: user?.phone || "", town: user?.town || "", quarter: user?.quarter || "", site: user?.site || "",
  });
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePwd, setDeletePwd] = useState("");
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Profil modifié depuis un autre appareil (application mobile) : le formulaire reprend les nouvelles valeurs
  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName || "", lastName: user.lastName || "", name: user.name || "", email: user.email || "",
      phone: user.phone || "", town: user.town || "", quarter: user.quarter || "", site: user.site || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.profileVersion]);

  const save = async (patch) => {
    setSaving(true);
    const emailChanged = patch.email && patch.email.toLowerCase() !== user.email;
    // expectedProfileVersion : le serveur refuse (409) si le profil a changé ailleurs depuis son chargement
    const r = await updateProfile({ ...patch, expectedProfileVersion: user.profileVersion });
    setSaving(false);
    if (!r.success) {
      notify.error(r.error);
      if (r.status === 409) {
        const fresh = await fetchCurrentUserProfile();
        if (fresh.success) setUser(fresh.data);
      }
      return;
    }
    setUser(r.data);
    if (emailChanged) {
      notify.success("Adresse e-mail modifiée : reconnectez-vous avec votre nouvelle adresse");
      await signOut();
    } else notify.success("Profil mis à jour");
  };

  const changePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await save({ profilePicture: await compressImage(file, { maxSize: 400 }) });
    } catch (err) {
      notify.error(err.message);
    }
  };

  const pwdErr = passwordError(pwd.newPassword);
  const changePassword = async (e) => {
    e.preventDefault();
    if (pwdErr) return notify.warning(pwdErr);
    if (pwd.newPassword !== pwd.confirm) return notify.warning("Les deux mots de passe ne correspondent pas");
    setChangingPwd(true);
    const r = await auth.updatePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
    setChangingPwd(false);
    if (r.success) { notify.success("Mot de passe modifié"); setPwd({ currentPassword: "", newPassword: "", confirm: "" }); } else notify.error(r.error);
  };

  const deleteAccount = async () => {
    const r = await auth.deleteAccount(deletePwd);
    if (r.success) { notify.success("Votre compte a été supprimé"); router.replace("/"); } else notify.error(r.error);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Mon profil" subtitle="Vos informations personnelles et la sécurité de votre compte." />
      <Card className="mb-6 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-900" />
        <div className="-mt-12 flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <label className="group relative w-fit cursor-pointer">
            <Avatar person={user} size="xl" className="ring-4 ring-white rounded-full" />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition group-hover:opacity-100"><Camera size={22} /></span>
            <input type="file" accept="image/*" className="hidden" onChange={changePhoto} />
          </label>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">{fullName(user)}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Badge tone={ROLE[user?.role]?.tone}>{ROLE[user?.role]?.label}</Badge>
            {isClient && <Badge tone={CLIENT_TYPE[user?.type]?.tone}>{CLIENT_TYPE[user?.type]?.label}</Badge>}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Informations personnelles" icon={<UserRound size={18} />} />
          <form onSubmit={(e) => { e.preventDefault(); save(form); }} className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
            {isEnterprise ? (
              <Input className="sm:col-span-2" label="Raison sociale" value={form.name} onChange={(e) => set({ name: e.target.value })} />
            ) : (
              <>
                <Input label="Prénom" value={form.firstName} onChange={(e) => set({ firstName: e.target.value })} />
                <Input label="Nom" value={form.lastName} onChange={(e) => set({ lastName: e.target.value })} />
              </>
            )}
            <Input label="E-mail" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
            <Input label="Téléphone" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
            {isClient ? (
              <>
                <Input label="Ville" list="p-towns" value={form.town} onChange={(e) => set({ town: e.target.value })} />
                <Input label="Quartier" list="p-quarters" value={form.quarter} onChange={(e) => set({ quarter: e.target.value })} hint="Sert à vous prévenir des tournées dans votre quartier" />
                <datalist id="p-towns">{Object.keys(TOWNS).map((t) => <option key={t} value={t} />)}</datalist>
                <datalist id="p-quarters">{(TOWNS[form.town] || []).map((q) => <option key={q} value={q} />)}</datalist>
              </>
            ) : (
              <Input className="sm:col-span-2" label="Site" value={form.site} onChange={(e) => set({ site: e.target.value })} />
            )}
            <div className="sm:col-span-2 flex justify-end">
              <button className="btn-primary" disabled={saving}>{saving && <Spinner />} Enregistrer</button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Mot de passe" icon={<KeyRound size={18} />} />
            <form onSubmit={changePassword} className="space-y-3 px-5 pb-5">
              <PasswordInput label="Mot de passe actuel" required value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} />
              <PasswordInput label="Nouveau mot de passe" required value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} error={pwd.newPassword && pwdErr} hint="8 caractères minimum, avec une lettre et un chiffre" />
              <PasswordInput label="Confirmation" required value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} error={pwd.confirm && pwd.confirm !== pwd.newPassword ? "Ne correspond pas" : null} />
              <button className="btn-secondary w-full" disabled={changingPwd}>{changingPwd && <Spinner />} Modifier le mot de passe</button>
            </form>
          </Card>
          {isClient && (
            <Card className="border-red-100">
              <CardHeader title="Supprimer mon compte" subtitle="Vos données personnelles seront anonymisées." icon={<Trash2 size={18} />} />
              <div className="px-5 pb-5"><button className="btn-danger-soft w-full" onClick={() => setDeleteOpen(true)}>Supprimer mon compte</button></div>
            </Card>
          )}
        </div>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Supprimer définitivement mon compte" size="sm"
        footer={<><button className="btn-secondary" onClick={() => setDeleteOpen(false)}>Annuler</button><button className="btn-danger" disabled={!deletePwd} onClick={deleteAccount}>Supprimer</button></>}>
        <p className="mb-4 text-sm text-slate-600">Cette action est irréversible. Votre nom, téléphone, photo et position seront effacés ; votre abonnement éventuel ne sera pas remboursé.</p>
        <PasswordInput label="Confirmez avec votre mot de passe" value={deletePwd} onChange={(e) => setDeletePwd(e.target.value)} />
      </Modal>
    </div>
  );
}
