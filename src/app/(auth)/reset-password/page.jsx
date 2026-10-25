"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/shell/AuthLayout";
import { PasswordInput, passwordError } from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import { auth } from "@/services/auth";
import { notify } from "@/lib/notify";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const err = passwordError(form.password);

  const submit = async (e) => {
    e.preventDefault();
    if (err) return notify.warning(err);
    if (form.password !== form.confirm) return notify.warning("Les mots de passe ne correspondent pas");
    setLoading(true);
    const r = await auth.resetPassword(token, form.password, form.confirm);
    setLoading(false);
    if (r.success) { notify.success("Mot de passe modifié, vous pouvez vous connecter"); router.push("/connexion"); } else notify.error(r.error, r.technical);
  };

  return (
    <AuthLayout title="Nouveau mot de passe" subtitle="Choisissez un mot de passe que vous n'utilisez nulle part ailleurs."
      footer={<Link href="/connexion" className="font-semibold text-brand-700 hover:underline">Retour à la connexion</Link>}>
      {!token ? (
        <p className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">Ce lien est incomplet. <Link href="/forgot-password" className="font-semibold underline">Demandez un nouveau lien</Link>.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <PasswordInput label="Nouveau mot de passe" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={form.password && err} hint="8 caractères minimum, avec une lettre et un chiffre" />
          <PasswordInput label="Confirmation" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} error={form.confirm && form.confirm !== form.password ? "Ne correspond pas" : null} />
          <button className="btn-primary w-full py-3" disabled={loading}>{loading && <Spinner />} Réinitialiser</button>
        </form>
      )}
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetForm /></Suspense>;
}
