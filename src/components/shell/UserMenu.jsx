"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { fullName } from "@/lib/format";
import { ROLE } from "@/lib/labels";
import { useSession } from "@/components/providers/SessionProvider";

export default function UserMenu({ profileHref }) {
  const { user, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition hover:bg-slate-100">
        <Avatar person={user} size="sm" />
        <div className="hidden text-left sm:block">
          <p className="max-w-[160px] truncate text-sm font-semibold text-slate-800">{fullName(user)}</p>
          <p className="text-[11px] text-slate-500">{ROLE[user?.role]?.label || "Utilisateur"}</p>
        </div>
        <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 animate-slide-down rounded-2xl border border-slate-100 bg-white py-2 shadow-[var(--shadow-lift)]">
          <div className="border-b border-slate-100 px-4 pb-3 pt-1">
            <p className="truncate text-sm font-semibold text-slate-800">{fullName(user)}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <Link href={profileHref} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            <UserRound size={16} /> Mon profil
          </Link>
          <button onClick={signOut} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
