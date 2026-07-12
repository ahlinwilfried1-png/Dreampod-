/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Lock, 
  LogOut, 
  Gift, 
  Smartphone, 
  Coins, 
  Wallet, 
  History,
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
  // Bonus Promo Code States
  const [bonusCode, setBonusCode] = useState("");
  const [bonusLoading, setBonusLoading] = useState(false);
  const [bonusSuccess, setBonusSuccess] = useState("");
  const [bonusError, setBonusError] = useState("");

  // Modals States
  const [showRevenuesModal, setShowRevenuesModal] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; type: "success" | "error" | "info"; onClose?: () => void } | null>(null);

  const handleClaimBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    setBonusError("");
    setBonusSuccess("");

    if (!bonusCode.trim()) {
      setBonusError("Saisissez un code bonus tout d'abord.");
      return;
    }

    setBonusLoading(true);
    try {
      const response = await api.claimBonusCode(bonusCode.trim());
      setBonusSuccess(response.message || "Félicitations, code bonus validé !");
      setBonusCode("");
      onRefresh();
    } catch (err: any) {
      setBonusError(err.message || "Code bonus invalide ou expiré.");
    } finally {
      setBonusLoading(false);
    }
  };

  const handlePointage = async () => {
    setCheckingIn(true);
    try {
      const resp = await api.checkIn();
      setAlertModal({
        title: "Pointage Validé !",
        message: resp.message || "Pointage validé ! +20 FCFA ajouté à votre solde.",
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
    <div className="space-y-5 pb-28 text-slate-800 select-none">
      
      {/* Visual Header Account ID & Info Row */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-lg font-black relative">
            {user.name.charAt(0).toUpperCase()}
            <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-[8px] text-amber-950 font-extrabold px-1.5 py-0.5 rounded-full border border-white">
              VIP{maxProductLevel}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-slate-900 leading-tight">{user.name}</h4>
              {user.role === "admin" && (
                <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">Admin</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium font-mono mt-0.5">{user.phone}</p>
          </div>
        </div>
        <div className="bg-slate-50 px-3 py-1.5 rounded-2xl text-[10px] text-slate-500 font-bold font-mono">
          ID: {user.id.toUpperCase().slice(0, 8)}
        </div>
      </div>

      {/* CARD 1: Solde de Retrait Container */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-5">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-slate-400 font-medium text-xs sm:text-sm">Solde de retrait</p>
            <div className="flex items-baseline gap-1.5">
              <h2 className="text-3xl font-black text-[#00a3e0] tracking-tight">
                {user.balance.toLocaleString()}
              </h2>
              <span className="text-sm font-bold text-slate-600">FCFA</span>
            </div>
          </div>
          <button 
            id="profile-retirer-pill-btn"
            onClick={() => setActiveTab("withdraw")}
            className="bg-[#00a3e0] hover:bg-blue-600 active:scale-95 text-white font-black text-xs px-5 py-2.5 rounded-full transition-all flex items-center gap-1 cursor-pointer shadow-sm"
          >
            Retirer &gt;
          </button>
        </div>

        {/* 3 Inline widgets: Commissions, Bonus, Revenus/jour */}
        <div className="grid grid-cols-3 gap-2">
          {/* Commissions Widget */}
          <button 
            onClick={() => setActiveTab("team")}
            className="bg-[#F4F6FA] hover:bg-slate-100 active:scale-98 rounded-2xl p-3 flex flex-col items-center justify-center space-y-1.5 text-center cursor-pointer transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shadow-3xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-extrabold text-slate-500 leading-tight">Commissions</span>
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
            className="bg-[#F4F6FA] hover:bg-slate-100 active:scale-98 rounded-2xl p-3 flex flex-col items-center justify-center space-y-1.5 text-center cursor-pointer transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-3xs">
              <Gift className="h-4 w-4 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-extrabold text-slate-500 leading-tight">Bonus</span>
          </button>

          {/* Revenus/jour Widget */}
          <button 
            onClick={() => setShowRevenuesModal(true)}
            className="bg-[#F4F6FA] hover:bg-slate-100 active:scale-98 rounded-2xl p-3 flex flex-col items-center justify-center space-y-1.5 text-center cursor-pointer transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 shadow-3xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-[10px] font-extrabold text-slate-500 leading-tight">Revenus/jour</span>
          </button>
        </div>
      </div>

      {/* CARD 2: Retrait, Historique, Pointage Grid */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 grid grid-cols-3 gap-2 text-center">
        {/* Retrait */}
        <button 
          onClick={() => setActiveTab("withdraw")}
          className="flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-transform cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-500 shadow-3xs transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-600 leading-tight">Retrait</span>
        </button>

        {/* Historique */}
        <button 
          onClick={() => setActiveTab("history")}
          className="flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-transform cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center text-purple-500 shadow-3xs transition-all">
            <History className="h-5 w-5 stroke-[2]" />
          </div>
          <span className="text-xs font-bold text-slate-600 leading-tight">Historique</span>
        </button>

        {/* Pointage */}
        <button 
          onClick={handlePointage}
          disabled={checkingIn}
          className="flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-transform cursor-pointer group disabled:opacity-60"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-500 shadow-3xs transition-all">
            {checkingIn ? (
              <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Calendar className="h-5 w-5 stroke-[2]" />
            )}
          </div>
          <span className="text-xs font-bold text-slate-600 leading-tight">Pointage</span>
        </button>
      </div>

      {/* CARD 3: Banner Mes Produits */}
      <button
        onClick={() => setActiveTab("products")}
        className="w-full bg-white rounded-3xl overflow-hidden shadow-xs border border-slate-100 flex relative min-h-[95px] text-left cursor-pointer group active:scale-98 transition-all"
      >
        {/* Left text content */}
        <div className="w-[65%] p-5 flex flex-col justify-center z-10 bg-gradient-to-r from-white via-white/95 to-transparent">
          <h3 className="text-base font-black text-slate-900 tracking-tight">Mes produits</h3>
          <p className="text-[11px] text-slate-500 mt-1 font-semibold leading-relaxed">
            Achetez plus d'appareils, gagnez plus de revenus
          </p>
        </div>
        
        {/* Right crop-field photo decoration */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-[42%] bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400')`,
          }}
        />
      </button>

      {/* CARD 4: Section Plus (Grid of 8 Actions) */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4">
        <h3 className="text-base font-black text-slate-900 tracking-tight">Plus</h3>
        
        <div className="grid grid-cols-4 gap-y-6 gap-x-1.5 text-center pt-1.5">
          {/* À propos */}
          <button 
            onClick={() => setActiveTab("about")}
            className="flex flex-col items-center justify-start space-y-2 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shadow-3xs group-hover:bg-blue-100 transition-colors">
              <Info className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600 tracking-tight leading-tight">À propos</span>
          </button>

          {/* Règlement */}
          <button 
            onClick={() => setShowRulesModal(true)}
            className="flex flex-col items-center justify-start space-y-2 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shadow-3xs group-hover:bg-purple-100 transition-colors">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600 tracking-tight leading-tight">Règlement</span>
          </button>

          {/* Historique */}
          <button 
            onClick={() => setActiveTab("history")}
            className="flex flex-col items-center justify-start space-y-2 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shadow-3xs group-hover:bg-cyan-100 transition-colors">
              <History className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600 tracking-tight leading-tight">Historique</span>
          </button>

          {/* Service client */}
          <button 
            onClick={() => setActiveTab("support")}
            className="flex flex-col items-center justify-start space-y-2 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-3xs group-hover:bg-emerald-100 transition-colors">
              <Headphones className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600 tracking-tight leading-tight">Service client</span>
          </button>

          {/* Télécharger */}
          <button 
            onClick={() => {
              setAlertModal({
                title: "Fichier APK Dreampod",
                message: "Téléchargement du fichier APK de l'application Dreampod...\nL'installation démarrera sur votre smartphone Android dès que le fichier est reçu.",
                type: "info"
              });
            }}
            className="flex flex-col items-center justify-start space-y-2 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shadow-3xs group-hover:bg-amber-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-slate-600 tracking-tight leading-tight">Télécharger</span>
          </button>

          {/* Lier carte */}
          <button 
            onClick={() => setActiveTab("bankcard")}
            className="flex flex-col items-center justify-start space-y-2 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shadow-3xs group-hover:bg-rose-100 transition-colors">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600 tracking-tight leading-tight">Lier carte</span>
          </button>

          {/* Modifier MDP */}
          <button 
            onClick={() => setActiveTab("settings")}
            className="flex flex-col items-center justify-start space-y-2 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shadow-3xs group-hover:bg-slate-200 transition-colors">
              <Lock className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600 tracking-tight leading-tight">Modifier MDP</span>
          </button>

          {/* Cadeau */}
          <button 
            onClick={() => {
              const el = document.getElementById("bonus-code-input-field");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
                el.focus();
              }
            }}
            className="flex flex-col items-center justify-start space-y-2 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center shadow-3xs group-hover:bg-pink-100 transition-colors">
              <Gift className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600 tracking-tight leading-tight">Cadeau</span>
          </button>
        </div>

        {/* Dynamic Admin Portal shortcut inside Card 4 if user is administrator */}
        {user.role === "admin" && (
          <div className="pt-3 border-t border-slate-50">
            <button 
              onClick={() => setActiveTab("admin")}
              className="w-full bg-red-50 hover:bg-red-100/80 active:scale-98 text-red-600 font-black text-xs py-2.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="h-4.5 w-4.5" />
              <span>Accéder au Portail Admin</span>
            </button>
          </div>
        )}
      </div>

      {/* Code Cadeau Bonus Activation Block */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-3">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Gift className="h-4 w-4 text-amber-500" />
          <span>Activer un Code Cadeau</span>
        </h4>
        <form onSubmit={handleClaimBonus} className="flex gap-2">
          <input
            id="bonus-code-input-field"
            type="text"
            required
            placeholder="Ex: WELCOME200"
            value={bonusCode}
            onChange={(e) => setBonusCode(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2.5 text-xs uppercase font-mono font-black placeholder-slate-400 focus:outline-none focus:border-[#00a3e0] focus:bg-white"
          />
          <button
            type="submit"
            disabled={bonusLoading}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-xs px-5 py-2.5 rounded-2xl transition-all cursor-pointer disabled:opacity-50"
          >
            {bonusLoading ? "Validation..." : "Valider"}
          </button>
        </form>
        {bonusError && <p className="text-[10px] text-red-500 mt-1 font-bold">⚠️ {bonusError}</p>}
        {bonusSuccess && <p className="text-[10px] text-green-600 mt-1 font-bold">🎉 {bonusSuccess}</p>}
      </div>

      {/* Exclamation styled Déconnexion button */}
      <div className="pt-1">
        <button
          onClick={onLogout}
          className="w-full bg-white border border-slate-100 hover:bg-red-50/20 active:scale-98 rounded-3xl py-4 text-center font-black text-[#00a3e0] hover:text-red-500 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
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
                Sur Dreampod, les revenus de vos machines VIP sont automatiquement crédités sur votre solde principal toutes les 24h. Aucune action manuelle de récolte n'est nécessaire.
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
                Règlement de Dreampod
              </h3>
              <button onClick={() => setShowRulesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 text-slate-700 text-xs leading-relaxed">
              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase mb-1">1. Conditions de Retrait</h4>
                <p className="pl-1">
                  • Le retrait minimum autorisé est de <span className="font-extrabold">1 000 FCFA</span>.<br />
                  • Des frais de service de <span className="text-red-500 font-extrabold">14%</span> s'appliquent sur chaque opération de retrait pour couvrir la passerelle Mobile Money.
                </p>
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase mb-1">2. Conditions de Dépôt</h4>
                <p className="pl-1">
                  • Le dépôt minimum autorisé est de <span className="font-extrabold">4 000 FCFA</span>.<br />
                  • Les dépôts sont instantanément vérifiés après confirmation par le réseau de paiement.
                </p>
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase mb-1">3. Pointage Quotidien</h4>
                <p className="pl-1">
                  • Effectuez votre pointage tous les jours pour recevoir un bonus d'assiduité de <span className="text-emerald-600 font-extrabold">20 FCFA</span>.<br />
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

      {/* Alert Modal */}
      {alertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center text-2xl">
              {alertModal.type === "success" && <div className="text-green-500 text-3xl">✓</div>}
              {alertModal.type === "error" && <div className="text-red-500 text-3xl">⚠️</div>}
              {alertModal.type === "info" && <HelpCircle className="h-10 w-10 text-blue-500" />}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900">{alertModal.title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed whitespace-pre-line">{alertModal.message}</p>
            </div>

            <button
              onClick={() => {
                const action = alertModal.onClose;
                setAlertModal(null);
                if (action) action();
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
