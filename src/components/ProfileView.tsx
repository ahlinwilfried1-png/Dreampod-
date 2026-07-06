/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  User as UserIcon, 
  Lock, 
  LogOut, 
  Gift, 
  Smartphone, 
  UserX, 
  Coins, 
  Wallet, 
  Key, 
  TrendingUp, 
  History,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Briefcase,
  ChevronRight,
  Info,
  Calendar,
  Clock,
  Phone,
  AlertCircle,
  ClipboardList,
  Users,
  CreditCard,
  Gem,
  Headphones,
  Building2,
  Send,
  Settings,
  Shield,
  X,
  PlusCircle,
  QrCode
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

const PAYMENT_METHODS = [
  { id: "mtn", name: "MTN Mobile Money 🟡", countries: "Bénin, Cameroun" },
  { id: "orange", name: "Orange Money 🟠", countries: "Cameroun" },
  { id: "moov", name: "Moov Money 🟢", countries: "Bénin, Burkina Faso" },
];

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

  // Menu Interactive Modals States
  const [showRevenuesModal, setShowRevenuesModal] = useState(false);

  const [claiming, setClaiming] = useState(false);

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



  const handleClaimRevenues = async () => {
    if (investments.length === 0) {
      alert("Vous n'avez aucun investissement actif aujourd'hui. Rendez-vous dans l'onglet 'Investir' pour commencer !");
      return;
    }

    setClaiming(true);
    try {
      const resp = await api.claimRevenues();
      alert(resp.message || "Succès lors de la récolte de vos revenus !");
      onRefresh();
      setShowRevenuesModal(false);
    } catch (err: any) {
      alert(err.message || "Vos revenus ont déjà été collectés pour aujourd'hui.");
    } finally {
      setClaiming(false);
    }
  };

  // Determine VIP level based on active investments
  const maxProductLevel = investments.length > 0 ? Math.max(...investments.map(i => {
    // If we have products list, we can search or use level multiplier. Let's make an intuitive calculation or default to Level 1, 2, etc.
    if (user.balance >= 198000) return 4;
    if (user.balance >= 94500) return 3;
    if (user.balance >= 36000) return 2;
    return 1;
  })) : 0;

  return (
    <div className="space-y-5 pb-28 text-slate-800 select-none">
      
      {/* Upper Blue Profile Banner */}
      <div className="bg-gradient-to-tr from-blue-600 via-[#00a3e0] to-blue-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg border border-blue-400/20">
        <div className="absolute -right-12 -top-12 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-36 h-36 bg-blue-900/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          {/* Avatar with gold/VIP outline */}
          <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center text-white text-2xl font-black shadow-md relative">
            {user.name.charAt(0).toUpperCase()}
            <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-[9px] text-amber-900 font-extrabold px-1.5 py-0.5 rounded-full border border-white">
              VIP{maxProductLevel}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 id="profile-user-name" className="text-lg font-black tracking-tight">{user.name}</h3>
              {user.role === "admin" && (
                <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md">Admin</span>
              )}
            </div>
            <p className="text-xs text-blue-100/90 flex items-center gap-1 mt-1 font-mono">
              <Smartphone className="h-3.5 w-3.5" />
              <span>{user.phone}</span>
            </p>
            <div className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold text-blue-50 mt-2">
              <ShieldCheck className="h-3 w-3" />
              ID: {user.id.toUpperCase().slice(0, 8)}
            </div>
          </div>
        </div>

        {/* Balance Display inside the top card */}
        <div className="mt-6 pt-5 border-t border-white/10 relative z-10">
          <p className="text-[10px] uppercase font-black tracking-wider text-blue-100">Solde Total du Portefeuille</p>
          <div className="flex justify-between items-baseline mt-1">
            <h2 id="profile-total-balance" className="text-3xl font-black tracking-tight">
              {user.balance.toLocaleString()} <span className="text-sm font-medium text-blue-100">FCFA</span>
            </h2>
            <span className="text-[10px] font-bold bg-white/20 py-1 px-2.5 rounded-full text-white">
              Actif ⚡
            </span>
          </div>
        </div>
      </div>

      {/* Recharge and Retrait Side-By-Side Card */}
      <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-100 flex items-center justify-between divide-x divide-slate-100/80">
        <button 
          id="profile-action-recharge-btn"
          onClick={() => setActiveTab("deposit")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 hover:bg-slate-50/50 rounded-xl transition-all font-black text-slate-700 text-xs cursor-pointer"
        >
          <span className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
            <Wallet className="h-4 w-4 stroke-[2.5]" />
          </span>
          <span>Recharge &gt;</span>
        </button>

        <button 
          id="profile-action-withdraw-btn"
          onClick={() => setActiveTab("withdraw")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 hover:bg-slate-50/50 rounded-xl transition-all font-black text-slate-700 text-xs cursor-pointer"
        >
          <span className="p-1.5 bg-blue-50 rounded-lg text-blue-500">
            <Coins className="h-4 w-4 stroke-[2.5]" />
          </span>
          <span>Retrait &gt;</span>
        </button>
      </div>

      {/* First Action Row: Grid of 4 columns */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 grid grid-cols-4 gap-2 text-center">
        {/* Commandes */}
        <button 
          onClick={() => setActiveTab("investments")}
          className="flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-transform cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-xs">
            <ClipboardList className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-black text-slate-600 tracking-tight leading-tight">Commandes</span>
        </button>

        {/* Mon Solde */}
        <button 
          onClick={() => setActiveTab("history")}
          className="flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-transform cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shadow-xs">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-black text-slate-600 tracking-tight leading-tight">Mon Solde</span>
        </button>

        {/* Mon Équipe */}
        <button 
          onClick={() => setActiveTab("team")}
          className="flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-transform cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-xs">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-black text-slate-600 tracking-tight leading-tight">Mon Équipe</span>
        </button>

        {/* Carte Bancaire */}
        <button 
          onClick={() => setActiveTab("bankcard")}
          className="flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-transform cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-xs">
            <CreditCard className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-black text-slate-600 tracking-tight leading-tight">Carte Bancaire</span>
        </button>
      </div>

      {/* Mes Revenus Panel Block */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
          <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase">Mes Revenus</h3>
          <button 
            onClick={() => setShowRevenuesModal(true)}
            className="text-[10px] font-black text-[#00a3e0] hover:text-blue-600 flex items-center gap-0.5 cursor-pointer uppercase tracking-wider"
          >
            Détails des Revenus &gt;
          </button>
        </div>

        {/* Solde columns */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-slate-50/50 py-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Solde de Recharge</p>
            <p className="text-sm font-black text-blue-600 mt-1">FCFA0.00</p>
          </div>
          <div className="bg-slate-50/50 py-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Solde de Retrait</p>
            <p className="text-sm font-black text-blue-600 mt-1">FCFA{user.balance.toFixed(2)}</p>
          </div>
        </div>

        <div className="h-[1px] bg-slate-100/85" />

        {/* 3 Analytics Columns */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 leading-tight uppercase">Revenu Produit</p>
            <p className="text-[11px] font-black text-blue-600 mt-1.5 truncate">
              FCFA{user.totalRevenue.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 leading-tight uppercase">Commission</p>
            <p className="text-[11px] font-black text-blue-600 mt-1.5 truncate">
              FCFA{user.commissionEarned.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 leading-tight uppercase">Nombre de Commandes</p>
            <p className="text-[11px] font-black text-blue-600 mt-1.5 font-mono">
              {investments.length}
            </p>
          </div>
        </div>
      </div>

      {/* Plus de services Section */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 space-y-4">
        <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-50 pb-2.5">Plus de services</h3>
        
        <div className="grid grid-cols-4 gap-y-6 gap-x-1 text-center pt-1">
          {/* VIP */}
          <button 
            onClick={() => setActiveTab("vip")}
            className="flex flex-col items-center space-y-1.5 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 shadow-3xs">
              <Gem className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-600 leading-tight">VIP</span>
          </button>

          {/* Centre d'Aide */}
          <button 
            onClick={() => setActiveTab("support")}
            className="flex flex-col items-center space-y-1.5 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#00a3e0] shadow-3xs">
              <Headphones className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-600 leading-tight">Centre d'Aide</span>
          </button>

          {/* À Propos de Nous */}
          <button 
            onClick={() => setActiveTab("about")}
            className="flex flex-col items-center space-y-1.5 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shadow-3xs">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-600 leading-tight leading-none text-center">A Propos de Nous</span>
          </button>

          {/* Telegram */}
          <button 
            onClick={() => window.open("https://t.me/dreampod_chat", "_blank")}
            className="flex flex-col items-center space-y-1.5 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-sky-500 shadow-3xs">
              <Send className="h-5 w-5 -rotate-12 translate-x-0.5" />
            </div>
            <span className="text-[10px] font-bold text-slate-600 leading-tight">Telegram</span>
          </button>

          {/* Paramètres (Password change) */}
          <button 
            onClick={() => setActiveTab("settings")}
            className="flex flex-col items-center space-y-1.5 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shadow-3xs">
              <Settings className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-600 leading-tight">Paramètres</span>
          </button>

          {/* Admin Panel button (only shown to admin) */}
          {user.role === "admin" && (
            <button 
              id="profile-goto-admin-btn"
              onClick={() => setActiveTab("admin")}
              className="flex flex-col items-center space-y-1.5 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shadow-3xs border border-red-100">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black text-red-600 leading-tight">Admin Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* Code Cadeau Bonus Activation Block */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Gift className="h-4 w-4 text-amber-500" />
          <span>Activer un Code Cadeau</span>
        </h4>
        <form onSubmit={handleClaimBonus} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Ex: WELCOME200"
            value={bonusCode}
            onChange={(e) => setBonusCode(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs uppercase font-mono font-black placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={bonusLoading}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {bonusLoading ? "Validation..." : "Valider"}
          </button>
        </form>
        {bonusError && <p className="text-[10px] text-red-500 mt-1.5 font-bold">⚠️ {bonusError}</p>}
        {bonusSuccess && <p className="text-[10px] text-green-600 mt-1.5 font-bold">🎉 {bonusSuccess}</p>}
      </div>

      {/* Exclamation styled Déconnexion button like screenshot */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full bg-white border border-slate-100 hover:bg-red-50/25 rounded-2xl py-3.5 text-center font-black text-blue-600 hover:text-red-500 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
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
                <TrendingUp className="text-cyan-600 h-4 w-4" />
                Collecte des Revenus
              </h3>
              <button onClick={() => setShowRevenuesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-center">
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Vos Revenus du jour</p>
                <h2 className="text-3xl font-black text-[#00a3e0]">
                  +{investments.reduce((acc, inv) => acc + inv.dailyIncome, 0).toLocaleString()} F <span className="text-xs text-slate-400 font-normal">/ Jour</span>
                </h2>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                Vos machines Dreampod tournent en continu. Cliquez sur le bouton ci-dessous pour récolter vos bénéfices passifs cumulés sur votre compte de retrait.
              </p>

              <button
                onClick={handleClaimRevenues}
                disabled={claiming || investments.length === 0}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-black text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {claiming ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                    Collecte en cours...
                  </>
                ) : (
                  <>
                    <Coins className="h-4 w-4" />
                    Récolter les revenus d'aujourd'hui
                  </>
                )}
              </button>

              {investments.length === 0 && (
                <p className="text-[10px] text-red-500 font-bold">
                  ⚠️ Aucun investissement actif. Veuillez activer un plan VIP.
                </p>
              )}
            </div>
          </div>
        </div>
      )}







    </div>
  );
}
