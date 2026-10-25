import { Recycle } from "lucide-react";

export const LoadingIcon = ({ size = "md", className = "" }) => {
  const sizes = { sm: "w-8 h-8", md: "w-14 h-14", lg: "w-20 h-20" };
  return (
    <div className={`relative flex items-center justify-center ${sizes[size]} ${className}`}>
      <div className="absolute inset-0 animate-pulse rounded-full bg-brand-400/30 blur-xl" />
      <Recycle className="relative h-full w-full animate-[spin_3s_linear_infinite] text-white" strokeWidth={2.2} />
    </div>
  );
};

export const LoadingScreen = ({ message = "Chargement..." }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950">
    <LoadingIcon size="lg" />
    <p className="mt-6 text-base font-medium tracking-wide text-brand-50/90">{message}</p>
  </div>
);

export default LoadingScreen;
