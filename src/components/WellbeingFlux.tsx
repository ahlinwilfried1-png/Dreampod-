/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { Flame, Lock } from "lucide-react";
import { Product } from "../types";
import ProductImage from "./ProductImage";

interface WellbeingFluxProps {
  products: Product[];
  currency: string;
  onInvest: (product: Product) => void;
  getSubscribedCount: (productId: string) => number;
}

const PRODUCT_THEMES = [
  {
    containerBg: "bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-900",
    cardBorder: "border-emerald-200/80 shadow-emerald-900/20",
    badgeBg: "bg-emerald-500 text-white",
    incomeColor: "text-emerald-600",
    btnBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
    flameColor: "bg-emerald-500 text-white",
  },
  {
    containerBg: "bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900",
    cardBorder: "border-blue-200/80 shadow-blue-900/20",
    badgeBg: "bg-blue-500 text-white",
    incomeColor: "text-blue-600",
    btnBg: "bg-blue-600 hover:bg-blue-700 text-white",
    flameColor: "bg-blue-500 text-white",
  },
  {
    containerBg: "bg-gradient-to-br from-amber-700 via-amber-800 to-slate-900",
    cardBorder: "border-amber-200/80 shadow-amber-900/20",
    badgeBg: "bg-amber-400 text-slate-950",
    incomeColor: "text-amber-600",
    btnBg: "bg-amber-600 hover:bg-amber-700 text-white",
    flameColor: "bg-amber-500 text-slate-950",
  },
  {
    containerBg: "bg-gradient-to-br from-teal-700 via-cyan-800 to-slate-900",
    cardBorder: "border-teal-200/80 shadow-teal-900/20",
    badgeBg: "bg-teal-500 text-white",
    incomeColor: "text-teal-600",
    btnBg: "bg-teal-600 hover:bg-teal-700 text-white",
    flameColor: "bg-teal-500 text-white",
  }
];

