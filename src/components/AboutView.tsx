/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowLeft, Shield, Globe, Award, Heart, CheckCircle2, MapPin, Building } from "lucide-react";

interface AboutViewProps {
  onBack: () => void;
}

export default function AboutView({ onBack }: AboutViewProps) {
  return (
    <div id="about-view-container" className="space-y-5">
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <button
          id="about-back-btn"
          onClick={onBack}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">À Propos de Nous</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Qui nous sommes et nos infrastructures</p>
        </div>
      </div>

      {/* Nutrien Headquarters Building Hero Showcase Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="relative h-48 sm:h-56 w-full bg-slate-900 overflow-hidden">
          <img 
            src="/public/nutrien_headquarters.svg" 
            alt="Siège Social Nutrien Soluções Agrícolas" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
          />
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
          
          {/* Top Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-400/30 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-2xs">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Siège Officiel Certifié</span>
          </div>

          {/* Bottom Title inside Image */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <MapPin className="h-3 w-3 text-emerald-400" />
              <span>Nutrien Soluções Agrícolas</span>
            </div>
            <h3 className="text-sm sm:text-base font-black tracking-tight text-white leading-tight">
              Infrastructures & Centre de Direction
            </h3>
          </div>
        </div>

        <div className="p-4 bg-emerald-50/50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Building className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-800">Nutrien Ag Solutions</p>
              <p className="text-[9.5px] text-slate-500 font-semibold">Bâtiment Administratif & Technique</p>
            </div>
          </div>
          <span className="bg-emerald-600 text-white font-black text-[9px] uppercase px-2.5 py-1 rounded-full shrink-0 shadow-2xs">
            Vérifié 100%
          </span>
        </div>
      </div>

      {/* Main Corporate Presentation Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/60 shadow-2xs space-y-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <div className="h-12 w-16 rounded-xl bg-[#16a34a] text-white flex flex-col items-center justify-center p-1 font-sans shadow-xs shrink-0">
            <span className="text-[11px] font-black leading-none tracking-tight italic">Nutrien</span>
            <span className="text-[7.5px] font-bold leading-none tracking-tighter mt-1 uppercase">Ag Solutions</span>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">NUTRIEN Ag Solutions</h3>
            <p className="text-[9.5px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">Leader Mondial de l'Investissement Agricole</p>
          </div>
        </div>

        {/* Vision paragraphs */}
        <div className="space-y-3 text-[11px] font-medium text-slate-600 leading-relaxed">
          <p>
            Nutrien Ag Solutions est une initiative d'investissement agricole majeure dédiée au développement de solutions de croissance et d'engrais haute performance.
          </p>

          <p>
            Notre mission fondamentale consiste à démocratiser, simplifier et sécuriser l'accès aux placements financiers à hauts rendements garantis pour les résidents d'Afrique de l'Ouest et d'Afrique Centrale. Nous brisons les barrières d'accès traditionnelles en acceptant directement les paiements et retraits par Mobile Money.
          </p>

          <p>
            En unissant nos forces avec nos infrastructures certifiées et nos partenaires industriels, nous assurons une valorisation pérenne des capitaux déposés, offrant ainsi des retours passifs fixes et stables versés de manière ininterrompue au quotidien.
          </p>
        </div>
      </div>

      {/* Corporate Values Bento Row */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs space-y-1.5">
          <Shield className="h-5 w-5 text-blue-500" />
          <h4 className="text-[10.5px] font-black text-slate-800 uppercase tracking-wide">Sécurité Absolue</h4>
          <p className="text-[9px] text-slate-400 font-bold leading-relaxed">Fonds garantis à 100% par des dépôts fiduciaires de couverture.</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs space-y-1.5">
          <Globe className="h-5 w-5 text-[#00a3e0]" />
          <h4 className="text-[10.5px] font-black text-slate-800 uppercase tracking-wide">Panafricain</h4>
          <p className="text-[9px] text-slate-400 font-bold leading-relaxed">Présence active au Cameroun, Bénin, Togo, Burkina Faso, Côte d'Ivoire et Niger.</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs space-y-1.5">
          <Award className="h-5 w-5 text-amber-500" />
          <h4 className="text-[10.5px] font-black text-slate-800 uppercase tracking-wide">Excellence</h4>
          <p className="text-[9px] text-slate-400 font-bold leading-relaxed">Élu meilleur service d'investissement mobile de l'année.</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs space-y-1.5">
          <Heart className="h-5 w-5 text-red-500" />
          <h4 className="text-[10.5px] font-black text-slate-800 uppercase tracking-wide">Accessibilité</h4>
          <p className="text-[9px] text-slate-400 font-bold leading-relaxed">Dépôts et placements de fonds ouverts à tous dès 3 000 F.</p>
        </div>
      </div>
    </div>
  );
}
