/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, ClipboardList, PackageCheck, TrendingUp, Sparkles, Clock } from "lucide-react";
import { Investment } from "../types";
import { getCurrencySymbol } from "../lib/currency";
import ProductImage from "./ProductImage";

interface InvestmentsViewProps {
  investments: Investment[];
  onBack: () => void;
  setActiveTab: (tab: string) => void;
  userPhone?: string;
}

export default function InvestmentsView({ investments, onBack, setActiveTab, userPhone }: InvestmentsViewProps) {
  const currency = getCurrencySymbol(userPhone);
  const [nowTime, setNowTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.price, 0);
  const totalDailyRevenue = investments.reduce((sum, inv) => sum + inv.dailyIncome, 0);
  const totalCollected = investments.reduce((sum, inv) => {
    const isWellbeing = inv.category === "wellbeing" || 
                        inv.productName?.toLowerCase().includes("bien-être") || 
                        inv.productName?.toLowerCase().includes("wellbeing") ||
                        inv.productName?.toLowerCase().includes("agricole") ||
                        inv.productName?.toLowerCase().includes("lait");
    if (isWellbeing) {
      return sum + (inv.daysPassed >= inv.durationDays ? (inv.totalIncome || inv.dailyIncome * inv.durationDays) : 0);
    }
    return sum + (inv.dailyIncome * inv.daysPassed);
  }, 0);

  return (
    <div id="investments-view-container" className="space-y-4 select-none pb-6">
      {/* Back Header */}
      <div className="flex items-center justify-between bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <button
            id="investments-back-btn"
            onClick={onBack}
            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-emerald-600" />
              Mes Commandes
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {investments.length} Produit{investments.length > 1 ? "s" : ""} Acheté{investments.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full">
          Actif
        </span>
      </div>

      {/* Summary KPI banner */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white p-2.5 rounded-2xl shadow-2xs">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Total Investi</span>
          <span className="text-xs font-black text-slate-900 font-mono mt-0.5 block">{totalInvested.toLocaleString()} {currency}</span>
        </div>
        <div className="bg-emerald-50/80 p-2.5 rounded-2xl shadow-2xs">
          <span className="text-[9px] font-extrabold text-emerald-800 uppercase block">Revenu / Jour</span>
          <span className="text-xs font-black text-emerald-700 font-mono mt-0.5 block">+{totalDailyRevenue.toLocaleString()} {currency}</span>
        </div>
        <div className="bg-orange-50/80 p-2.5 rounded-2xl shadow-2xs">
          <span className="text-[9px] font-extrabold text-orange-800 uppercase block">Gains Récoltés</span>
          <span className="text-xs font-black text-orange-600 font-mono mt-0.5 block">{totalCollected.toLocaleString()} {currency}</span>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="bg-white rounded-3xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase pb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4 text-emerald-600" />
            Produits Achetés ({investments.length})
          </span>
          <span className="text-[10px] text-emerald-600 font-extrabold">Versement Automatique 24h</span>
        </h3>

        {investments.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center text-3xl shadow-inner">
              🛍️
            </div>
            <div className="space-y-1 max-w-xs mx-auto">
              <p className="text-xs font-black text-slate-900">Aucune commande active</p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                Vous n'avez pas encore acheté de produit. Découvrez nos offres sur l'Accueil et commencez à générer des revenus passifs !
              </p>
            </div>
            <button
              id="investments-go-to-plans-btn"
              onClick={() => setActiveTab("dashboard")}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-black py-3 px-6 rounded-2xl cursor-pointer uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 active:scale-98 inline-flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Voir les Offres sur l'Accueil</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {investments.map((inv) => {
              const isWellbeing = inv.category === "wellbeing" || 
                                  inv.productName?.toLowerCase().includes("bien-être") || 
                                  inv.productName?.toLowerCase().includes("wellbeing") ||
                                  inv.productName?.toLowerCase().includes("agricole") ||
                                  inv.productName?.toLowerCase().includes("lait");
              const isCompleted = inv.daysPassed >= inv.durationDays;
              const currentGains = isWellbeing
                ? (isCompleted ? (inv.totalIncome || inv.dailyIncome * inv.durationDays) : 0)
                : (inv.dailyIncome * inv.daysPassed);

              // 24h cycle progress calculation
              const ONE_DAY_MS = 24 * 60 * 60 * 1000;
              const lastClaimTs = inv.lastClaimAt ? new Date(inv.lastClaimAt).getTime() : new Date(inv.activatedAt).getTime();
              const elapsedMs = Math.max(0, nowTime - lastClaimTs);
              const currentCycleMs = elapsedMs % ONE_DAY_MS;
              const cycle24hPct = isCompleted ? 100 : Math.min(100, Math.floor((currentCycleMs / ONE_DAY_MS) * 100));

              const remainingMs = ONE_DAY_MS - currentCycleMs;
              const remHours = Math.floor(remainingMs / (1000 * 60 * 60));
              const remMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
              const remSecs = Math.floor((remainingMs % (1000 * 60)) / 1000);
              const countdownStr = `${String(remHours).padStart(2, '0')}h ${String(remMins).padStart(2, '0')}m ${String(remSecs).padStart(2, '0')}s`;

              return (
                <div 
                  id={`investment-item-${inv.id}`} 
                  key={inv.id} 
                  className="p-3.5 bg-slate-50/70 rounded-2xl space-y-3 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center overflow-hidden shrink-0">
                        <ProductImage alt={inv.productName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 leading-tight">
                          {inv.productName}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-500">
                          Acheté pour : <span className="text-emerald-700 font-black">{inv.price.toLocaleString()} {currency}</span>
                        </p>
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="text-[9px] bg-slate-200/80 text-slate-700 py-1 px-2.5 rounded-full font-black uppercase flex items-center gap-1">
                        Cycle Terminé ✅
                      </span>
                    ) : isWellbeing ? (
                      <span className="text-[9px] bg-amber-100 text-amber-900 py-1 px-2.5 rounded-full font-black uppercase flex items-center gap-1">
                        Fin de Cycle ⏳
                      </span>
                    ) : (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 py-1 px-2.5 rounded-full font-black uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Génère ⚡
                      </span>
                    )}
                  </div>

                  {/* 24h Cycle Progress Bar */}
                  <div className="space-y-1 bg-emerald-50/80 p-2.5 rounded-xl">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-700">
                      <span className="flex items-center gap-1 text-emerald-800">
                        <Clock className="h-3.5 w-3.5 text-emerald-600 animate-spin" style={{ animationDuration: "8s" }} />
                        Progression du versement 24h
                      </span>
                      {isCompleted ? (
                        <span className="text-slate-500 font-extrabold">100% • Terminé</span>
                      ) : (
                        <span className="text-emerald-700 font-mono font-extrabold">
                          {cycle24hPct}% • Versement dans {countdownStr}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${cycle24hPct}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl font-bold shadow-2xs">
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Type de Versement :</p>
                      <p className="font-black text-emerald-600 text-xs font-mono">
                        {isWellbeing ? "À la fin du cycle" : `+${inv.dailyIncome.toLocaleString()} ${currency}/j`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Gains Récoltés :</p>
                      <p className="font-black text-orange-600 text-xs font-mono">{currentGains.toLocaleString()} {currency}</p>
                    </div>
                    {isWellbeing && (
                      <div className="col-span-2 pt-1.5 text-[10px] text-amber-800 font-medium">
                        {isCompleted
                          ? "✅ Le revenu du produit bien-être a été versé à 100%. Effectuez un nouveau rechargement pour souscrire à nouveau !"
                          : "⏳ Le revenu total sera crédité en une seule fois à l'achèvement des " + inv.durationDays + " jours."
                        }
                      </div>
                    )}
                    <div className="col-span-2 pt-2 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        Date : {new Date(inv.activatedAt).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="text-slate-600 font-bold">Contrat : Jour {inv.daysPassed}/{inv.durationDays}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

