/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowLeft, Gem, Star, ShieldCheck, Zap } from "lucide-react";

interface VipViewProps {
  onBack: () => void;
  setActiveTab: (tab: string) => void;
}

export default function VipView({ onBack, setActiveTab }: VipViewProps) {
  return (
    <div id="vip-view-container" className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3.5">
        <button
          id="vip-back-btn"
          onClick={onBack}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Grades & VIP</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Vos privilèges et niveaux d'investissement</p>
        </div>
      </div>

      {/* Main VIP card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-widest font-black text-indigo-400">Statut Privilège</span>
            <h3 className="text-xl font-black flex items-center gap-1.5 uppercase">
              <Gem className="text-amber-500 h-5 w-5 animate-pulse" />
              GLOBAL VIP CLUB
            </h3>
          </div>
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] px-2.5 py-1 rounded-full font-black uppercase">
            Membres Actifs ⭐
          </span>
        </div>
        <p className="text-xs text-slate-300 font-bold leading-relaxed mt-4 max-w-xs">
          Les grades VIP dépendent de la valeur de vos investissements actifs sur Dreampod. Plus votre grade VIP est élevé, plus vos gains quotidiens et privilèges de parrainage augmentent.
        </p>
      </div>

      {/* VIP Rankings List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-xs space-y-4">
        <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-50 pb-2.5 flex items-center gap-1.5">
          <Star className="h-4 w-4 text-amber-500" />
          Niveaux de Grades VIP
        </h3>

        <div className="space-y-3">
          {[
            {
              level: "VIP 0",
              sub: "Stabilité 1",
              desc: "Machine de base - FCFA 2000",
              perks: "+90 jours d'actifs",
              color: "bg-slate-50 border-slate-100 text-slate-700",
            },
            {
              level: "VIP 1",
              sub: "Stabilité 2",
              desc: "Machine intermédiaire - FCFA 5000",
              perks: "+90 jours d'actifs",
              color: "bg-blue-50/40 border-blue-100/60 text-blue-700",
            },
            {
              level: "VIP 2",
              sub: "Stabilité 3",
              desc: "Machine avancée - FCFA 10000",
              perks: "+90 jours d'actifs",
              color: "bg-emerald-50/40 border-emerald-100/60 text-emerald-700",
            },
            {
              level: "VIP 3",
              sub: "Premium 1",
              desc: "Investissements de Niveau 3",
              perks: "Revenus décuplés ⚡",
              color: "bg-amber-50/40 border-amber-100/60 text-amber-700",
            },
          ].map((v, i) => (
            <div key={i} className={`p-4 rounded-2xl border flex justify-between items-center ${v.color}`}>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase flex items-center gap-1">
                  <span>⭐ {v.level}</span>
                  <span className="text-[9px] opacity-75">({v.sub})</span>
                </p>
                <p className="text-[10px] text-slate-500 font-bold">{v.desc}</p>
              </div>
              <span className="text-[10px] font-black uppercase bg-white/80 border border-slate-200/50 px-2.5 py-1 rounded-full shadow-3xs">
                {v.perks}
              </span>
            </div>
          ))}
        </div>

        <button
          id="vip-go-to-products-btn"
          onClick={() => setActiveTab("products")}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-3 rounded-xl transition-all text-center cursor-pointer uppercase tracking-wider shadow-sm"
        >
          Mettre à niveau (Acheter VIP)
        </button>
      </div>
    </div>
  );
}
