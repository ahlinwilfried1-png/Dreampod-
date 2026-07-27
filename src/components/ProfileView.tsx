/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Lock, 
  LogOut, 
  Gift, 
  Smartphone, 
  Coins, 
  Wallet, 
  History,
  Activity,
  ShieldCheck,
  Calendar,
  Headphones,
  Settings,
  Shield,
  X,
  Info,
  CreditCard,
  User as UserIcon,
  HelpCircle,
  TrendingUp,
  FileText,
  CheckCircle
} from "lucide-react";
import { User, Transaction, Investment } from "../types";
import { api } from "../lib/api";
import { getCurrencySymbol } from "../lib/currency";

interface ProfileViewProps {
  user: User;
  investments: Investment[];
  transactions: Transaction[];
  onRefresh: () => void;
  onLogout: () => void;
  setActiveTab: (tab: string) => void;
}

export default function ProfileView({ 
  user, 
  investments, 
  transactions, 
  onRefresh, 
  onLogout,
  setActiveTab
}: ProfileViewProps) {
  const currency = getCurrencySymbol(user.phone);

  // Modals States
  const [showRevenuesModal, setShowRevenuesModal] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; type: "success" | "error" | "info"; onClose?: () => void } | null>(null);

  useEffect(() => {
    if (alertModal) {
      const timer = setTimeout(() => {
        const action = alertModal.onClose;
        setAlertModal(null);
        if (action) action();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alertModal]);

  const handlePointage = async () => {
    setCheckingIn(true);
    try {
      const resp = await api.checkIn();
      setAlertModal({
        title: "Pointage Validé !",
        message: resp.message || `Pointage validé ! +20 ${currency} ajouté à votre solde.`,
        type: "success",
        onClose: () => onRefresh()
      });
    } catch (err: any) {
      setAlertModal({
        title: "Déjà Pointé",
        message: err.message || "Vous avez déjà effectué votre pointage aujourd'hui. Revenez demain !",
        type: "error"
      });
    } finally {
      setCheckingIn(false);
    }
  };

  // Determine VIP level based on active investments
  const maxProductLevel = investments.length > 0 ? Math.max(...investments.map(i => {
    if (user.balance >= 198000) return 4;
    if (user.balance >= 94500) return 3;
    if (user.balance >= 36000) return 2;
    return 1;
  })) : 0;

  return (
    <div className="space-y-5 text-slate-800 select-none pb-4">
      
      {/* Visual Header Account ID & Info Row */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#00a3e0] text-sm font-black relative">
            {user.name.charAt(0).toUpperCase()}
            <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-[7px] text-amber-950 font-extrabold px-1 py-0.5 rounded-full border border-white">
              VIP{maxProductLevel}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">{user.name}</h4>
              {user.role === "admin" && (
                <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">Admin</span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium font-mono mt-0.5">{user.phone}</p>
          </div>
        </div>
        <div className="bg-blue-50/60 px-2.5 py-1 rounded-xl text-[9px] text-blue-600 font-bold font-mono border border-blue-100">
          ID: {user.id.toUpperCase().slice(0, 8)}
        </div>
      </div>

      {/* Solde de Retrait Section */}
      <div className="py-2 border-b border-slate-200/60 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <p className="text-slate-400 font-bold text-xs">Solde disponible</p>
            <div className="flex items-baseline gap-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-[#00a3e0] tracking-tight">
                {user.balance.toLocaleString()}
              </h2>
              <span className="text-xs font-bold text-slate-600">{currency}</span>
            </div>
          </div>
          <button 
            id="profile-retirer-pill-btn"
            onClick={() => setActiveTab("withdraw")}
            className="bg-[#00a3e0] hover:bg-blue-600 active:scale-95 text-white font-black text-xs px-4 py-2 rounded-full transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            Retirer &gt;
          </button>
        </div>

        {/* 3 Inline widgets: Commissions, Bonus, Revenus/jour */}
        <div className="grid grid-cols-3 gap-2">
          {/* Commissions Widget */}
          <button 
            onClick={() => setActiveTab("team")}
            className="bg-slate-100/80 hover:bg-slate-200/80 active:scale-98 rounded-xl p-2.5 flex flex-col items-center justify-center space-y-1 text-center cursor-pointer transition-all border border-slate-200/50"
          >
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-extrabold text-slate-600 leading-tight">Commissions</span>
          </button>

          {/* Bonus Widget */}
          <button 
            onClick={() => {
              const el = document.getElementById("bonus-code-input-field");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
                el.focus();
              }
            }}
            className="bg-slate-100/80 hover:bg-slate-200/80 active:scale-98 rounded-xl p-2.5 flex flex-col items-center justify-center space-y-1 text-center cursor-pointer transition-all border border-slate-200/50"
          >
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <Gift className="h-4 w-4 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-extrabold text-slate-600 leading-tight">Bonus</span>
          </button>

          {/* Revenus/jour Widget */}
          <button 
            onClick={() => setShowRevenuesModal(true)}
            className="bg-slate-100/80 hover:bg-slate-200/80 active:scale-98 rounded-xl p-2.5 flex flex-col items-center justify-center space-y-1 text-center cursor-pointer transition-all border border-slate-200/50"
          >
            <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-[10px] font-extrabold text-slate-600 leading-tight">Revenus/jour</span>
          </button>
        </div>
      </div>

      {/* Retrait, Activité, Pointage, Roue Grid */}
      <div className="py-3 border-b border-slate-200/60 grid grid-cols-4 gap-1 text-center">
        {/* Retrait */}
        <button 
          onClick={() => setActiveTab("withdraw")}
          className="flex flex-col items-center justify-center space-y-1.5 hover:scale-105 transition-transform cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100/70 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-slate-700 leading-tight">Retrait</span>
        </button>

        {/* Activité */}
        <button 
          onClick={() => setActiveTab("investments")}
          className="flex flex-col items-center justify-center space-y-1.5 hover:scale-105 transition-transform cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100/70 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-all">
            <Activity className="h-4.5 w-4.5 stroke-[2]" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 leading-tight">Activité</span>
        </button>

        {/* Roue de la Fortune */}
        <button 
          onClick={() => setActiveTab("wheel")}
          className="flex flex-col items-center justify-center space-y-1.5 hover:scale-105 transition-transform cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100/70 group-hover:bg-amber-100 flex items-center justify-center text-amber-600 transition-all text-sm">
            🎡
          </div>
          <span className="text-[10px] font-bold text-slate-700 leading-tight">Roue</span>
        </button>

        {/* Pointage */}
        <button 
          onClick={handlePointage}
          disabled={checkingIn}
          className="flex flex-col items-center justify-center space-y-1.5 hover:scale-105 transition-transform cursor-pointer group disabled:opacity-60"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100/70 group-hover:bg-purple-100 flex items-center justify-center text-purple-600 transition-all">
            {checkingIn ? (
              <div className="h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Calendar className="h-4.5 w-4.5 stroke-[2]" />
            )}
          </div>
          <span className="text-[10px] font-bold text-slate-700 leading-tight">Pointage</span>
        </button>
      </div>

      {/* Banner Mes Produits */}
      <button
        onClick={() => setActiveTab("products")}
        className="w-full rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs flex relative min-h-[76px] text-left cursor-pointer group active:scale-98 transition-all my-2"
      >
        {/* Left text content */}
        <div className="w-[65%] p-3.5 flex flex-col justify-center z-10 bg-gradient-to-r from-white via-white/95 to-transparent">
          <h3 className="text-sm font-black text-slate-900 tracking-tight">Formules d'Investissement</h3>
          <p className="text-[10px] text-slate-500 mt-0.5 font-semibold leading-snug">
            Souscrivez à nos offres pour générer des revenus quotidiens garantis.
          </p>
        </div>
        
        {/* Right crop-field photo decoration */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-[42%] bg-gradient-to-l from-emerald-600 to-emerald-500 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400')`,
          }}
        />
      </button>

      {/* Section Services & Informations */}
      <div className="py-3 border-b border-slate-200/60 space-y-3">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Services & Informations</h3>
        
        <div className="grid grid-cols-4 gap-y-5 gap-x-1.5 text-center pt-1">
          {/* À propos */}
          <button 
            onClick={() => setActiveTab("about")}
            className="flex flex-col items-center justify-start space-y-1.5 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Info className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10.5px] font-bold text-slate-700 tracking-tight leading-tight">À propos</span>
          </button>

          {/* Règlement */}
          <button 
            onClick={() => setShowRulesModal(true)}
            className="flex flex-col items-center justify-start space-y-1.5 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100/70 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10.5px] font-bold text-slate-700 tracking-tight leading-tight">Règlement</span>
          </button>

          {/* Historique */}
          <button 
            onClick={() => setActiveTab("history")}
            className="flex flex-col items-center justify-start space-y-1.5 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-cyan-100/70 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
              <History className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10.5px] font-bold text-slate-700 tracking-tight leading-tight">Historique</span>
          </button>

          {/* Télécharger */}
          <button 
            onClick={() => {
              setAlertModal({
                title: "Fichier APK Nutrien",
                message: "Téléchargement du fichier APK de l'application Nutrien...\nL'installation démarrera sur votre smartphone Android dès que le fichier est reçu.",
                type: "info"
              });
            }}
            className="flex flex-col items-center justify-start space-y-1.5 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100/70 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <span className="text-[10.5px] font-bold text-slate-700 tracking-tight leading-tight">Télécharger</span>
          </button>

          {/* Lier carte */}
          <button 
            onClick={() => setActiveTab("bankcard")}
            className="flex flex-col items-center justify-start space-y-1.5 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-rose-100/70 text-rose-600 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
              <CreditCard className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10.5px] font-bold text-slate-700 tracking-tight leading-tight">Lier carte</span>
          </button>

          {/* Modifier MDP */}
          <button 
            onClick={() => setActiveTab("settings")}
            className="flex flex-col items-center justify-start space-y-1.5 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-200/80 text-slate-600 flex items-center justify-center group-hover:bg-slate-300 transition-colors">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10.5px] font-bold text-slate-700 tracking-tight leading-tight">Modifier MDP</span>
          </button>

          {/* Cadeau */}
          <button 
            onClick={() => setActiveTab("gift")}
            className="flex flex-col items-center justify-start space-y-1.5 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-pink-100/70 text-pink-600 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
              <Gift className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10.5px] font-bold text-slate-700 tracking-tight leading-tight">Cadeau</span>
          </button>

          {/* Certificat */}
          <button 
            onClick={() => setActiveTab("proofs")}
            className="flex flex-col items-center justify-start space-y-1.5 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100/70 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10.5px] font-bold text-slate-700 tracking-tight leading-tight">Certificat</span>
          </button>
        </div>

        {/* Dynamic Admin Portal shortcut if user is administrator */}
        {user.role === "admin" && (
          <div className="pt-2">
            <button 
              onClick={() => setActiveTab("admin")}
              className="w-full bg-red-50 hover:bg-red-100/80 active:scale-98 text-red-600 font-black text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-200/60"
            >
              <Shield className="h-4 w-4" />
              <span>Accéder au Portail Admin</span>
            </button>
          </div>
        )}
      </div>


      {/* Déconnexion button */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full bg-slate-100/80 border border-slate-200/80 hover:bg-red-50 active:scale-98 rounded-xl py-3 text-center font-black text-[#00a3e0] hover:text-red-500 transition-all cursor-pointer flex items-center justify-center gap-1"
        >
          <span>(!) Déconnexion</span>
        </button>
      </div>


      {/* ====================================================================== */}
      {/* 📈 MODAL: REVENUS DETAILS & COLLECTION */}
      {showRevenuesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white p-6 max-w-sm w-full shadow-2xl relative overflow-hidden rounded-3xl border border-slate-100 text-slate-800">
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="text-[#00a3e0] h-4 w-4" />
                Vos Revenus VIP
              </h3>
              <button onClick={() => setShowRevenuesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-center select-none">
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Production journalière</p>
                <h2 className="text-3xl font-black text-[#00a3e0]">
                  +{investments.reduce((acc, inv) => acc + inv.dailyIncome, 0).toLocaleString()} F <span className="text-xs text-slate-400 font-normal">/ Jour</span>
                </h2>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                Sur Nutrien, les revenus de vos machines VIP sont automatiquement crédités sur votre solde principal toutes les 24h. Aucune action manuelle de récolte n'est nécessaire.
              </p>

              <div className="w-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                Distribution Automatique Active
              </div>

              {investments.length === 0 && (
                <p className="text-[10px] text-red-500 font-bold">
                  ⚠️ Aucun investissement actif actuellement.
                </p>
              )}
            </div>
          </div>
        </div>
      )}


      {/* 📕 MODAL: RÈGLEMENT (DREAMPOD RULES) */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white p-6 max-w-sm w-full shadow-2xl relative overflow-hidden rounded-3xl border border-slate-100 text-slate-800 flex flex-col max-h-[85vh]">
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between flex-shrink-0">
              <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                <FileText className="text-purple-600 h-4 w-4" />
                Règlement de Nutrien
              </h3>
              <button onClick={() => setShowRulesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 text-slate-700 text-xs leading-relaxed">
              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase mb-1">1. Conditions de Retrait</h4>
                <p className="pl-1">
                  • Le retrait minimum autorisé est de <span className="font-extrabold">1 000 {currency}</span>.<br />
                  • Des frais de service de <span className="text-red-500 font-extrabold">14%</span> s'appliquent sur chaque opération de retrait pour couvrir la passerelle Mobile Money.
                </p>
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase mb-1">2. Conditions de Dépôt</h4>
                <p className="pl-1">
                  • Le dépôt minimum autorisé est de <span className="font-extrabold">4 000 {currency}</span>.<br />
                  • Les dépôts sont instantanément vérifiés après confirmation par le réseau de paiement.
                </p>
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase mb-1">3. Pointage Quotidien</h4>
                <p className="pl-1">
                  • Effectuez votre pointage tous les jours pour recevoir un bonus d'assiduité de <span className="text-emerald-600 font-extrabold">20 {currency}</span>.<br />
                  • Les gains de pointage sont ajoutés directement à votre solde de retrait.
                </p>
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase mb-1">4. Commission de Parrainage</h4>
                <p className="pl-1">
                  Bénéficiez de commissions lucratives sur les investissements de vos filleuls sur 3 niveaux :<br />
                  • <span className="font-black">Niveau 1 (Direct) :</span> <span className="text-[#00a3e0] font-black">20 %</span><br />
                  • <span className="font-black">Niveau 2 :</span> <span className="text-[#00a3e0] font-black">3 %</span><br />
                  • <span className="font-black">Niveau 3 :</span> <span className="text-[#00a3e0] font-black">1 %</span>
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Frameless Floating Message Banner (No modal box frame) */}
      {alertModal && (
        <div 
          onClick={() => {
            const action = alertModal.onClose;
            setAlertModal(null);
            if (action) action();
          }}
          className="fixed top-4 inset-x-3 sm:inset-x-auto sm:right-4 sm:max-w-md z-[100] cursor-pointer animate-slide-down select-none"
        >
          <div className={`p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-white backdrop-blur-md transition-all ${
            alertModal.type === "success" 
              ? "bg-emerald-600/95" 
              : alertModal.type === "error" 
              ? "bg-rose-600/95" 
              : "bg-slate-900/95"
          }`}>
            <div className="shrink-0 h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
              {alertModal.type === "success" && <div className="text-white text-base font-black">✓</div>}
              {alertModal.type === "error" && <div className="text-white text-base font-black">⚠️</div>}
              {alertModal.type === "info" && <HelpCircle className="h-5 w-5 text-white" />}
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-black uppercase tracking-wider text-white/90 leading-tight">
                {alertModal.title}
              </p>
              <p className="text-xs font-bold text-white leading-snug mt-0.5 whitespace-pre-line">
                {alertModal.message}
              </p>
            </div>
            <button className="shrink-0 text-white/80 hover:text-white p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
