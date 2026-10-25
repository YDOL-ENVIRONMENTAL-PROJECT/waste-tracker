import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Card({ className = "", children, ...rest }) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
      <div className="flex items-center gap-3 min-w-0">
        {icon && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">{icon}</div>}
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-slate-900 truncate">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

const STAT_TONES = {
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  sky: "bg-sky-50 text-sky-600",
  slate: "bg-slate-100 text-slate-600",
};

export function StatCard({ icon, label, value, hint, tone = "green", href, loading }) {
  const content = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        {loading ? (
          <div className="skeleton mt-2 h-8 w-16" />
        ) : (
          <p className="mt-1 font-display text-[28px] font-bold leading-tight text-slate-900">{value}</p>
        )}
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${STAT_TONES[tone]}`}>{icon}</div>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="card-hover group relative block p-5">
        {content}
        <ArrowUpRight size={14} className="absolute bottom-4 right-4 text-slate-300 transition group-hover:text-brand-600" />
      </Link>
    );
  }
  return <div className="card p-5">{content}</div>;
}
