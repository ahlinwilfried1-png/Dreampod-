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
  CheckCircle,
  ChevronRight,
  Dices,
  ClipboardList,
  ArrowUpRight,
  Users,
  Award,
  Download
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
        message: resp.message || `Pointage validé ! +100 ${currency} ajouté à votre solde.`,
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

  // Compute Statistics
  const todayStr = new Date().toISOString().split("T")[0];
  const todayWithdrawals = (transactions || [])
    .filter(t => t.type === "withdrawal" && t.date?.startsWith(todayStr))
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const totalWithdrawals = (transactions || [])
    .filter(t => t.type === "withdrawal")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const dailyRev = user.dailyRevenue || 0;
  const totalRev = user.totalRevenue || 0;

  // List of Big Feature Cards
  const menuCards = [
    {
      id: "card-bankcard",
      title: "Carte bancaire",
      icon: CreditCard,
      iconBg: "bg-amber-100/90 text-amber-600",
      onClick: () => setActiveTab("bankcard"),
    },
    {
      id: "card-wheel",
      title: "Tirage au sort",
      icon: Dices,
      iconBg: "bg-amber-100/90 text-amber-600",
      onClick: () => setActiveTab("wheel"),
    },
    {
      id: "card-gift",
      title: "De l'argent gratuit",
      icon: Gift,
      iconBg: "bg-amber-100/90 text-amber-600",
      onClick: () => setActiveTab("gift"),
    },
    {
      id: "card-history",
      title: "Facture de solde",
      icon: ClipboardList,
      iconBg: "bg-amber-100/90 text-amber-600",
      onClick: () => setActiveTab("history"),
    },
    {
      id: "card-deposit",
      title: "Recharger l'enregistrement",
      icon: Coins,
      iconBg: "bg-amber-100/90 text-amber-600",
      onClick: () => setActiveTab("deposit"),
    },
    {
      id: "card-withdraw",
      title: "Enregistrement des retraits",
      icon: ArrowUpRight,
      iconBg: "bg-amber-100/90 text-amber-600",
      onClick: () => setActiveTab("withdraw_records"),
    },
    {
      id: "card-about",
      title: "À propos",
      icon: Info,
      iconBg: "bg-emerald-100/90 text-emerald-600",
      onClick: () => setActiveTab("about"),
    },
    {
      id: "card-app-download",
      title: "Télécharger l'application APK",
      icon: Smartphone,
      iconBg: "bg-rose-100/90 text-rose-600",
      onClick: () => {
        setAlertModal({
          title: "Fichier APK Nutrien Ag",
          message: "Téléchargement du fichier APK de l'application Nutrien Ag...\nL'installation démarrera sur votre smartphone Android dès que le fichier est reçu.",
          type: "info"
        });
      },
    },
    {
      id: "card-settings",
      title: "Modifier le mot de passe",
      icon: Lock,
      iconBg: "bg-slate-200 text-slate-700",
      onClick: () => setActiveTab("settings"),
    },
  ];

  if (user.role === "admin") {
    menuCards.push({
      id: "card-admin",
      title: "Portail Administrateur",
      icon: Shield,
      iconBg: "bg-red-100 text-red-600",
      onClick: () => setActiveTab("admin"),
    });
  }

  return (
    <div className="space-y-6 text-slate-800 select-none pb-12 pt-1 max-w-md mx-auto px-1">
      
      {/* User Info Strip Header - Borderless & Cardless */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#ff6600]/10 flex items-center justify-center text-[#ff6600] text-sm font-bold relative">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-[8px] text-amber-950 font-bold px-1.5 py-0.2 rounded-full">
              VIP{maxProductLevel}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-900 leading-tight">{user.name}</h4>
              {user.role === "admin" && (
                <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">Admin</span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium font-mono mt-0.5">{user.phone}</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("withdraw")}
          className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1"
        >
          <span>Retirer</span>
          <span>&gt;</span>
        </button>
      </div>

      {/* Main Top Wallet Area matching reference image exact borderless layout */}
      <div className="py-2 space-y-4">
        {/* Card Title Header Row */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0">
            <Wallet className="h-5 w-5 stroke-[2]" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Mon portefeuille
          </h2>
        </div>

        {/* Balance Row */}
        <div className="pt-1">
          <span className="text-slate-500 font-medium text-sm sm:text-base">Équilibre: </span>
          <span className="text-slate-900 font-bold text-3xl sm:text-4xl tracking-tight ml-2">
            {user.balance.toLocaleString()}
          </span>
        </div>

        {/* 4 Statistics Grid (2 Columns x 2 Rows) with Icons */}
        <div className="grid grid-cols-2 gap-3 text-center pt-3">
          {/* Item 1 */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50/80 rounded-2xl space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/90 text-emerald-600 flex items-center justify-center shrink-0">
              <Coins className="h-4.5 w-4.5 stroke-[2]" />
            </div>
            <span className="text-slate-900 font-bold text-base sm:text-lg leading-tight font-mono">
              {dailyRev.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium leading-snug px-1">
              Revenu aujourd'hui(XAF)
            </span>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50/80 rounded-2xl space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100/90 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4.5 w-4.5 stroke-[2]" />
            </div>
            <span className="text-slate-900 font-bold text-base sm:text-lg leading-tight font-mono">
              {totalRev.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium leading-snug px-1">
              Revenu cumulé(XAF)
            </span>
          </div>

          {/* Item 3 */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50/80 rounded-2xl space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100/90 text-rose-600 flex items-center justify-center shrink-0">
              <ArrowUpRight className="h-4.5 w-4.5 stroke-[2]" />
            </div>
            <span className="text-slate-900 font-bold text-base sm:text-lg leading-tight font-mono">
              {todayWithdrawals.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium leading-snug px-1">
              Retirer aujourd'hui(XAF)
            </span>
          </div>

          {/* Item 4 */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50/80 rounded-2xl space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100/90 text-amber-600 flex items-center justify-center shrink-0">
              <History className="h-4.5 w-4.5 stroke-[2]" />
            </div>
            <span className="text-slate-900 font-bold text-base sm:text-lg leading-tight font-mono">
              {totalWithdrawals.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium leading-snug px-1">
              Retraits totaux(XAF)
            </span>
          </div>
        </div>
      </div>

      {/* Feature Actions List - Fully Borderless and Cardless */}
      <div className="space-y-1 pt-2">
        {menuCards.map((card) => {
          const IconComp = card.icon;
          return (
            <button
              id={card.id}
              key={card.id}
              onClick={card.onClick}
              className="w-full py-3.5 px-2 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 rounded-2xl transition-all group active:opacity-75"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                  <IconComp className="h-5 w-5 stroke-[2]" />
                </div>
                <span className="text-sm sm:text-base font-bold text-slate-800 tracking-tight text-left">
                  {card.title}
                </span>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            </button>
          );
        })}

        {/* Déconnexion */}
        <button
          id="card-logout"
          onClick={onLogout}
          className="w-full py-3.5 px-2 flex items-center justify-between cursor-pointer hover:bg-rose-50/50 rounded-2xl transition-all group mt-4 active:opacity-75"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <LogOut className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-sm sm:text-base font-bold text-rose-600 tracking-tight text-left">
              Se déconnecter
            </span>
          </div>
          <ChevronRight className="h-5 w-5 text-rose-400 group-hover:text-rose-600 transition-colors shrink-0" />
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


      {/* 📕 MODAL: RÈGLEMENT */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white p-6 max-w-sm w-full shadow-2xl relative overflow-hidden rounded-3xl border border-slate-100 text-slate-800 flex flex-col max-h-[85vh]">
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between flex-shrink-0">
              <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                <FileText className="text-purple-600 h-4 w-4" />
                Règlement de Nutrien Ag
              </h3>
              <button onClick={() => setShowRulesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 text-slate-700 text-xs leading-relaxed">
              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase mb-1">1. Conditions de Retrait</h4>
                <p className="pl-1">
                  • Le retrait minimum autorisé est de <span className="font-extrabold">1 200 {currency}</span>.<br />
                  • Des frais de service de <span className="text-red-500 font-extrabold">18%</span> s'appliquent sur chaque opération de retrait pour couvrir la passerelle Mobile Money.
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
                  • Effectuez votre pointage tous les jours pour recevoir un bonus d'assiduité de <span className="text-emerald-600 font-extrabold">100 {currency}</span>.<br />
                  • Les gains de pointage sont ajoutés directement à votre solde de retrait.
                </p>
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase mb-1">4. Commission de Parrainage</h4>
                <p className="pl-1">
                  Bénéficiez de commissions lucratives sur les investissements de vos filleuls sur 3 niveaux :<br />
                  • <span className="font-black">Niveau 1 (Direct) :</span> <span className="text-[#ff6600] font-black">15 %</span><br />
                  • <span className="font-black">Niveau 2 :</span> <span className="text-[#ff6600] font-black">2 %</span><br />
                  • <span className="font-black">Niveau 3 :</span> <span className="text-[#ff6600] font-black">1 %</span>
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

      {/* Floating Alert Message Banner */}
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