export default function WellbeingFlux({
  products,
  currency,
  onInvest,
  getSubscribedCount,
}: WellbeingFluxProps) {
  // Take exactly 2 products (or construct fallback 2 products if empty)
  const displayProducts = products.length >= 2 ? products.slice(0, 2) : products;

  const defaultDetails = [
    {
      name: "Produits Agricoles Gold",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Lait Pur Milk Platinum",
      image: "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=800&q=80",
    }
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Scroll to index
  const scrollToIndex = (idx: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.clientWidth;
    container.scrollTo({
      left: idx * cardWidth,
      behavior: "smooth",
    });
    setActiveIdx(idx);
  };

  // Detect active index on scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.clientWidth;
    if (cardWidth > 0) {
      const current = Math.round(container.scrollLeft / cardWidth);
      if (current !== activeIdx && current >= 0 && current < displayProducts.length) {
        setActiveIdx(current);
      }
    }
  };

  // Auto slide automatically every 3 seconds continuously
  useEffect(() => {
    if (displayProducts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => {
        const next = (prev + 1) % displayProducts.length;
        if (scrollRef.current) {
          const cardWidth = scrollRef.current.clientWidth;
          scrollRef.current.scrollTo({ left: next * cardWidth, behavior: "smooth" });
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [displayProducts.length]);

  const currentTheme = PRODUCT_THEMES[activeIdx % PRODUCT_THEMES.length];

  return (
    <div
      id="wellbeing-products-container"
      className={`${currentTheme.containerBg} rounded-3xl p-3.5 sm:p-4 shadow-md space-y-3 select-none text-slate-800 relative group transition-all duration-500`}
    >
      {/* Header Title & Slide Indicator Dots (Without <> controls) */}
      <div className="flex flex-col items-center justify-center text-center px-1 space-y-1">
        <h3 className="text-white font-extrabold text-base sm:text-lg tracking-tight leading-tight">
          Produit bien être
        </h3>
        {/* Slide Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          {displayProducts.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeIdx === i ? "w-5 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Horizontal Carousel Feed of Wellbeing Products */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-3.5 scrollbar-none snap-x snap-mandatory py-1 px-0.5 scroll-smooth touch-pan-x"
      >
        {displayProducts.map((prod, index) => {
          const detail = defaultDetails[index % defaultDetails.length];
          const theme = PRODUCT_THEMES[index % PRODUCT_THEMES.length];
          const isCarImage = prod.image?.includes("photo-1541899481282") || prod.image?.includes("photo-1552519507");
          const isCarName = prod.name?.toLowerCase().includes("voiture");
          const rawName = (prod.name && !isCarName) ? prod.name : detail.name;
          // Strip hyphens from product name
          const productName = rawName.replace(/-/g, " ");
          const productImage = (prod.image && !isCarImage) ? prod.image : detail.image;
          const cycle = prod.durationDays || prod.cycleDays || 3;
          const daily = prod.dailyIncome || 30000;
          const total = prod.totalIncome || (daily * cycle);
          const price = prod.price || 30000;
          const isBlocked = prod.isBlocked;

          return (
            <div
              key={prod.id || index}
              className={`w-full shrink-0 snap-center rounded-2xl p-3 sm:p-3.5 space-y-2.5 border transition-all ${
                isBlocked ? "bg-slate-100/90 border-slate-300/80 opacity-80" : `bg-white ${theme.cardBorder}`
              }`}
            >
              {/* Product Image Container with Flame Badge */}
              <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-slate-100/90">
                <ProductImage
                  src={productImage}
                  alt={productName}
                  level={prod.level || (index + 1)}
                  isBlocked={isBlocked}
                  className="w-full h-full"
                />

                {/* Top-left Flame HOT Badge - Per-product color */}
                <div className={`absolute top-2 left-2 ${theme.flameColor} font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs z-10`}>
                  <Flame className="h-3 w-3 fill-current" />
                  <span className="leading-none">HOT</span>
                </div>

                {isBlocked && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-2 text-center z-20">
                    <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-lg border border-amber-300">
                      <Lock className="h-3 w-3" />
                      DÉSACTIVÉ
                    </span>
                  </div>
                )}
              </div>

              {/* Product Title */}
              <h4 className={`text-left text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight pt-0.5 ${isBlocked ? "blur-[1px]" : ""}`}>
                {productName}
              </h4>

              {/* 3 Columns Statistics (Blurred if isBlocked) */}
              <div className={`grid grid-cols-3 gap-1 items-baseline pt-0.5 ${isBlocked ? "blur-[2px] opacity-70 select-none" : ""}`}>
                {/* Column 1: Cycle */}
                <div className="text-center">
                  <p className="text-xs font-extrabold text-slate-900">
                    {cycle} <span className="font-semibold">Jours</span>
                  </p>
                  <p className="text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5">
                    Cycle unique
                  </p>
                </div>

                {/* Column 2: Daily Income */}
                <div className="text-center">
                  <p className={`text-xs font-extrabold ${theme.incomeColor}`}>
                    {daily.toLocaleString()}
                  </p>
                  <p className="text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5">
                    Revenu quotidien
                  </p>
                </div>

                {/* Column 3: Total Income */}
                <div className="text-center">
                  <p className={`text-xs font-extrabold ${theme.incomeColor}`}>
                    {total.toLocaleString()}
                  </p>
                  <p className="text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5">
                    Revenu versé
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onInvest(prod)}
                disabled={isBlocked}
                className={`w-full py-2.5 px-3 rounded-xl text-white font-extrabold text-sm transition-all cursor-pointer shadow-2xs active:scale-98 flex items-center justify-center gap-2 ${
                  isBlocked
                    ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                    : theme.btnBg
                }`}
              >
                {isBlocked ? (
                  <>
                    <Lock className="h-3.5 w-3.5" /> Verrouillé
                  </>
                ) : (
                  <span>
                    {price.toLocaleString()}{currency}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

