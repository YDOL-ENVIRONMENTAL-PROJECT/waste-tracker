"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Mail } from "lucide-react";
import AuthLayout from "@/components/shell/AuthLayout";
import { Input, PasswordInput } from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import { auth } from "@/services/auth";
import { notify } from "@/lib/notify";
import { homeFor } from "@/components/providers/SessionProvider";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("rememberEmail");
      if (saved) { setForm((f) => ({ ...f, email: saved })); setRemember(true); }
    } catch { /* stockage indisponible */ }
    if (params.get("expired")) notify.info("Votre session a expiré, reconnectez-vous.");
  }, [params]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const r = await auth.login(form.email.trim(), form.password);
    setLoading(false);
    if (!r.success) return notify.error(r.error, r.technical);
    try {
      if (remember) localStorage.setItem("rememberEmail", form.email.trim());
      else localStorage.removeItem("rememberEmail");
    } catch { /* ignoré */ }
    const redirect = params.get("redirect");
    const home = homeFor(r.data.role);
    const allowed = redirect && redirect.startsWith(home.split("/").slice(0, 2).join("/"));
    router.push(allowed ? redirect : home);
  };

  return (
    <AuthLayout title="Bon retour 👋" subtitle="Connectez-vous à votre espace WasteTracker."
      footer={<>Pas encore de compte ? <Link href="/inscription" className="font-semibold text-brand-700 hover:underline">Créer un compte</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Adresse e-mail" type="email" required autoComplete="email" icon={<Mail size={16} />} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vous@exemple.cm" />
        <PasswordInput label="Mot de passe" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-600">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-brand-600" /> Se souvenir de moi
          </label>
          <Link href="/forgot-password" className="font-medium text-brand-700 hover:underline">Mot de passe oublié ?</Link>
        </div>
        <button className="btn-primary w-full py-3" disabled={loading}>{loading ? <Spinner /> : <LogIn size={16} />} Se connecter</button>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
