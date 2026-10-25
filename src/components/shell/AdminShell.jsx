"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, Boxes, Building2, ClipboardList, Gauge, Map as MapIcon, Megaphone, Menu, PackageCheck, Recycle,
  FileClock, ShieldCheck, ShoppingBag, Siren, Sparkles, Truck, UserRound, Users, X, CalendarClock, Crown,
} from "lucide-react";
import Brand from "./Brand";
import UserMenu from "./UserMenu";
import { useSession } from "@/components/providers/SessionProvider";
import { dashboard } from "@/services/dashboard";

function buildNav(isSuperAdmin, counters) {
  return [
    {
      title: "Pilotage",
      items: [
        { href: "/admin/dashboard", label: "Tableau de bord", icon: Gauge },
        { href: "/admin/map", label: "Carte en direct", icon: MapIcon },
        { href: "/admin/missionList", label: "Missions", icon: ClipboardList, match: ["/admin/newMission"] },
        { href: "/admin/reports", label: "Signalements", icon: Siren, badge: counters.openReports, badgeTone: "red" },
        { href: "/admin/validations", label: isSuperAdmin ? "Validations" : "Brouillons", icon: FileClock, badge: counters.pendingApprovals, badgeTone: isSuperAdmin ? "violet" : undefined },
      ],
    },
    {
      title: "Parc",
      items: [
        { href: "/admin/garbageBinList", label: "Bacs à ordures", icon: Recycle, match: ["/admin/addGarbageBin"] },
        { href: "/admin/vehicleList", label: "Véhicules", icon: Truck, match: ["/admin/addVehicle"] },
        { href: "/admin/driverList", label: "Chauffeurs", icon: UserRound, match: ["/admin/addDriver"], badge: counters.pendingActivations },
        { href: "/admin/depots", label: "Casernes", icon: Building2 },
      ],
    },
    {
      title: "Clients & services",
      items: [
        { href: "/admin/clientList", label: "Clients", icon: Users },
        { href: "/admin/subscriptions", label: "Abonnements premium", icon: Crown, badge: counters.pendingSubscriptions },
        { href: "/admin/collectionRequests", label: "Demandes de collecte", icon: CalendarClock, badge: counters.pendingCollectionRequests },
        { href: "/admin/awareness", label: "Sensibilisation", icon: Sparkles },
      ],
    },
    {
      title: "Boutique",
      items: [
        { href: "/admin/productList", label: "Produits", icon: Boxes, match: ["/admin/addProduct"] },
        { href: "/admin/orders", label: "Commandes", icon: ShoppingBag, badge: counters.pendingOrders },
      ],
    },
    {
      title: "Administration",
      items: [
        { href: "/admin/adminList", label: "Administrateurs", icon: ShieldCheck, match: isSuperAdmin ? ["/admin/addAdmin"] : [] },
        { href: "/admin/notificationCenter", label: "Notifications & annonces", icon: Megaphone },
      ],
    },
  ];
}

function NavItem({ item, active, onNavigate }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition ${
        active ? "bg-white text-brand-800 shadow-sm" : "text-brand-100/90 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon size={17} className={active ? "text-brand-600" : "text-brand-300 group-hover:text-white"} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge > 0 && (
        <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold ${item.badgeTone === "red" ? "bg-red-500 text-white" : item.badgeTone === "violet" ? "bg-violet-500 text-white" : active ? "bg-brand-100 text-brand-800" : "bg-white/20 text-white"}`}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const { user, unread } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [counters, setCounters] = useState({});

  // Compteurs de la barre latérale, rafraîchis toutes les 2 minutes
  useEffect(() => {
    const load = async () => {
      const r = await dashboard.admin();
      if (r.success) setCounters(r.data);
    };
    load();
    const id = setInterval(load, 120_000);
    return () => clearInterval(id);
  }, [pathname]);

  const nav = buildNav(user?.role === "SUPER_ADMIN", counters);
  const isActive = (item) => pathname === item.href || pathname.startsWith(item.href + "/") || item.match?.includes(pathname);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Brand light />
        <button className="rounded-lg p-1.5 text-brand-100 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Fermer le menu">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6 pt-2">
        {nav.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-brand-300/80">{group.title}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.href} item={item} active={isActive(item)} onNavigate={() => setMobileOpen(false)} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="m-3 rounded-2xl bg-white/10 p-4 text-xs text-brand-100">
        <p className="flex items-center gap-2 font-semibold text-white"><PackageCheck size={15} /> Tour de contrôle</p>
        <p className="mt-1 leading-relaxed text-brand-200">{counters.missionsToday ?? 0} mission(s) aujourd'hui · {counters.driversOnline ?? 0} chauffeur(s) en ligne</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-[264px] shrink-0 bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950 lg:block">{sidebar}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[900] lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative h-full w-[280px] animate-slide-in-right bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950 shadow-2xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu">
              <Menu size={20} />
            </button>
            <div className="lg:hidden"><Brand compact /></div>
            <p className="hidden text-sm text-slate-500 lg:block">
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/notificationCenter" className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" aria-label="Notifications">
              <Bell size={19} />
              {unread > 0 && (
                <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
            <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />
            <UserMenu profileHref="/admin/profile" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] animate-fade-in px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
