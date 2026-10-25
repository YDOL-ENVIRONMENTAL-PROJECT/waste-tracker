import { initials } from "@/lib/format";

const SIZES = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg", xl: "h-24 w-24 text-2xl" };

export default function Avatar({ person, src, size = "md", online, className = "" }) {
  const image = src ?? person?.profilePicture;
  return (
    <div className={`relative shrink-0 ${className}`}>
      <div className={`${SIZES[size]} flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-semibold text-white`}>
        {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : initials(person)}
      </div>
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white ${online ? "bg-emerald-500" : "bg-slate-300"}`} />
      )}
    </div>
  );
}
