import React, { useState } from "react";

interface ProductImageProps {
  src?: string;
  alt: string;
  level?: number;
  className?: string;
  isBlocked?: boolean;
}

export const getFallbackSvgForLevel = (level: number = 1): string => {
  const mod = level % 3;
  if (mod === 0) return "/nutrien_headquarters.svg";
  if (mod === 2) return "/nutrien_plant.svg";
  return "/nutrien_bag.svg";
};

export default function ProductImage({
  src,
  alt,
  level = 1,
  className = "w-full h-full object-cover",
  isBlocked = false,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const fallbackSvg = getFallbackSvgForLevel(level);

  const initialSrc = src && src.trim() !== "" ? src : fallbackSvg;
  const currentSrc = hasError ? fallbackSvg : initialSrc;
  const isVectorFallback = currentSrc.endsWith(".svg");

  return (
    <img
      src={currentSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
      className={`${className} ${
        isVectorFallback
          ? "object-contain p-2 bg-gradient-to-br from-emerald-50/80 via-slate-50 to-emerald-100/80"
          : "object-cover"
      } ${isBlocked ? "opacity-30 blur-md grayscale-[40%]" : ""}`}
    />
  );
}
