"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, IdCard, LinkIcon, UserRound } from "lucide-react";
import AuthLayout from "@/components/shell/AuthLayout";
import ImageInput from "@/components/ui/ImageInput";
import Spinner from "@/components/ui/Spinner";
import { auth } from "@/services/auth";
import { notify } from "@/lib/notify";
import { formatDateTime } from "@/lib/format";

function Message({ icon, tone, title, children }) {
  const tones = { green: "bg-brand-50 text-brand-700", amber: "bg-amber-50 text-amber-700", red: "bg-red-50 text-red-700" };
  return (
    <div className="text-center">
      <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${tones[tone]}`}>{icon}</div>
      <h2 className="mt-5 text-xl font-bold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm text-slate-600">{children}</div>
    </div>
  );
}

function Activation() {
  const token = useSearchParams().get("token");
  const [state, setState] = useState(token ? null : { status: "INVALID" });
  const [photo, setPhoto] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    auth.activationStatus(token).then((r) => setState(r.success ? r.data : { status: "ERROR", error: r.error }));
  }, [token]);

  const activate = async () => {
    if (!photo) return notify.warning("Ajoutez votre photo pour activer votre compte");
    setSaving(true);
    const r = await auth.activate(token, photo);
    setSaving(false);
    if (r.success) setDone(true);
    else {
      notify.error(r.error);
      auth.activationStatus(token).then((s) => s.success && setState(s.data));
    }
  };

  const login = <Link href="/connexion" className="btn-primary mt-4 w-full py-3">Se connecter</Link>;
  let content;
  if (!state) content = <div className="flex justify-center py-10"><Spinner size={28} /></div>;
  else if (done) content = (
    <Message icon={<CheckCircle2 size={32} />} tone="green" title="Votre compte a été créé avec succès">
      <p>Votre photo de profil est enregistrée et votre compte chauffeur est maintenant actif.</p>
      <p>Connectez-vous depuis le téléphone de service de votre véhicule avec l'adresse e-mail et le mot de passe reçus par e-mail. Pensez à changer ce mot de passe depuis votre profil.</p>
      {login}
    </Message>
  );
  else if (state.status === "ACTIVATED") content = (
    <Message icon={<CheckCircle2 size={32} />} tone="green" title="Compte déjà activé">
      <p>Ce compte a déjà été activé : vous pouvez vous connecter directement.</p>
      {login}
    </Message>
  );
  else if (state.status === "EXPIRED") content = (
    <Message icon={<Clock3 size={32} />} tone="amber" title="Ce lien d'activation a expiré">
      <p>Les liens d'activation sont valables 24 heures{state.expiresAt ? ` (celui-ci a expiré le ${formatDateTime(state.expiresAt)})` : ""}.</p>
      <p>Contactez votre administrateur : il pourra vous envoyer un nouveau lien, avec un nouveau mot de passe.</p>
    </Message>
  );
  else if (state.status === "VALID") content = (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="flex items-center gap-2 font-semibold"><IdCard size={17} /> Photo de profil obligatoire</p>
        <p className="mt-1.5">Cette photo sert à <b>vous identifier</b> auprès des équipes et des clients lors des collectes. Votre compte <b>ne sera pas activé</b> tant que vous ne l'aurez pas ajoutée.</p>
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-amber-800">
          <li>Photo récente de votre visage, de face et bien éclairée ;</li>
          <li>sans lunettes de soleil ni casquette ;</li>
          <li>pas de photo de groupe.</li>
        </ul>
      </div>
      <div className="mx-auto w-56">
        <ImageInput value={photo} onChange={setPhoto} aspect="aspect-square" label="Prendre ou choisir une photo" hint="Votre visage doit être bien visible" />
      </div>
      <button type="button" className="btn-primary w-full py-3" disabled={!photo || saving} onClick={activate}>
        {saving ? <Spinner /> : <UserRound size={16} />} Activer mon compte
      </button>
      {state.expiresAt && <p className="text-center text-xs text-slate-400">Lien valable jusqu'au {formatDateTime(state.expiresAt)}</p>}
    </div>
  );
  else content = (
    <Message icon={<LinkIcon size={30} />} tone="red" title="Lien d'activation invalide">
      <p>{state.error || "Ce lien est incomplet ou n'est plus valable (un lien plus récent a peut-être été envoyé)."}</p>
      <p>Vérifiez que vous avez ouvert le dernier e-mail reçu, ou contactez votre administrateur.</p>
    </Message>
  );

  return (
    <AuthLayout
      title={state?.status === "VALID" && !done ? `Bienvenue${state.firstName ? `, ${state.firstName}` : ""} !` : "Activation du compte"}
      subtitle={state?.status === "VALID" && !done ? "Dernière étape avant d'utiliser l'application chauffeur : ajoutez votre photo de profil." : null}>
      {content}
    </AuthLayout>
  );
}

export default function ActivationPage() {
  return <Suspense fallback={null}><Activation /></Suspense>;
}
