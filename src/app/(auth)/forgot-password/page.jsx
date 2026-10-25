"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, Mail } from "lucide-react";
import AuthLayout from "@/components/shell/AuthLayout";
import { Input } from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import { auth } from "@/services/auth";
import { notify } from "@/lib/notify";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const r = await auth.forgotPassword(email.trim());
    setLoading(false);
    if (r.success) setSent(true);
    else notify.error(r.error, r.technical);
  };

  return (
    <AuthLayout title="Mot de passe oublié" subtitle="Recevez un lien de réinitialisation par e-mail."
      footer={<Link href="/connexion" className="font-semibold text-brand-700 hover:underline">Retour à la connexion</Link>}>
      {sent ? (
        <div className="rounded-2xl bg-brand-50 p-6 text-center">
          <MailCheck size={32} className="mx-auto text-brand-700" />
          <p className="mt-3 font-semibold text-slate-900">Vérifiez votre boîte mail</p>
          <p className="mt-1 text-sm text-slate-600">Si un compte existe pour <b>{email}</b>, un lien valable 1 heure vient de vous être envoyé.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label="Adresse e-mail" type="email" required icon={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.cm" />
          <button className="btn-primary w-full py-3" disabled={loading}>{loading && <Spinner />} Envoyer le lien</button>
        </form>
      )}
    </AuthLayout>
  );
}
