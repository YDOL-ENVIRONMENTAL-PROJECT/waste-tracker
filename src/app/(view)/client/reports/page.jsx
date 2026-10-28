"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, LocateFixed, MapPin, Megaphone, Send } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Field";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import ImageInput from "@/components/ui/ImageInput";
import Spinner from "@/components/ui/Spinner";
import { MapPicker } from "@/components/map";
import { useAsync } from "@/hooks/useAsync";
import { useSyncEffect } from "@/components/providers/SyncProvider";
import { reports as reportService } from "@/services/report";
import { garbagebins } from "@/services/garbagebin";
import { currentPosition } from "@/lib/image";
import { notify } from "@/lib/notify";
import { timeAgo } from "@/lib/format";
import { BIN_STATUS, REPORT_STATUS, REPORT_TYPE } from "@/lib/labels";

const TYPES = ["FULL_BIN", "OVERFLOW", "DAMAGED_BIN", "ILLEGAL_DUMP"];
const NEEDS_BIN = ["FULL_BIN", "OVERFLOW", "DAMAGED_BIN"];

function ReportForm() {
  const params = useSearchParams();
  const mine = useAsync(() => reportService.mine(), [], { initial: [], sync: ["reports"] });
  const [type, setType] = useState("FULL_BIN");
  const [position, setPosition] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [binId, setBinId] = useState(params.get("bin") || "");
  const [photo, setPhoto] = useState("");
  const [comment, setComment] = useState("");
  const [locating, setLocating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const locate = async () => {
    setLocating(true);
    try {
      const pos = await currentPosition();
      setPosition(pos);
    } catch (e) {
      notify.error(e.message);
    } finally {
      setLocating(false);
    }
  };

  // Bacs à proximité de la position choisie
  useEffect(() => {
    if (!position) return;
    garbagebins.nearby(position.latitude, position.longitude, 1500).then((r) => {
      if (r.success) {
        setNearby(r.data);
        if (!binId && r.data[0]) setBinId(r.data[0].id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position?.latitude, position?.longitude]);

  useSyncEffect(["bins"], () => {
    if (position) garbagebins.nearby(position.latitude, position.longitude, 1500).then((r) => r.success && setNearby(r.data));
  });

  // Bac passé en paramètre (depuis la carte) : on se positionne dessus
  useEffect(() => {
    const id = params.get("bin");
    if (!id) return;
    garbagebins.getById(id).then((r) => r.success && setPosition({ latitude: r.data.latitude, longitude: r.data.longitude }));
  }, [params]);

  const submit = async (e) => {
    e.preventDefault();
    if (NEEDS_BIN.includes(type) && !binId) return notify.warning("Sélectionnez le bac concerné");
    if (type === "ILLEGAL_DUMP" && (!position || !photo)) return notify.warning("Une photo et la position sont nécessaires pour un dépôt sauvage");
    setSending(true);
    const r = await reportService.create({
      type, binId: NEEDS_BIN.includes(type) ? binId : null, photo: photo || null, comment: comment || null,
      latitude: position?.latitude ?? null, longitude: position?.longitude ?? null,
    });
    setSending(false);
    if (r.success) {
      setSent(true);
      setPhoto("");
      setComment("");
      mine.reload({ silent: true });
    } else notify.error(r.error);
  };

  return (
    <div>
      <PageHeader title="Signaler" subtitle="Un bac plein, abîmé, ou des déchets abandonnés ? Prévenez la tour de contrôle." />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {sent ? (
          <Card className="flex flex-col items-center justify-center p-10 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700"><Check size={32} /></div>
            <h2 className="text-xl font-bold text-slate-900">Merci pour votre signalement !</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-600">La tour de contrôle a été prévenue. Vous serez notifié dès sa prise en charge, puis de sa résolution.</p>
            <button className="btn-primary mt-6" onClick={() => setSent(false)}>Faire un autre signalement</button>
          </Card>
        ) : (
          <Card>
            <form onSubmit={submit}>
              <CardHeader title="1. Que se passe-t-il ?" />
              <div className="grid grid-cols-2 gap-2.5 px-5 sm:grid-cols-4">
                {TYPES.map((t) => (
                  <button type="button" key={t} onClick={() => setType(t)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition ${type === t ? "border-brand-500 bg-brand-50 ring-4 ring-brand-500/10" : "border-slate-200 hover:border-slate-300"}`}>
                    <span className="text-2xl">{REPORT_TYPE[t].emoji}</span>
                    <span className="text-xs font-semibold text-slate-700">{REPORT_TYPE[t].label}</span>
                  </button>
                ))}
              </div>

              <CardHeader title="2. Où ?" />
              <div className="space-y-3 px-5">
                <button type="button" className="btn-secondary w-full" onClick={locate} disabled={locating}>
                  {locating ? <Spinner /> : <LocateFixed size={16} />} Utiliser ma position actuelle
                </button>
                <MapPicker value={position} onChange={setPosition} height={240} kind={type === "ILLEGAL_DUMP" ? "alert" : "pin"}
                  extraMarkers={nearby.map((b) => ({ id: b.id, position: [b.latitude, b.longitude], kind: "bin", color: b.id === binId ? "blue" : b.status === "FULL" ? "red" : "green", onClick: () => setBinId(b.id) }))} />
                {NEEDS_BIN.includes(type) && (
                  <div>
                    <p className="label">Bac concerné <span className="text-red-500">*</span></p>
                    {nearby.length === 0 ? (
                      <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">{position ? "Aucun bac répertorié à moins de 1,5 km. Déplacez le point sur la carte." : "Indiquez votre position pour voir les bacs proches."}</p>
                    ) : (
                      <div className="max-h-52 space-y-1.5 overflow-y-auto">
                        {nearby.map((b) => (
                          <button type="button" key={b.id} onClick={() => setBinId(b.id)}
                            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${binId === b.id ? "border-brand-500 bg-brand-50/60" : "border-slate-200 hover:border-slate-300"}`}>
                            <MapPin size={16} className="text-slate-400" />
                            <span className="flex-1 text-sm"><b>{b.code}</b> <span className="text-slate-500">— {b.description || b.quarter}</span></span>
                            <StatusBadge map={BIN_STATUS} value={b.status} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <CardHeader title="3. Une photo ?" subtitle={type === "ILLEGAL_DUMP" ? "Obligatoire pour un dépôt sauvage" : "Facultatif, mais très utile"} />
              <div className="space-y-4 px-5 pb-5">
                <ImageInput value={photo} onChange={setPhoto} capture aspect="aspect-[5/2]" label="Prendre ou choisir une photo" />
                <Textarea label="Commentaire" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ex. Le bac déborde depuis deux jours" maxLength={1000} />
                <button className="btn-primary w-full py-3" disabled={sending}>{sending ? <Spinner /> : <Send size={16} />} Envoyer le signalement</button>
              </div>
            </form>
          </Card>
        )}

        <Card className="h-fit">
          <CardHeader title="Mes signalements" subtitle="Suivez leur traitement" icon={<Megaphone size={18} />} />
          <div className="px-3 pb-3">
            {mine.loading ? <div className="space-y-2 px-2">{[0, 1].map((i) => <Skeleton key={i} className="h-16" />)}</div> : mine.data.length === 0 ? (
              <EmptyState compact title="Aucun signalement" description="Vos signalements apparaîtront ici." />
            ) : (
              <ul className="space-y-1">
                {mine.data.map((r) => (
                  <li key={r.id} className="flex items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-slate-50">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">{REPORT_TYPE[r.type]?.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">{REPORT_TYPE[r.type]?.label}{r.binCode ? ` · ${r.binCode}` : ""}</p>
                      <p className="text-xs text-slate-500">{timeAgo(r.createdAt)}</p>
                      {r.rejectionReason && <p className="mt-0.5 text-xs text-slate-500">Motif : {r.rejectionReason}</p>}
                    </div>
                    <StatusBadge map={REPORT_STATUS} value={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ClientReportsPage() {
  return <Suspense fallback={<Spinner />}><ReportForm /></Suspense>;
}
