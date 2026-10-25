import { Recycle } from "lucide-react";

export default function Brand({ light = false, compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${light ? "bg-white text-brand-700" : "bg-brand-600 text-white"} shadow-sm`}>
        <Recycle size={19} strokeWidth={2.4} />
      </div>
      {!compact && (
        <div className="whitespace-nowrap leading-tight">
          <p className={`font-display text-[15px] font-extrabold ${light ? "text-white" : "text-slate-900"}`}>WasteTracker</p>
          <p className={`text-[10px] font-medium uppercase tracking-[0.14em] ${light ? "text-brand-200" : "text-brand-700"}`}>YDOL Ingénierie</p>
        </div>
      )}
    </div>
  );
}
