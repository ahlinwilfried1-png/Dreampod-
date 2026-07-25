/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowLeft, Calendar, ClipboardList, PackageCheck, TrendingUp, Sparkles } from "lucide-react";
import { Investment } from "../types";
import { getCurrencySymbol } from "../lib/currency";

interface InvestmentsViewProps {
  investments: Investment[];
  onBack: () => void;
  setActiveTab: (tab: string) => void;
  userPhone?: string;
}

export default function InvestmentsView({ investments, onBack, setActiveTab, userPhone }: InvestmentsViewProps) {
  const currency = getCurrencySymbol(userPhone);
  const totalInvested = investments.reduce((sum, inv) => sum + inv.price, 0);
  const totalDailyRevenue = investments.reduce((sum, inv) => sum + inv.dailyIncome, 0);
  const totalCollected = investments.reduce((sum, inv) => sum + (inv.dailyIncome * inv.daysPassed), 0);

  return (
    <div id="investments-view-container" className="space-y-4 select-none pb-6">
      {/* Back Header */}
      <div className="flex items-center justify-between bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border-2 border-emerald-500/20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            id="investments-back-btn"
            onClick={onBack}
            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-all cursor-pointer border border-emerald-200"
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

        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-300">
          Actif
        </span>
      </div>

      {/* Summary KPI banner */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Total Investi</span>
          <span className="text-xs font-black text-slate-900 font-mono mt-0.5 block">{totalInvested.toLocaleString()} {currency}</span>
        </div>
        <div className="bg-emerald-50/80 p-2.5 rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-[9px] font-extrabold text-emerald-800 uppercase block">Revenu / Jour</span>
          <span className="text-xs font-black text-emerald-700 font-mono mt-0.5 block">+{totalDailyRevenue.toLocaleString()} {currency}</span>
        </div>
        <div className="bg-orange-50/80 p-2.5 rounded-2xl border border-orange-200 shadow-2xs">
          <span className="text-[9px] font-extrabold text-orange-800 uppercase block">Gains Récoltés</span>
          <span className="text-xs font-black text-orange-600 font-mono mt-0.5 block">{totalCollected.toLocaleString()} {currency}</span>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="bg-white rounded-3xl p-4 border-2 border-slate-200/80 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase border-b border-slate-100 pb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4 text-emerald-600" />
            Produits Achetés ({investments.length})
          </span>
          <span className="text-[10px] text-emerald-600 font-extrabold">Rendement Automatique 24h</span>
        </h3>

        {investments.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center text-3xl shadow-inner border border-emerald-200">
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
              const progressPct = Math.min(100, Math.round((inv.daysPassed / (inv.durationDays || 30)) * 100));
              const currentGains = inv.dailyIncome * inv.daysPassed;

              return (
                <div 
                  id={`investment-item-${inv.id}`} 
                  key={inv.id} 
                  className="p-3.5 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 border-2 border-emerald-500/20 rounded-2xl space-y-3 shadow-2xs hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100/80 border border-emerald-300 flex items-center justify-center p-1">
                        <img src="/public/nutrien_bag.svg" alt="Produit" className="h-full object-contain" />
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

                    <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 py-1 px-2.5 rounded-full font-black uppercase flex items-center gap-1 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Génère ⚡
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500">
                      <span>Progression du contrat</span>
                      <span className="text-emerald-700">{inv.daysPassed} / {inv.durationDays} Jours ({progressPct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-200/60 font-bold">
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Revenu / Jour :</p>
                      <p className="font-black text-emerald-600 text-xs font-mono">+{inv.dailyIncome.toLocaleString()} {currency}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Cumul des Gains :</p>
                      <p className="font-black text-orange-600 text-xs font-mono">{currentGains.toLocaleString()} {currency}</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        Date : {new Date(inv.activatedAt).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="text-slate-600 font-bold">Durée : {inv.durationDays}J</span>
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

