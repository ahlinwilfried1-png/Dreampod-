/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowLeft, Shield, Globe, Award, Heart, CheckCircle2, MapPin, Building, Info, Cpu, Coins, ArrowUpRight, Users, FileText, ShieldCheck } from "lucide-react";

interface AboutViewProps {
  onBack: () => void;
}

export default function AboutView({ onBack }: AboutViewProps) {
  return (
    <div id="about-view-container" className="space-y-6 text-slate-800 pb-16">
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <button
          id="about-back-btn"
          onClick={onBack}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">À Propos de Nutrien</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fondation, Siège & Fonctionnement</p>
        </div>
      </div>

      {/* Hero Image Showcase Banner */}
      <div className="rounded-3xl overflow-hidden">
        <div className="relative h-48 sm:h-56 w-full bg-slate-900 overflow-hidden rounded-3xl">
          <img 
            src="/nutrien_headquarters.svg" 
            alt="Siège Social Nutrien Soluções Agrícolas" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
          
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Siège Officiel Certifié</span>
          </div>

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

        <div className="py-3 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Building className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-800">Nutrien Ag Solutions</p>
              <p className="text-[9.5px] text-slate-500 font-semibold">Bâtiment Administratif & Technique</p>
            </div>
          </div>
          <span className="bg-emerald-600 text-white font-black text-[9px] uppercase px-2.5 py-1 rounded-full shrink-0">
            Vérifié 100%
          </span>
        </div>
      </div>

      {/* Main Corporate Presentation Text */}
      <div className="space-y-6 pt-1">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5 pb-2">
          <div className="h-12 w-16 rounded-xl bg-[#16a34a] text-white flex flex-col items-center justify-center p-1 font-sans shrink-0">
            <span className="text-[11px] font-black leading-none tracking-tight italic">Nutrien</span>
            <span className="text-[7.5px] font-bold leading-none tracking-tighter mt-1 uppercase">Ag Solutions</span>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">NUTRIEN Ag Solutions</h3>
            <p className="text-[9.5px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">Leader Mondial de l'Investissement Agricole</p>
          </div>
        </div>

        {/* Section 1: La Fondation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <Award className="h-4 w-4 shrink-0" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-900">1. La Fondation & Notre Mission</h3>
          </div>
          <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed space-y-2 pl-6">
            <p>
              <span className="font-extrabold text-slate-900">Nutrien Ag Solutions</span> est née de la volonté d'investir massivement dans le secteur agro-industriel mondial, en connectant les technologies de pointe de fertilisation et de transformation agricole aux opportunités d'investissement accessibles à tous.
            </p>
            <p>
              Notre mission est de rendre l'investissement agricole simple, transparent et hautement rentable pour tous les résidents d'Afrique de l'Ouest et d'Afrique Centrale (Burkina Faso, Cameroun, Togo, Bénin, Côte d'Ivoire).
            </p>
          </div>
        </div>

        {/* Section 2: Le Siège Social */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <Building className="h-4 w-4 shrink-0" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-900">2. Le Siège Social & Nos Infrastructures</h3>
          </div>
          <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed space-y-2 pl-6">
            <p>
              Le siège principal de Nutrien regroupe l'administration générale, les laboratoires de recherche en intrants agricoles et le centre de supervision technologique des équipements.
            </p>
            <p>
              Nos installations certifiées garantissent la gestion sécurisée des capitaux investis et le suivi automatisé des rendements distribués quotidiennement aux membres.
            </p>
          </div>
        </div>

        {/* Section 3: Contrat & Accord de Partenariat */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <FileText className="h-4 w-4 shrink-0" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-900">3. Contrat de Partenariat International</h3>
          </div>
          <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed space-y-3 pl-0 sm:pl-6">
            <p className="text-xs text-slate-600">
              Nutrien Agriculture s'est associée stratégiquement avec les plus grands géants mondiaux de l'agro-industrie pour garantir la viabilité, la durabilité et la haute performance des investissements.
            </p>

            {/* Contract Image Display Card */}
            <div className="bg-slate-950 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-xl">
              <img 
                src="/accord_partenariat_contrat.svg" 
                alt="Accord de Partenariat International - Nutrien Agriculture" 
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 text-xs sm:text-sm font-semibold text-slate-800 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-1.5">
          <p className="font-extrabold text-emerald-800">💪 Rejoignez Nutrien Ag Solutions dès aujourd'hui !</p>
          <p className="text-slate-600 text-[11px]">
            Avancez sereinement vers la liberté financière avec une plateforme fiable, sécurisée et pensée pour votre succès.
          </p>
        </div>
      </div>

      {/* Corporate Values - Clean text grid */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-1">
          <Shield className="h-5 w-5 text-blue-500" />
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Sécurité Absolue</h4>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Fonds garantis par nos réserves de couverture.</p>
        </div>

        <div className="space-y-1">
          <Globe className="h-5 w-5 text-[#00a3e0]" />
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Panafricain</h4>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Présence au Burkina Faso, Cameroun, Togo, Bénin et Côte d'Ivoire.</p>
        </div>

        <div className="space-y-1">
          <Award className="h-5 w-5 text-amber-500" />
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Excellence</h4>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Élu meilleur service d'investissement mobile.</p>
        </div>

        <div className="space-y-1">
          <Heart className="h-5 w-5 text-red-500" />
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Accessibilité</h4>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Investissement ouvert dès 4 000 FCFA et retraits dès 1 200 FCFA.</p>
        </div>
      </div>
    </div>
  );
}
