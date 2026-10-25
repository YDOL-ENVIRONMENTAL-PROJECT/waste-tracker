"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Crown, Home, Map as MapIcon, Megaphone, ShoppingBag, ShoppingCart, Sparkles } from "lucide-react";
import Brand from "./Brand";
import UserMenu from "./UserMenu";
import { useSession } from "@/components/providers/SessionProvider";
import { CartProvider, useCart } from "@/components/providers/CartProvider";

const NAV = [
  { href: "/client/dashboard", label: "Accueil", icon: Home },
  { href: "/client/awareness", label: "Sensibilisation", short: "Apprendre", icon: Sparkles },
  { href: "/client/reports", label: "Signaler", icon: Megaphone, primary: true },
  { href: "/client/map", label: "Bacs proches", icon: MapIcon, desktopOnly: true },
  { href: "/client/shop", label: "Boutique", icon: ShoppingBag, match: ["/client/orders"] },
  { href: "/client/premium", label: "Premium", icon: Crown },
];

function Shell({ children }) {
  const pathname = usePathname();
  const { unread, user } = useSession();
  const { count } = useCart();
  const active = (item) => pathname === item.href || item.match?.includes(pathname);

  return (
    <div className="min-h-screen pb-24 xl:pb-0">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/client/dashboard"><Brand /></Link>
          <nav className="hidden items-center gap-0.5 xl:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${active(item) ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                <item.icon size={16} className={item.href === "/client/premium" && user?.type === "PREMIUM" ? "text-amber-500" : ""} />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <Link href="/client/shop?cart=1" className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label="Panier">
              <ShoppingCart size={19} />
              {count > 0 && <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">{count}</span>}
            </Link>
            <Link href="/client/notificationsCenter" className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label="Notifications">
              <Bell size={19} />
              {unread > 0 && <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">{unread > 99 ? "99+" : unread}</span>}
            </Link>
            <UserMenu profileHref="/client/profile" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl animate-fade-in px-4 py-6 sm:px-6 lg:py-8">{children}</main>

      {/* Barre d'onglets mobile : préfigure l'application mobile client */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md xl:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {NAV.filter((i) => !i.desktopOnly).map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-2 text-[10.5px] font-medium">
              {item.primary ? (
                <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30"><item.icon size={21} /></span>
              ) : (
                <item.icon size={21} className={active(item) ? "text-brand-700" : "text-slate-400"} />
              )}
              <span className={active(item) ? "text-brand-800" : "text-slate-500"}>{item.short || item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function ClientShell({ children }) {
  return (
    <CartProvider>
      <Shell>{children}</Shell>
    </CartProvider>
  );
}
