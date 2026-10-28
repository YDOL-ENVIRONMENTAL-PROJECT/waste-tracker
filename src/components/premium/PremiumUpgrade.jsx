"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, Crown, Loader2, Smartphone, Truck, Wallet } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { ChoiceCards, Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useAsync } from "@/hooks/useAsync";
import { useSession } from "@/components/providers/SessionProvider";
import { premium } from "@/services/premium";
import { notify } from "@/lib/notify";
import { formatFcfa } from "@/lib/format";

const OPERATORS = { ORANGE_MONEY: "Orange Money", MTN_MOMO: "MTN Mobile Money" };

/**
 * Passage au compte premium (frais d'activation par Mobile Money).
 * Phase 1 : paiement simulé, aucun débit ; le compte est activé dès la « confirmation ».
 */
export default function PremiumUpgrade({ onActivated }) {
  const { user, setUser } = useSession();
  const status = useAsync(() => premium.me(), []);
  const fee = status.data?.activationFee ?? 10000;
  const [operator, setOperator] = useState("ORANGE_MONEY");
  const [phone, setPhone] = useState(user?.phone || "");
  const [step, setStep] = useState(null); // null | "confirm" | "done"
  const [receipt, setReceipt] = useState(null);

  const pay = async (e) => {
    e.preventDefault();
    if (!/^(\+?237)?\s*6(\s*\d){8}$/.test(phone.trim())) return notify.warning("Numéro Mobile Money : 9 chiffres commençant par 6");
    setStep("confirm");
    // Simulation du délai de validation sur le téléphone (code secret Mobile Money)
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const r = await premium.activate(operator, phone);
    if (!r.success) {
      setStep(null);
      return notify.error(r.error);
    }
    setReceipt(r.data);
    setStep("done");
  };

  // Le compte passe premium dans la session après la confirmation affichée (sinon l'écran de souscription la remplacerait)
  const finish = () => {
    setStep(null);
    setUser({ ...user, type: "PREMIUM" });
    onActivated?.();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 p-6 text-white">
            <p className="flex items-center gap-2 text-sm font-semibold"><Crown size={16} /> Compte premium</p>
            <h2 className="mt-2 text-2xl font-bold">La collecte à domicile est réservée aux clients premium</h2>
            <p className="mt-2 text-sm text-amber-50">Activez votre compte premium, puis choisissez la fréquence de passage du camion chez vous.</p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-3">
            {[[Truck, "Collecte chez vous", "Un camion dédié vient à votre domicile ou sur votre site"], [CalendarClock, "À votre rythme", "De 1 à 7 passages par semaine, sur demande"], [Wallet, "Prix transparent", "Collectes à 1 000 F CFA par km depuis la caserne"]].map(([Icon, t, d]) => (
              <div key={t} className="rounded-2xl bg-slate-50 p-4"><Icon size={20} className="text-amber-500" /><p className="mt-2 text-sm font-semibold text-slate-900">{t}</p><p className="text-xs text-slate-500">{d}</p></div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="h-fit">
        <CardHeader title="Frais d'activation" subtitle="Paiement unique" icon={<Wallet size={18} />} />
        <form onSubmit={pay} className="space-y-4 px-5 pb-5">
          <div className="flex items-end justify-between rounded-2xl bg-slate-50 p-4">
            <span className="text-sm text-slate-500">Montant</span>
            <span className="font-display text-3xl font-bold text-slate-900">{formatFcfa(fee)}</span>
          </div>
          <div>
            <p className="label">Payer avec</p>
            <ChoiceCards columns={2} value={operator} onChange={setOperator} options={Object.entries(OPERATORS).map(([value, label]) => ({ value, label, description: "Mobile Money" }))} />
          </div>
          <Input label="Numéro Mobile Money" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="6XX XX XX XX" />
          <button className="btn w-full bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-white shadow-sm hover:from-amber-600 hover:to-orange-600">
            <Crown size={16} /> Payer {formatFcfa(fee)}
          </button>
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">Paiement simulé : le paiement Mobile Money sera branché prochainement. Aucun montant n'est débité pour l'instant ; votre compte est activé immédiatement.</p>
        </form>
      </Card>

      <Modal open={!!step} onClose={() => step === "done" && finish()} title={step === "done" ? "Votre compte est premium !" : "Validez le paiement sur votre téléphone"} size="sm"
        footer={step === "done" && <button className="btn-primary w-full" onClick={finish}>Choisir ma collecte à domicile</button>}>
        {step === "confirm" ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <Loader2 size={36} className="animate-spin text-orange-500" />
            <p className="text-sm text-slate-600">{OPERATORS[operator]} · {phone}<br />Une demande de {formatFcfa(fee)} vous est envoyée : confirmez-la avec votre code secret.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 size={44} className="text-brand-600" />
            <p className="text-sm text-slate-600">Paiement de {formatFcfa(receipt?.amount)} reçu.<br />Référence : <b>{receipt?.reference}</b></p>
          </div>
        )}
      </Modal>
    </div>
  );
}
