"use client";

import Link from "next/link";
import {
  AlertTriangle, ArrowRight, CalendarClock, ClipboardList, Clock, Crown, Plus, Recycle, ShoppingBag, Siren,
  Sparkles, Truck, UserRound, Wallet,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader, StatCard } from "@/components/ui/Card";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import BarChart, { SplitBar } from "@/components/ui/BarChart";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAsync } from "@/hooks/useAsync";
import { useSession } from "@/components/providers/SessionProvider";
import { dashboard } from "@/services/dashboard";
import { missions as missionService } from "@/services/mission";
import { reports as reportService } from "@/services/report";
import { formatFcfa, formatTime, fullName, isoDate, timeAgo } from "@/lib/format";
import { MISSION_PURPOSE, MISSION_STATUS, REPORT_TYPE } from "@/lib/labels";

const VEHICLE_COLORS = {
  AVAILABLE: ["Disponibles", "bg-emerald-500"],
  UNAVAILABLE: ["En mission", "bg-blue-500"],
  SLEEPING: ["Au repos", "bg-violet-400"],
  BROKEN_DOWN: ["En panne", "bg-red-500"],
  OUT_OF_SERVICE: ["Hors service", "bg-slate-400"],
};

export default function AdminDashboard() {
  const { user } = useSession();
  const stats = useAsync(() => dashboard.admin(), [], { pollMs: 60_000 });
  const today = useAsync(() => missionService.getAll({ date: isoDate() }), [], { initial: [], pollMs: 60_000 });
  const open = useAsync(() => reportService.getAll("NEW"), [], { initial: [] });
  const d = stats.data || {};
  const loading = stats.loading;

  const week = (d.missionsLast7Days || []).map((p) => ({
    label: new Date(p.date).toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""),
    value: p.total,
    secondary: p.completed,
  }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tour de contrôle"
        title={`${greeting}, ${user?.firstName || fullName(user)} 👋`}
        subtitle="Voici l'état de la collecte en temps réel."
        actions={
          <>
            <Link href="/admin/map" className="btn-secondary">Carte en direct</Link>
            <Link href="/admin/newMission" className="btn-primary"><Plus size={16} /> Nouvelle mission</Link>
          </>
        }
      />

      {(d.binsByStatus?.FULL > 0 || d.openReports > 0) && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><AlertTriangle size={20} /></div>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {d.binsByStatus?.FULL || 0} bac(s) plein(s) · {d.openReports || 0} signalement(s) à traiter
              </p>
              <p className="text-xs text-amber-800/80">Affectez une mission au véhicule disponible le plus proche.</p>
            </div>
          </div>
          <Link href="/admin/reports" className="btn bg-amber-600 text-white hover:bg-amber-700">Traiter <ArrowRight size={15} /></Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={loading} icon={<Recycle size={21} />} label="Bacs pleins" value={`${d.binsByStatus?.FULL ?? 0} / ${d.activeBins ?? 0}`} hint="à vider / bacs actifs" tone="red" href="/admin/garbageBinList" />
        <StatCard loading={loading} icon={<ClipboardList size={21} />} label="Missions du jour" value={d.missionsToday ?? 0} hint={`${d.missionsTodayByStatus?.COMPLETED ?? 0} terminée(s)`} tone="blue" href="/admin/missionList" />
        <StatCard loading={loading} icon={<Siren size={21} />} label="Signalements ouverts" value={d.openReports ?? 0} hint="nouveaux et pris en charge" tone="amber" href="/admin/reports" />
        <StatCard loading={loading} icon={<UserRound size={21} />} label="Chauffeurs en ligne" value={`${d.driversOnline ?? 0} / ${d.drivers ?? 0}`} hint="connectés maintenant" tone="green" href="/admin/driverList" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Missions des 7 derniers jours" subtitle="Total planifié et missions terminées" icon={<ClipboardList size={18} />} />
          <div className="px-5 pb-5">{loading ? <Skeleton className="h-48" /> : <BarChart data={week} primaryLabel="Planifiées" secondaryLabel="Terminées" />}</div>
        </Card>
        <Card>
          <CardHeader title="Performance" subtitle="30 derniers jours" icon={<Clock size={18} />} />
          <div className="space-y-4 px-5 pb-5">
            <Metric label="Délai moyen « plein → vidé »" value={d.averageCollectionDelayHours != null ? `${d.averageCollectionDelayHours} h` : "—"} hint="Objectif : −50 % en un an" />
            <Metric label="Lecteurs de la sensibilisation (mois)" value={d.awarenessViewersThisMonth ?? 0} hint={`${d.clients ?? 0} clients inscrits`} icon={<Sparkles size={15} />} />
            <Metric label="Clients premium" value={d.premiumClients ?? 0} hint={`${d.activeSubscriptions ?? 0} abonnement(s) actif(s)`} icon={<Crown size={15} />} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Missions d'aujourd'hui"
            subtitle={`${today.data.length} mission(s)`}
            icon={<CalendarClock size={18} />}
            action={<Link href="/admin/missionList" className="text-sm font-medium text-brand-700 hover:underline">Tout voir</Link>}
          />
          <div className="px-2 pb-3">
            {today.loading ? (
              <div className="space-y-2 px-3 pb-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : today.data.length === 0 ? (
              <EmptyState compact title="Aucune mission prévue aujourd'hui" description="Planifiez les collectes du jour pour vos chauffeurs." action={<Link href="/admin/newMission" className="btn-primary"><Plus size={16} /> Créer une mission</Link>} />
            ) : (
              <ul className="divide-y divide-slate-100">
                {today.data.slice(0, 7).map((m) => (
                  <li key={m.id} className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-slate-50">
                    <div className="w-14 text-center">
                      <p className="font-display text-sm font-bold text-slate-800">{formatTime(m.start)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        #{m.id} · {MISSION_PURPOSE[m.purpose]?.label}
                        <span className="font-normal text-slate-500"> — {m.district || m.city || "—"}</span>
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        <Truck size={12} className="mr-1 inline" />{m.driverFullName || "Non affectée"}{m.vehicleImmatriculation ? ` · ${m.vehicleImmatriculation}` : ""}
                      </p>
                    </div>
                    <StatusBadge map={MISSION_STATUS} value={m.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Nouveaux signalements"
            icon={<Siren size={18} />}
            action={<Link href="/admin/reports" className="text-sm font-medium text-brand-700 hover:underline">Traiter</Link>}
          />
          <div className="px-2 pb-3">
            {open.loading ? (
              <div className="space-y-2 px-3">{[0, 1].map((i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : open.data.length === 0 ? (
              <EmptyState compact title="Aucun nouveau signalement" description="Tout est sous contrôle." />
            ) : (
              <ul className="space-y-1">
                {open.data.slice(0, 5).map((r) => (
                  <li key={r.id}>
                    <Link href="/admin/reports" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-base">{REPORT_TYPE[r.type]?.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">{REPORT_TYPE[r.type]?.label}{r.binCode ? ` · ${r.binCode}` : ""}</p>
                        <p className="truncate text-xs text-slate-500">{r.binQuarter || "Position GPS"} · {timeAgo(r.createdAt)}</p>
                      </div>
                      {r.duplicateCount > 0 && <Badge tone="red">+{r.duplicateCount}</Badge>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="État des bacs" icon={<Recycle size={18} />} />
          <div className="px-5 pb-5">
            <SplitBar segments={[
              { label: "Vides", value: d.binsByStatus?.EMPTY || 0, color: "bg-emerald-500" },
              { label: "Pleins", value: d.binsByStatus?.FULL || 0, color: "bg-red-500" },
              { label: "Hors service", value: d.binsByStatus?.OUT_OF_SERVICE || 0, color: "bg-slate-400" },
            ]} />
            <div className="mt-5 space-y-2">
              {Object.entries(d.binsByTown || {}).map(([town, count]) => (
                <div key={town} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{town}</span>
                  <span className="font-semibold text-slate-800">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Flotte" icon={<Truck size={18} />} action={<Link href="/admin/vehicleList" className="text-sm font-medium text-brand-700 hover:underline">Gérer</Link>} />
          <div className="px-5 pb-5">
            <SplitBar segments={Object.entries(VEHICLE_COLORS).map(([k, [label, color]]) => ({ label, value: d.vehiclesByStatus?.[k] || 0, color }))} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Activité commerciale" subtitle="Mois en cours" icon={<Wallet size={18} />} />
          <div className="space-y-3 px-5 pb-5">
            <Row label="Ventes livrées" value={formatFcfa(d.revenueThisMonth)} />
            <Row label="Abonnements activés" value={formatFcfa(d.premiumRevenueThisMonth)} />
            <Row label={<Link href="/admin/orders" className="hover:underline"><ShoppingBag size={14} className="mr-1 inline" />Commandes en attente</Link>} value={d.pendingOrders ?? 0} />
            <Row label={<Link href="/admin/subscriptions" className="hover:underline"><Crown size={14} className="mr-1 inline" />Paiements à confirmer</Link>} value={d.pendingSubscriptions ?? 0} />
            <Row label={<Link href="/admin/collectionRequests" className="hover:underline"><CalendarClock size={14} className="mr-1 inline" />Demandes premium</Link>} value={d.pendingCollectionRequests ?? 0} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, hint, icon }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">{icon}{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
