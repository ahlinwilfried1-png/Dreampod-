/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Building2, ArrowLeft, Shield, Globe, Award, Heart } from "lucide-react";

interface AboutViewProps {
  onBack: () => void;
}

export default function AboutView({ onBack }: AboutViewProps) {
  return (
    <div id="about-view-container" className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3.5">
        <button
          id="about-back-btn"
          onClick={onBack}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">À Propos de Nous</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Qui nous sommes et notre vision</p>
        </div>
      </div>

      {/* Main Corporate Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-6">
        {/* Brand identity */}
        <div className="flex flex-col items-center text-center space-y-3.5 pb-6 border-b border-slate-100">
          <div className="h-16 w-16 rounded-2xl bg-[#00a3e0] text-white flex flex-col items-center justify-center p-1.5 font-sans shadow-md">
            <span className="text-[9px] font-light leading-none tracking-tight">charles</span>
            <span className="text-[11px] font-black leading-none tracking-tighter mt-1">SCHWAB</span>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Dreampod & Charles Schwab</h3>
            <p className="text-[10px] text-[#00a3e0] font-black uppercase tracking-widest mt-1">Alliance Stratégique Internationale</p>
          </div>
        </div>

        {/* Vision paragraphs */}
        <div className="space-y-4 text-xs font-bold text-slate-500 leading-relaxed">
          <p>
            Dreampod est une initiative panafricaine majeure lancée en partenariat stratégique exclusif avec des leaders mondiaux du courtage et de l'investissement financier, à l'instar du géant américain <span className="text-slate-800 font-extrabold">Charles Schwab</span>.
          </p>

          <p>
            Notre mission fondamentale consiste à démocratiser, simplifier et sécuriser l'accès aux placements financiers à hauts rendements garantis pour les résidents d'Afrique de l'Ouest et d'Afrique Centrale. Nous brisons les barrières d'accès traditionnelles en acceptant directement les paiements et retraits par Mobile Money.
          </p>

          <p>
            En unissant nos forces avec des partenaires d'infrastructure Cloud et de minage cryptographique, nous assurons une valorisation pérenne des capitaux déposés, offrant ainsi des retours passifs fixes et stables versés de manière ininterrompue au quotidien.
          </p>
        </div>
      </div>

      {/* Corporate Values Bento Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-2xs space-y-2">
          <Shield className="h-6 w-6 text-blue-500" />
          <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Sécurité Absolue</h4>
          <p className="text-[9.5px] text-slate-400 font-bold leading-relaxed">Fonds garantis à 100% par des dépôts fiduciaires de couverture.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-2xs space-y-2">
          <Globe className="h-6 w-6 text-[#00a3e0]" />
          <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Panafricain</h4>
          <p className="text-[9.5px] text-slate-400 font-bold leading-relaxed">Présence active dans plus de 8 pays d'Afrique francophone.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-2xs space-y-2">
          <Award className="h-6 w-6 text-amber-500" />
          <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Excellence</h4>
          <p className="text-[9.5px] text-slate-400 font-bold leading-relaxed">Élu meilleur service d'investissement mobile de l'année.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-2xs space-y-2">
          <Heart className="h-6 w-6 text-red-500" />
          <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Accessibilité</h4>
          <p className="text-[9.5px] text-slate-400 font-bold leading-relaxed">Dépôts et placements de fonds ouverts à tous dès 1 000 F.</p>
        </div>
      </div>
    </div>
  );
}
