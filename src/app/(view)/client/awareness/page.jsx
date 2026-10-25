"use client";

import { useMemo, useState } from "react";
import { Check, Eye, Sparkles } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FilterPills } from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import CapsulePlayer, { CapsuleThumb } from "@/components/awareness/CapsulePlayer";
import { useAsync } from "@/hooks/useAsync";
import { awareness } from "@/services/awareness";
import { notify } from "@/lib/notify";
import { formatDate } from "@/lib/format";
import { CAPSULE_FORMAT } from "@/lib/labels";

export default function ClientAwarenessPage() {
  const library = useAsync(() => awareness.library(), [], { initial: [] });
  const [theme, setTheme] = useState("ALL");
  const [open, setOpen] = useState(null);

  const themes = [...new Set(library.data.map((c) => c.theme).filter(Boolean))];
  const rows = library.data.filter((c) => theme === "ALL" || c.theme === theme);
  const viewed = library.data.filter((c) => c.viewed).length;
  const progress = library.data.length ? Math.round((viewed / library.data.length) * 100) : 0;

  const update = (capsule) => library.setData((list) => list.map((c) => (c.id === capsule.id ? { ...c, viewed: true, understood: capsule.understood || c.understood } : c)));
  const record = async (completed, understood) => {
    const r = await awareness.view(open.id, completed, understood);
    if (r.success) {
      update(r.data);
      if (understood) {
        setOpen({ ...open, understood: true });
        notify.success("Merci ! Chaque geste compte 🌱");
      }
    }
  };

  const today = useMemo(() => library.data[0], [library.data]);

  return (
    <div>
      <PageHeader title="Sensibilisation" subtitle="Des capsules courtes pour adopter, chaque jour, les bons gestes face aux déchets." />
      <Card className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Sparkles size={26} /></div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{viewed} capsule(s) découverte(s) sur {library.data.length}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-brand-500 transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
        {today && !today.viewed && <button className="btn-primary" onClick={() => setOpen(today)}>Voir la dernière capsule</button>}
      </Card>

      {themes.length > 1 && (
        <div className="mb-5 overflow-x-auto"><FilterPills value={theme} onChange={setTheme} options={[{ value: "ALL", label: "Tous les thèmes" }, ...themes.map((t) => ({ value: t, label: t }))]} /></div>
      )}

      {library.loading ? <CardsSkeleton /> : rows.length === 0 ? (
        <Card><EmptyState icon={<Sparkles size={26} />} title="Aucune capsule pour le moment" description="Revenez bientôt : une nouvelle capsule est publiée chaque jour." /></Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => (
            <button key={c.id} onClick={() => setOpen(c)} className="card-hover overflow-hidden text-left">
              <div className="relative">
                <CapsuleThumb capsule={c} />
                {c.viewed && <span className="absolute right-3 top-3 chip bg-white/95 font-semibold text-brand-700 shadow-sm"><Check size={12} /> Vue</span>}
              </div>
              <div className="p-4">
                <div className="mb-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{CAPSULE_FORMAT[c.format]?.label}</span>·<span>{formatDate(c.publishDate)}</span>
                </div>
                <p className="font-semibold text-slate-900">{c.title}</p>
                {c.keyMessage && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.keyMessage}</p>}
                {c.theme && <Badge tone="violet" className="mt-3">{c.theme}</Badge>}
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.title} subtitle={open?.theme} size="lg"
        footer={open && (open.understood
          ? <span className="flex items-center gap-1.5 text-sm font-medium text-brand-700"><Check size={16} /> Vous avez validé cette capsule</span>
          : <button className="btn-primary" onClick={() => record(true, true)}><Check size={16} /> J'ai compris</button>)}>
        {open && (
          <>
            <CapsulePlayer capsule={open} onComplete={() => record(true, false)} />
            {open.keyMessage && <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-900">💡 {open.keyMessage}</p>}
            {open.description && <p className="mt-3 text-sm leading-relaxed text-slate-600">{open.description}</p>}
            <p className="mt-3 flex items-center gap-1 text-xs text-slate-400"><Eye size={12} /> Publiée le {formatDate(open.publishDate)}</p>
          </>
        )}
      </Modal>
    </div>
  );
}
