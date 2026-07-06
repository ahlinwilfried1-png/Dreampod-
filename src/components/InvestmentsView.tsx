/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowLeft, Calendar, ClipboardList } from "lucide-react";
import { Investment } from "../types";

interface InvestmentsViewProps {
  investments: Investment[];
  onBack: () => void;
  setActiveTab: (tab: string) => void;
}

export default function InvestmentsView({ investments, onBack, setActiveTab }: InvestmentsViewProps) {
  return (
    <div id="investments-view-container" className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3.5">
        <button
          id="investments-back-btn"
          onClick={onBack}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Vos Commandes</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Vos plans d'investissements actifs</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-xs space-y-4">
        <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-50 pb-2.5 flex items-center gap-1.5">
          <ClipboardList className="h-4 w-4 text-blue-500" />
          Liste des Commandes ({investments.length})
        </h3>

        {investments.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-3xl">📋</div>
            <p className="text-xs text-slate-500 leading-relaxed font-bold">
              Vous n'avez pas encore d'investissement actif. Achetez un plan VIP pour commencer à générer des revenus passifs quotidiens !
            </p>
            <button
              id="investments-go-to-plans-btn"
              onClick={() => setActiveTab("products")}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black py-2.5 px-5 rounded-xl cursor-pointer uppercase tracking-wider transition-all"
            >
              Voir les plans
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {investments.map((inv) => (
              <div id={`investment-item-${inv.id}`} key={inv.id} className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    {inv.productName}
                  </span>
                  <span className="text-[9px] bg-green-50 text-green-600 border border-green-100 py-0.5 px-2.5 rounded-full font-black uppercase">
                    En cours ⚡
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 font-bold">
                  <div>
                    <p className="text-[10px] text-slate-400 font-normal uppercase">Revenu quotidien :</p>
                    <p className="font-extrabold text-green-600 text-xs">+{inv.dailyIncome.toLocaleString()} F</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-normal uppercase">Gains récoltés :</p>
                    <p className="font-extrabold text-blue-600 text-xs">{(inv.dailyIncome * inv.daysPassed).toLocaleString()} F</p>
                  </div>
                  <div className="col-span-2 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(inv.activatedAt).toLocaleDateString()}
                    </span>
                    <span>Durée : {inv.durationDays} jours</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
