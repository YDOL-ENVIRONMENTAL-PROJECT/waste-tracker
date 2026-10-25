"use client";

import { useMemo, useState } from "react";
import { Archive, CalendarDays, Eye, Image as ImageIcon, Lightbulb, Pencil, Plus, Presentation, Sparkles, ThumbsUp, Video, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { FilterPills } from "@/components/ui/Table";
import { ChoiceCards, Input, Select, Textarea } from "@/components/ui/Field";
import EmptyState, { ErrorState } from "@/components/ui/EmptyState";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import ImageInput from "@/components/ui/ImageInput";
import Spinner from "@/components/ui/Spinner";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import CapsulePlayer, { CapsuleThumb } from "@/components/awareness/CapsulePlayer";
import { useAction, useAsync } from "@/hooks/useAsync";
import { awareness } from "@/services/awareness";
import { notify } from "@/lib/notify";
import { compressImage } from "@/lib/image";
import { formatDate, isoDate } from "@/lib/format";
import { CAPSULE_AUDIENCE, CAPSULE_FORMAT, CAPSULE_STATUS, CAPSULE_THEMES } from "@/lib/labels";

const EMPTY = { title: "", keyMessage: "", description: "", theme: CAPSULE_THEMES[0], format: "VIDEO", mediaUrl: "", slides: [], thumbnail: "", durationSeconds: "", audience: "ALL", publishDate: isoDate(), status: "SCHEDULED" };

export default function AwarenessAdminPage() {
  const list = useAsync(() => awareness.getAll(), [], { initial: [] });
  const stats = useAsync(() => awareness.stats(), []);
  const [filter, setFilter] = useState("ALL");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [preview, setPreview] = useState(null);
  const [archiving, setArchiving] = useState(null);
  const [pending, run] = useAction();
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const rows = list.data.filter((c) => (filter === "ALL" ? c.status !== "ARCHIVED" : c.status === filter));
  const count = (s) => list.data.filter((c) => c.status === s).length;

  // Planning des 14 prochains jours
  const planning = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const key = isoDate(d);
    return { key, date: d, capsule: list.data.find((c) => c.publishDate === key && ["SCHEDULED", "PUBLISHED"].includes(c.status)) };
  }), [list.data]);

  const open = (c, date) => {
    setEditing(c || "new");
    setForm(c ? { ...EMPTY, ...c, durationSeconds: c.durationSeconds ?? "", publishDate: c.publishDate || isoDate(), slides: c.slides || [] } : { ...EMPTY, publishDate: date || isoDate() });
  };

  const addSlides = async (files) => {
    try {
      const images = await Promise.all([...files].map((f) => compressImage(f, { maxSize: 1600, quality: 0.8 })));
      set({ slides: [...form.slides, ...images] });
    } catch (e) {
      notify.error(e.message);
    }
  };

  const save = () => run(async () => {
    const payload = { ...form, durationSeconds: form.durationSeconds ? Number(form.durationSeconds) : null, mediaUrl: form.format === "VIDEO" ? form.mediaUrl : null, slides: form.format === "VIDEO" ? [] : form.slides };
    const r = editing === "new" ? await awareness.create(payload) : await awareness.update(editing.id, payload);
    if (r.success) { notify.success("Capsule enregistrée"); setEditing(null); list.reload({ silent: true }); stats.reload({ silent: true }); } else notify.error(r.error);
  });

  return (
    <div>
      <PageHeader title="Sensibilisation" subtitle="Une capsule courte chaque jour pour ancrer les bons gestes : mini-vidéos, diaporamas et infographies."
        actions={<button className="btn-primary" onClick={() => open(null)}><Plus size={16} /> Nouvelle capsule</button>} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Sparkles size={20} />} label="Capsules publiées" value={stats.data?.published ?? 0} loading={stats.loading} tone="green" />
        <StatCard icon={<CalendarDays size={20} />} label="Programmées" value={stats.data?.scheduled ?? 0} loading={stats.loading} tone="sky" />
        <StatCard icon={<Eye size={20} />} label="Lectures au total" value={stats.data?.totalViews ?? 0} loading={stats.loading} tone="violet" />
        <StatCard icon={<ThumbsUp size={20} />} label="Lecteurs (30 jours)" value={stats.data?.viewersLast30Days ?? 0} hint="Objectif : 40 % de la population" loading={stats.loading} tone="amber" />
      </div>

      <Card className="mb-6 p-5">
        <p className="mb-3 text-sm font-semibold text-slate-800">Programme des 14 prochains jours</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {planning.map((p, i) => (
            <button key={p.key} onClick={() => (p.capsule ? open(p.capsule) : open(null, p.key))}
              className={`flex w-24 shrink-0 flex-col rounded-2xl border p-2.5 text-left transition hover:border-brand-400 ${p.capsule ? "border-brand-200 bg-brand-50/60" : "border-dashed border-slate-200"} ${i === 0 ? "ring-2 ring-brand-500/30" : ""}`}>
              <span className="text-[11px] font-medium uppercase text-slate-400">{i === 0 ? "Aujourd'hui" : p.date.toLocaleDateString("fr-FR", { weekday: "short" })}</span>
              <span className="font-display text-lg font-bold text-slate-800">{p.date.getDate()}</span>
              <span className={`mt-1 line-clamp-2 text-[11px] ${p.capsule ? "text-brand-800" : "text-slate-400"}`}>{p.capsule ? p.capsule.title : "+ Programmer"}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Un jour sans capsule programmée, la plateforme rediffuse automatiquement une capsule déjà publiée.</p>
      </Card>

      <div className="mb-4">
        <FilterPills value={filter} onChange={setFilter} options={[
          { value: "ALL", label: "Toutes" }, { value: "PUBLISHED", label: "Publiées", count: count("PUBLISHED") },
          { value: "SCHEDULED", label: "Programmées", count: count("SCHEDULED") }, { value: "DRAFT", label: "Brouillons", count: count("DRAFT") },
          { value: "ARCHIVED", label: "Archivées", count: count("ARCHIVED") },
        ]} />
      </div>

      {list.loading ? <CardsSkeleton /> : list.error ? <ErrorState message={list.error} onRetry={list.reload} /> : rows.length === 0 ? (
        <Card><EmptyState icon={<Lightbulb size={26} />} title="Aucune capsule" description="Créez votre première capsule de sensibilisation." action={<button className="btn-primary" onClick={() => open(null)}><Plus size={16} /> Nouvelle capsule</button>} /></Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              <button className="block w-full" onClick={() => setPreview(c)}><CapsuleThumb capsule={c} /></button>
              <div className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge map={CAPSULE_STATUS} value={c.status} />
                  <Badge tone="slate">{CAPSULE_FORMAT[c.format]?.label}</Badge>
                  {c.audience !== "ALL" && <Badge tone="violet">{CAPSULE_AUDIENCE[c.audience]?.label}</Badge>}
                </div>
                <p className="font-semibold text-slate-900">{c.title}</p>
                {c.keyMessage && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.keyMessage}</p>}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span><CalendarDays size={12} className="mr-1 inline" />{formatDate(c.publishDate)}</span>
                  <span className="flex gap-3"><span title="Lectures"><Eye size={12} className="mr-1 inline" />{c.views ?? 0}</span><span title="« J'ai compris »"><ThumbsUp size={12} className="mr-1 inline" />{c.understoodCount ?? 0}</span></span>
                </div>
                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <button className="btn-ghost flex-1 py-1.5 text-xs" onClick={() => open(c)}><Pencil size={14} /> Modifier</button>
                  {c.status !== "ARCHIVED" && <button className="btn-ghost py-1.5 text-xs text-red-600" onClick={() => setArchiving(c)}><Archive size={14} /></button>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Nouvelle capsule" : "Modifier la capsule"} size="lg"
        footer={<>
          <button className="btn-secondary" onClick={() => setEditing(null)}>Annuler</button>
          <button className="btn-primary" onClick={save} disabled={pending || !form.title.trim()}>{pending && <Spinner />} Enregistrer</button>
        </>}>
        <div className="space-y-4">
          <Input label="Titre" required value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Ex. Fermez toujours votre sac avant de le déposer" />
          <Input label="Message clé" value={form.keyMessage} onChange={(e) => set({ keyMessage: e.target.value })} placeholder="Le comportement attendu, en une phrase" />
          <div>
            <p className="label">Format</p>
            <ChoiceCards value={form.format} onChange={(format) => set({ format })} options={[
              { value: "VIDEO", label: "Mini-vidéo", description: "≤ 3 minutes", icon: <Video size={16} /> },
              { value: "SLIDESHOW", label: "Diaporama", description: "Images exportées d'un PowerPoint", icon: <Presentation size={16} /> },
              { value: "INFOGRAPHIC", label: "Infographie", description: "Une image explicative", icon: <ImageIcon size={16} /> },
            ]} />
          </div>
          {form.format === "VIDEO" ? (
            <Input label="Lien de la vidéo" required value={form.mediaUrl} onChange={(e) => set({ mediaUrl: e.target.value })} placeholder="https://youtu.be/… ou lien vers un fichier MP4" hint="YouTube, Vimeo ou fichier vidéo hébergé (720p max recommandé)" />
          ) : (
            <div>
              <p className="label">{form.format === "SLIDESHOW" ? "Diapositives" : "Image"} <span className="text-red-500">*</span></p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {form.slides.map((s, i) => (
                  <div key={i} className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200">
                    <img src={s} alt="" className="h-full w-full object-cover" />
                    <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 text-[10px] text-white">{i + 1}</span>
                    <button onClick={() => set({ slides: form.slides.filter((_, j) => j !== i) })} className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-red-600 opacity-0 group-hover:opacity-100" aria-label="Retirer"><X size={12} /></button>
                  </div>
                ))}
                <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-xs text-slate-500 hover:border-brand-400 hover:text-brand-700">
                  <Plus size={18} /> Ajouter
                  <input type="file" accept="image/*" multiple={form.format === "SLIDESHOW"} className="hidden" onChange={(e) => { addSlides(e.target.files); e.target.value = ""; }} />
                </label>
              </div>
              {form.format === "SLIDESHOW" && <p className="mt-1 text-xs text-slate-400">Astuce : dans PowerPoint, « Fichier › Exporter › JPEG » génère une image par diapositive.</p>}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Thème" value={form.theme} onChange={(e) => set({ theme: e.target.value })} options={CAPSULE_THEMES.map((t) => ({ value: t, label: t }))} />
            <Select label="Public" value={form.audience} onChange={(e) => set({ audience: e.target.value })} options={Object.entries(CAPSULE_AUDIENCE).map(([value, a]) => ({ value, label: a.label }))} />
            <Input label="Date de diffusion" type="date" value={form.publishDate} onChange={(e) => set({ publishDate: e.target.value })} />
            <Select label="Statut" value={form.status} onChange={(e) => set({ status: e.target.value })} options={["DRAFT", "SCHEDULED", "PUBLISHED"].map((s) => ({ value: s, label: CAPSULE_STATUS[s].label }))} hint="« Programmée » sera publiée automatiquement à la date choisie" />
            <Input label="Durée (secondes)" type="number" min="0" value={form.durationSeconds} onChange={(e) => set({ durationSeconds: e.target.value })} />
          </div>
          <Textarea label="Description" value={form.description} onChange={(e) => set({ description: e.target.value })} rows={3} />
          {form.format === "VIDEO" && (
            <div><p className="label">Miniature (facultatif)</p><ImageInput value={form.thumbnail} onChange={(thumbnail) => set({ thumbnail })} label="Ajouter une miniature" /></div>
          )}
        </div>
      </Modal>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.title} subtitle={preview?.keyMessage} size="lg">
        {preview && <CapsulePlayer capsule={preview} />}
        {preview?.description && <p className="mt-4 text-sm text-slate-600">{preview.description}</p>}
      </Modal>

      <ConfirmDialog open={!!archiving} onClose={() => setArchiving(null)} pending={pending} danger title="Archiver cette capsule ?" confirmLabel="Archiver"
        message="Elle ne sera plus visible des clients ni rediffusée."
        onConfirm={() => run(async () => {
          const r = await awareness.archive(archiving.id);
          if (r.success) { notify.success("Capsule archivée"); setArchiving(null); list.reload({ silent: true }); } else notify.error(r.error);
        })} />
    </div>
  );
}
