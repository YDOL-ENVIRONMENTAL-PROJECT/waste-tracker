/**
 * Histogramme léger en SVG (sans dépendance).
 * data : [{ label, value, secondary? }] ; secondary est dessiné en surimpression (ex. terminées / total).
 */
export default function BarChart({ data = [], height = 180, primaryLabel = "Total", secondaryLabel }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const barW = 100 / Math.max(1, data.length);
  return (
    <div>
      <div className="relative" style={{ height }}>
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <div key={t} className="absolute inset-x-0 border-t border-dashed border-slate-100" style={{ bottom: `${t * 100}%` }} />
        ))}
        <div className="absolute inset-0 flex items-end">
          {data.map((d) => (
            <div key={d.label} className="group relative flex h-full flex-col items-center justify-end" style={{ width: `${barW}%` }}>
              <div className="pointer-events-none absolute -top-1 z-10 hidden -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] text-white group-hover:block">
                {primaryLabel} : {d.value}
                {secondaryLabel && d.secondary !== undefined ? ` · ${secondaryLabel} : ${d.secondary}` : ""}
              </div>
              <div className="relative w-[46%] max-w-9 overflow-hidden rounded-t-lg bg-brand-100 transition-all" style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 4 : 0 }}>
                {d.secondary !== undefined && (
                  <div className="absolute inset-x-0 bottom-0 rounded-t-lg bg-brand-600" style={{ height: `${d.value ? (d.secondary / d.value) * 100 : 0}%` }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex">
        {data.map((d) => (
          <div key={d.label} className="text-center text-[11px] text-slate-400" style={{ width: `${barW}%` }}>
            {d.label}
          </div>
        ))}
      </div>
      {secondaryLabel && (
        <div className="mt-3 flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-100" />{primaryLabel}</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-600" />{secondaryLabel}</span>
        </div>
      )}
    </div>
  );
}

/** Barre de répartition horizontale (statuts). */
export function SplitBar({ segments = [] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {total > 0 && segments.map((s) => <div key={s.label} className={s.color} style={{ width: `${(s.value / total) * 100}%` }} title={`${s.label} : ${s.value}`} />)}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs text-slate-600">
            <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
            <span className="truncate">{s.label}</span>
            <span className="ml-auto font-semibold text-slate-800">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
