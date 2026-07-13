import React from 'react';
import { Recycle } from 'lucide-react';

export const LoadingIcon = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  };
  
  const iconSize = {
    sm: 16,
    md: 32,
    lg: 48
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Outer spinning recycle symbol */}
      <div className="absolute inset-0 animate-[spin_3s_linear_infinite] flex items-center justify-center text-white opacity-70">
        <Recycle className="w-full h-full" strokeWidth={2.5} />
      </div>
      
      {/* Backdrop glow */}
      <div className="absolute inset-0 bg-green-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
    </div>
  );
};

export const LoadingScreen = ({ message = "Chargement..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-green-700 backdrop-blur-sm">
      <LoadingIcon size="lg" />
      <h3 className="mt-6 text-lg font-medium text-white animate-pulse tracking-wide">
        {message}
      </h3>
    </div>
  );
};

export default LoadingScreen;
