"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import EmptyState, { ErrorState } from "./EmptyState";
import { TableSkeleton } from "./Skeleton";

export function SearchInput({ value, onChange, placeholder = "Rechercher…", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input className="field pl-9" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

/** Filtres sous forme de pastilles, avec compteur optionnel. */
export function FilterPills({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100/80 p-1">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition ${
              active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={`rounded-md px-1.5 text-[11px] ${active ? "bg-brand-50 text-brand-700" : "bg-slate-200/70 text-slate-500"}`}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Tableau de données générique.
 * columns : [{ key, header, render?(row), className?, hideOnMobile? }]
 */
export function DataTable({ columns, rows, loading, error, onRetry, onRowClick, empty, pageSize = 10, rowKey = (r) => r.id }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil((rows?.length || 0) / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = useMemo(() => (rows || []).slice(current * pageSize, current * pageSize + pageSize), [rows, current, pageSize]);

  if (loading) return <TableSkeleton cols={Math.min(columns.length, 5)} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!rows?.length) return empty || <EmptyState />;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-head">
              {columns.map((c) => (
                <th key={c.key} className={`whitespace-nowrap px-5 py-3 ${c.hideOnMobile ? "hidden md:table-cell" : ""} ${c.className || ""}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={rowKey(row)}
                className={`table-row ${onRowClick ? "cursor-pointer" : ""}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-5 py-3.5 align-middle text-slate-700 ${c.hideOnMobile ? "hidden md:table-cell" : ""} ${c.className || ""}`}>
                    {c.render ? c.render(row) : row[c.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
          <span>
            {current * pageSize + 1}–{Math.min((current + 1) * pageSize, rows.length)} sur {rows.length}
          </span>
          <div className="flex items-center gap-1">
            <button className="btn-ghost px-2 py-1.5" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Page précédente">
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 text-slate-700">
              {current + 1} / {pages}
            </span>
            <button className="btn-ghost px-2 py-1.5" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} aria-label="Page suivante">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Menu d'actions compact pour une ligne. */
export function RowActions({ children }) {
  return (
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}

export function IconButton({ icon, label, onClick, tone = "slate", disabled }) {
  const tones = {
    slate: "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
    red: "text-slate-400 hover:bg-red-50 hover:text-red-600",
    green: "text-slate-500 hover:bg-brand-50 hover:text-brand-700",
  };
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled} className={`rounded-lg p-2 transition disabled:opacity-40 ${tones[tone]}`}>
      {icon}
    </button>
  );
}
