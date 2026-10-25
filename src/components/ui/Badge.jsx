const TONES = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/15",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/15",
  sky: "bg-sky-50 text-sky-700 ring-sky-600/15",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/15",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/15",
};

const DOTS = {
  green: "bg-emerald-500", amber: "bg-amber-500", red: "bg-red-500", blue: "bg-blue-500",
  sky: "bg-sky-500", violet: "bg-violet-500", slate: "bg-slate-400",
};

export function Badge({ tone = "slate", dot = false, children, className = "" }) {
  return (
    <span className={`chip ring-1 ring-inset ${TONES[tone] || TONES.slate} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOTS[tone] || DOTS.slate}`} />}
      {children}
    </span>
  );
}

/** Badge de statut à partir d'une table de libellés (lib/labels.js). */
export function StatusBadge({ map, value, dot = true }) {
  const m = map[value] || { label: value || "—", tone: "slate" };
  return <Badge tone={m.tone} dot={dot}>{m.label}</Badge>;
}
