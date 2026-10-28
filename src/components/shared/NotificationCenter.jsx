"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CalendarClock, CheckCheck, ClipboardList, Crown, Megaphone, Recycle, Send, ShoppingBag, Siren, Sparkles, Trash2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { FilterPills } from "@/components/ui/Table";
import { Input, Select, Textarea } from "@/components/ui/Field";
import EmptyState, { ErrorState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import Spinner from "@/components/ui/Spinner";
import { useAction, useAsync } from "@/hooks/useAsync";
import { useSession } from "@/components/providers/SessionProvider";
import { notifications } from "@/services/notification";
import { notify } from "@/lib/notify";
import { dayGroup, formatTime } from "@/lib/format";
import { TOWNS } from "@/lib/labels";

const CATEGORY = {
  MISSION: { icon: ClipboardList, tone: "bg-blue-50 text-blue-600" },
  REPORT: { icon: Siren, tone: "bg-red-50 text-red-600" },
  BIN: { icon: Recycle, tone: "bg-emerald-50 text-emerald-600" },
  AWARENESS: { icon: Sparkles, tone: "bg-violet-50 text-violet-600" },
  SUBSCRIPTION: { icon: Crown, tone: "bg-amber-50 text-amber-600" },
  COLLECTION_REQUEST: { icon: CalendarClock, tone: "bg-amber-50 text-amber-600" },
  ORDER: { icon: ShoppingBag, tone: "bg-sky-50 text-sky-600" },
  ANNOUNCEMENT: { icon: Megaphone, tone: "bg-brand-50 text-brand-700" },
  SYSTEM: { icon: Bell, tone: "bg-slate-100 text-slate-600" },
};

export default function NotificationCenter({ canBroadcast = false }) {
  const { setUnread, refreshUnread } = useSession();
  const list = useAsync(() => notifications.mine(), [], { initial: [], pollMs: 60_000, sync: ["notifications"] });
  const [filter, setFilter] = useState("ALL");
  const [, run] = useAction();

  const rows = list.data.filter((n) => filter === "ALL" || (filter === "UNREAD" ? !n.read : n.category === filter));
  const groups = useMemo(() => {
    const map = new Map();
    rows.forEach((n) => {
      const g = dayGroup(n.createdAt);
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(n);
    });
    return [...map.entries()];
  }, [rows]);
  const unreadCount = list.data.filter((n) => !n.read).length;
  const categories = [...new Set(list.data.map((n) => n.category))];

  const open = (n) => {
    if (n.read) return;
    list.setData((d) => d.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    setUnread((u) => Math.max(0, u - 1));
    notifications.markRead(n.id);
  };
  const markAll = () => run(async () => {
    const r = await notifications.markAllRead();
    if (r.success) { list.setData((d) => d.map((x) => ({ ...x, read: true }))); setUnread(0); } else notify.error(r.error);
  });
  const remove = (n) => run(async () => {
    const r = await notifications.remove(n.id);
    if (r.success) { list.setData((d) => d.filter((x) => x.id !== n.id)); refreshUnread(); } else notify.error(r.error);
  });

  return (
    <div>
      <PageHeader title="Notifications" subtitle={unreadCount ? `${unreadCount} notification(s) non lue(s)` : "Vous êtes à jour."}
        actions={unreadCount > 0 && <button className="btn-secondary" onClick={markAll}><CheckCheck size={16} /> Tout marquer comme lu</button>} />
      <div className={`grid gap-6 ${canBroadcast ? "xl:grid-cols-[1fr_380px]" : ""}`}>
        <div>
          <div className="mb-4">
            <FilterPills value={filter} onChange={setFilter} options={[
              { value: "ALL", label: "Toutes" }, { value: "UNREAD", label: "Non lues", count: unreadCount },
              ...categories.filter((c) => c !== "SYSTEM").slice(0, 4).map((c) => ({ value: c, label: { MISSION: "Missions", REPORT: "Signalements", BIN: "Bacs", AWARENESS: "Sensibilisation", SUBSCRIPTION: "Abonnement", COLLECTION_REQUEST: "Collectes", ORDER: "Commandes", ANNOUNCEMENT: "Annonces" }[c] || c })),
            ]} />
          </div>
          {list.loading ? <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div> : list.error ? <ErrorState message={list.error} onRetry={list.reload} /> : groups.length === 0 ? (
            <Card><EmptyState icon={<Bell size={26} />} title="Aucune notification" description="Vous serez prévenu ici des événements qui vous concernent." /></Card>
          ) : (
            <div className="space-y-6">
              {groups.map(([group, items]) => (
                <div key={group}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{group}</p>
                  <Card className="divide-y divide-slate-100 overflow-hidden">
                    {items.map((n) => {
                      const c = CATEGORY[n.category] || CATEGORY.SYSTEM;
                      const Icon = c.icon;
                      const body = (
                        <div className="flex gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.tone}`}><Icon size={18} /></div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm ${n.read ? "font-medium text-slate-700" : "font-semibold text-slate-900"}`}>{n.title}</p>
                              <span className="shrink-0 text-[11px] text-slate-400">{formatTime(n.createdAt)}</span>
                            </div>
                            {n.message && <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>}
                            {n.sender && n.sender !== "Système" && <p className="mt-1 text-[11px] text-slate-400">De : {n.sender}</p>}
                          </div>
                        </div>
                      );
                      return (
                        <div key={n.id} className={`group relative px-4 py-3.5 transition hover:bg-slate-50 ${n.read ? "" : "bg-brand-50/40"}`} onMouseEnter={() => open(n)}>
                          {!n.read && <span className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-brand-500" />}
                          {n.link ? <Link href={n.link} onClick={() => open(n)}>{body}</Link> : body}
                          <button onClick={() => remove(n)} className="absolute bottom-2 right-3 hidden rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 group-hover:block" aria-label="Supprimer"><Trash2 size={14} /></button>
                        </div>
                      );
                    })}
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
        {canBroadcast && <BroadcastCard />}
      </div>
    </div>
  );
}

function BroadcastCard() {
  const [form, setForm] = useState({ audience: "ALL_CLIENTS", town: "Yaoundé", quarter: "", title: "", message: "" });
  const [pending, run] = useAction();
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const send = (e) => {
    e.preventDefault();
    run(async () => {
      const r = await notifications.broadcast(form);
      if (r.success) { notify.success(`Annonce envoyée à ${r.data.recipients} destinataire(s)`); set({ title: "", message: "" }); } else notify.error(r.error);
    });
  };
  return (
    <Card className="h-fit xl:sticky xl:top-4">
      <CardHeader title="Envoyer une annonce" subtitle="Informez la population d'une collecte, d'un changement d'horaire…" icon={<Megaphone size={18} />} />
      <form onSubmit={send} className="space-y-4 px-5 pb-5">
        <Select label="Destinataires" value={form.audience} onChange={(e) => set({ audience: e.target.value })} options={[
          { value: "ALL_CLIENTS", label: "Tous les clients" }, { value: "PREMIUM_CLIENTS", label: "Clients premium" },
          { value: "TOWN", label: "Les clients d'une ville" }, { value: "QUARTER", label: "Les clients d'un quartier" }, { value: "DRIVERS", label: "Tous les chauffeurs" },
        ]} />
        {["TOWN", "QUARTER"].includes(form.audience) && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Ville" value={form.town} onChange={(e) => set({ town: e.target.value })} options={Object.keys(TOWNS).map((t) => ({ value: t, label: t }))} />
            {form.audience === "QUARTER" && <Input label="Quartier" required list="bc-q" value={form.quarter} onChange={(e) => set({ quarter: e.target.value })} />}
            <datalist id="bc-q">{(TOWNS[form.town] || []).map((q) => <option key={q} value={q} />)}</datalist>
          </div>
        )}
        <Input label="Titre" required maxLength={150} value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Ex. Collecte exceptionnelle samedi" />
        <Textarea label="Message" required rows={4} maxLength={2000} value={form.message} onChange={(e) => set({ message: e.target.value })} />
        <button className="btn-primary w-full" disabled={pending}>{pending ? <Spinner /> : <Send size={15} />} Envoyer l'annonce</button>
      </form>
    </Card>
  );
}
