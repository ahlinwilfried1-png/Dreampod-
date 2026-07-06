/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  PlusCircle, 
  ArrowDownCircle, 
  History, 
  TrendingUp, 
  Users, 
  Megaphone, 
  Bell, 
  Wallet, 
  Cpu, 
  X, 
  Grid, 
  ArrowUpRight, 
  Coins,
  CheckCircle,
  HelpCircle,
  Gift
} from "lucide-react";
import { User, Transaction, Investment, Product } from "../types";
import { api } from "../lib/api";

interface DashboardViewProps {
  user: User;
  investments: Investment[];
  transactions: Transaction[];
  products: Product[];
  onRefresh: () => void;
  setActiveTab: (tab: string) => void;
}

const DYNAMIC_MESSAGES = [
  "🚀 RECHARGEZ ET INVESTISSEMENT : Plus de 40% de retour sur investissement mensuel avec nos plans VIP sécurisés !",
  "💸 DES RETRAITS RAPIDES : Vos gains sont transférés sur vos comptes MTN Mobile Money, Orange Money et Moov Money sous 2H maximum.",
  "🎁 PARRAINEZ ET GAGNEZ : Progressez en invitant vos amis. Gagnez 10% sur tous leurs dépôts directs !",
];

const PAYMENT_METHODS = [
  { id: "mtn", name: "MTN Mobile Money 🟡", countries: "Bénin, Cameroun" },
  { id: "orange", name: "Orange Money 🟠", countries: "Cameroun" },
  { id: "moov", name: "Moov Money 🟢", countries: "Bénin, Burkina Faso" },
];

export default function DashboardView({ 
  user, 
  investments, 
  transactions, 
  products, 
  onRefresh,
  setActiveTab
}: DashboardViewProps) {
  // Banners carousel state
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // UI states
  const [claiming, setClaiming] = useState(false);

  // Spin Wheel State
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelError, setWheelError] = useState("");
  const [wheelSuccess, setWheelSuccess] = useState("");

  const handleSpinWheel = async () => {
    if (isSpinning) return;
    setWheelError("");
    setWheelSuccess("");
    setIsSpinning(true);

    try {
      const resp = await api.spinWheel();
      
      const prizeIndex = resp.prize.index;
      // Index ranges 0 to 5. Each is 60 deg. Target pointer center is at top (12 o'clock)
      const targetAngle = 360 - (prizeIndex * 60 + 30);
      // We want to do 5 complete spins + target angle
      const finalDeg = rotation + 1800 + targetAngle - (rotation % 360);
      setRotation(finalDeg);

      setTimeout(() => {
        setIsSpinning(false);
        setWheelSuccess(resp.message);
        onRefresh();
      }, 4100);

    } catch (err: any) {
      setIsSpinning(false);
      setWheelError(err.message || "Une erreur est survenue lors du lancement de la roue.");
    }
  };

  // Rotate banner message automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % DYNAMIC_MESSAGES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);



  const handleClaimRevenues = async () => {
    if (investments.length === 0) {
      alert("Vous n'avez aucun investissement actif aujourd'hui. Rendez-vous dans l'onglet 'Produits' pour investir !");
      return;
    }

    setClaiming(true);
    try {
      const resp = await api.claimRevenues();
      alert(resp.message || "Succès lors de la récolte !");
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Vos revenus ont déjà été collectés pour aujourd'hui.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 text-slate-800">
      
      {/* Main Balance Card (Glass combined with blue highlight) */}
      <div className="relative p-6 rounded-3xl shadow-md bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
        {/* Glow backdrop effect */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] uppercase tracking-widest font-black text-blue-100 flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" />
              Solde du Portefeuille
            </p>
            <h2 id="dashboard-total-balance" className="text-4xl font-extrabold tracking-tight mt-2 text-white flex items-baseline">
              {user.balance.toLocaleString()} <span className="text-lg font-medium text-blue-200 ml-1.5">FCFA</span>
            </h2>
          </div>
          
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[9px] py-1 px-2.5 bg-white/15 rounded-full text-white font-bold">
              ● Compte Sécurisé
            </span>
            <p className="text-[9px] text-blue-100 mt-2">Inclus Bonus bienvenue</p>
          </div>
        </div>

        {/* Dashboard Actions Row */}
        <div className="grid grid-cols-4 gap-2.5 mt-8">
          <button
            id="dash-action-deposit"
            onClick={() => setActiveTab("deposit")}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-black shadow-sm active:scale-95 cursor-pointer transition-all"
          >
            <PlusCircle className="h-5 w-5 mb-1 text-blue-600" />
            <span className="text-[10px]">Dépôt</span>
          </button>
          
          <button
            id="dash-action-withdraw"
            onClick={() => setActiveTab("withdraw")}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-black border border-white/10 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowDownCircle className="h-5 w-5 mb-1 text-red-200" />
            <span className="text-[10px]">Retrait</span>
          </button>

          <button
            id="dash-action-recharge"
            onClick={() => setActiveTab("deposit")}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-black border border-white/10 transition-all active:scale-95 cursor-pointer"
          >
            <Cpu className="h-5 w-5 mb-1 text-cyan-200 animate-pulse" />
            <span className="text-[10px]">Recharger</span>
          </button>

          <button
            id="dash-action-history"
            onClick={() => setActiveTab("history")}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-black border border-white/10 transition-all active:scale-95 cursor-pointer"
          >
            <History className="h-5 w-5 mb-1 text-blue-100" />
            <span className="text-[10px]">Historique</span>
          </button>
        </div>
      </div>

      {/* Claim Machine Earnings Container */}
      {investments.length > 0 && (
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center p-3.5 bg-green-50 border border-green-100 rounded-full text-green-600">
              <Cpu className="h-5 w-5 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Vos machines tournent ({investments.length})</p>
              <p className="text-xs font-bold text-green-600 mt-0.5">+{user.dailyRevenue.toLocaleString()} FCFA récoltables / jour</p>
            </div>
          </div>
          
          <button
            id="btn-collect-revenues"
            onClick={handleClaimRevenues}
            disabled={claiming}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-green-600/10 text-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {claiming ? (
              <div className="h-3.5 w-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Récolter Revenus ({investments.length})</span>
            )}
          </button>
        </div>
      )}

      {/* --- ROUE DE LA CHANCE (LUCKY WHEEL) --- */}
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs text-center relative overflow-hidden">
        {/* Decorative corner tag */}
        <div className="absolute top-0 right-0 py-1 px-3.5 bg-amber-500 rounded-bl-xl text-[9px] font-extrabold uppercase tracking-widest text-white flex items-center gap-1">
          <Gift className="h-3 w-3" />
          {user.spinsAvailable || 0} { (user.spinsAvailable || 0) > 1 ? "Tickets" : "Ticket" }
        </div>

        <div className="max-w-xs mx-auto">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center justify-center gap-1.5">
            🎡 Roue de la Fortune
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Gagnez 1 ticket de tirage gratuit pour chaque filleul direct qui investit sur la plateforme !
          </p>

          {/* Ticket stats */}
          <div className="mt-3 grid grid-cols-3 gap-1 bg-slate-50 rounded-xl p-2 border border-slate-100/80 text-[10px] text-slate-600 font-bold">
            <div className="text-center">
              <span className="block text-slate-400 text-[9px] uppercase">Filleuls</span>
              <span className="text-xs text-slate-900 font-black">{user.investedReferralsCount || 0} inv.</span>
            </div>
            <div className="text-center border-x border-slate-200">
              <span className="block text-slate-400 text-[9px] uppercase">Tirés</span>
              <span className="text-xs text-slate-900 font-black">{user.spinsUsed || 0} fois</span>
            </div>
            <div className="text-center">
              <span className="block text-slate-400 text-[9px] uppercase">Tickets</span>
              <span className="text-xs text-blue-600 font-black">{user.spinsAvailable || 0} rest.</span>
            </div>
          </div>

          {/* Wheel Frame */}
          <div className="relative my-6 w-64 h-64 mx-auto">
            {/* Top Pointer */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 filter drop-shadow-md">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 21L4 7H20L12 21Z" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
              </svg>
            </div>

            {/* SVG Wheel */}
            <svg viewBox="0 0 200 200" className="w-full h-full select-none overflow-visible">
              {/* Outer shining dots / neon ring */}
              <circle cx="100" cy="100" r="99" fill="none" stroke="#f1f5f9" strokeWidth="2" />
              <circle cx="100" cy="100" r="97" fill="#1e293b" />
              
              {/* Rotating slices group */}
              <g 
                className="transition-transform duration-[4000ms] ease-out" 
                style={{ 
                  transform: `rotate(${rotation}deg)`, 
                  transformOrigin: "100px 100px" 
                }}
              >
                {/* Slices of the wheel (Total of 6 slices of 60 degrees each) */}
                {/* Slice 0: 50 F (Blue) */}
                <path d="M 100 100 L 100 0 A 100 100 0 0 1 186.6 50 Z" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" />
                {/* Slice 1: 100 F (Green) */}
                <path d="M 100 100 L 186.6 50 A 100 100 0 0 1 186.6 150 Z" fill="#10b981" stroke="#1e293b" strokeWidth="2" />
                {/* Slice 2: 200 F (Amber) */}
                <path d="M 100 100 L 186.6 150 A 100 100 0 0 1 100 200 Z" fill="#f59e0b" stroke="#1e293b" strokeWidth="2" />
                {/* Slice 3: 500 F (Pink) */}
                <path d="M 100 100 L 100 200 A 100 100 0 0 1 13.4 150 Z" fill="#ec4899" stroke="#1e293b" strokeWidth="2" />
                {/* Slice 4: 1000 F (Purple) */}
                <path d="M 100 100 L 13.4 150 A 100 100 0 0 1 13.4 50 Z" fill="#8b5cf6" stroke="#1e293b" strokeWidth="2" />
                {/* Slice 5: Essayer encore (Red) */}
                <path d="M 100 100 L 13.4 50 A 100 100 0 0 1 100 0 Z" fill="#ef4444" stroke="#1e293b" strokeWidth="2" />

                {/* Slices text labels */}
                {[
                  { idx: 0, label: "50 F" },
                  { idx: 1, label: "100 F" },
                  { idx: 2, label: "200 F" },
                  { idx: 3, label: "500 F" },
                  { idx: 4, label: "1000 F" },
                  { idx: 5, label: "0 F" },
                ].map((item) => (
                  <g key={item.idx} transform={`rotate(${item.idx * 60 + 30}, 100, 100)`}>
                    <text
                      x="100"
                      y="32"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="900"
                      textAnchor="middle"
                      className="font-sans select-none tracking-tight"
                    >
                      {item.label}
                    </text>
                  </g>
                ))}

                {/* Shimmer overlay inner circles */}
                <circle cx="100" cy="100" r="15" fill="#000000" opacity="0.15" />
              </g>

              {/* Center Pin Hub (Unrotated) */}
              <circle cx="100" cy="100" r="22" fill="#0f172a" stroke="#ffffff" strokeWidth="3.5" />
              {/* Golden Center Accent */}
              <circle cx="100" cy="100" r="8" fill="#fbbf24" />
            </svg>
          </div>

          {/* Messages & Actions */}
          <div className="space-y-3">
            {wheelError && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-[11px] font-bold border border-red-100">
                ⚠️ {wheelError}
              </div>
            )}

            {wheelSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-100 animate-bounce">
                🎉 {wheelSuccess}
              </div>
            )}

            {(user.spinsAvailable || 0) <= 0 ? (
              <div className="space-y-1">
                <button
                  disabled
                  className="w-full bg-slate-100 text-slate-400 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  Aucun ticket disponible 🎫
                </button>
                <p className="text-[9.5px] text-slate-400 font-bold leading-relaxed px-2">
                  Invitez vos amis avec votre code de parrainage. Lorsqu'ils activent un plan VIP, vous obtenez 1 ticket de tirage !
                </p>
              </div>
            ) : (
              <button
                onClick={handleSpinWheel}
                disabled={isSpinning}
                className="w-full bg-gradient-to-r from-blue-600 to-[#00a3e0] text-white py-3 rounded-2xl text-xs font-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSpinning ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                    <span>La roue tourne...</span>
                  </>
                ) : (
                  <>
                    <span>Tourner la Roue ({user.spinsAvailable}) 🚀</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inbox Notifications Panel */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
        <h3 className="text-xs font-black text-[#00a3e0] uppercase tracking-widest flex items-center gap-1.5 mb-4 px-1">
          <Bell className="h-4 w-4" />
          Notifications Globales
        </h3>
        
        <div className="space-y-4">
          {/* Default notice 1 */}
          <div className="flex space-x-3 items-start border-b border-slate-100 pb-4 last:border-0 last:pb-0">
            <div className="w-2.5 h-2.5 mt-1.5 bg-[#00a3e0] rounded-full animate-pulse" />
            <div>
              <p className="text-xs font-extrabold text-slate-900">🔥 Bonus d'inscription : 200 FCFA Offerts !</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Félicitations, votre compte a été crédité de 200 FCFA. Investissez dès maintenant dans les plans d'investissement sécurisés VIP pour récolter des gains automatiques.
              </p>
            </div>
          </div>

          {/* Default notice 2 */}
          <div className="flex space-x-3 items-start border-b border-slate-100 pb-4 last:border-0 last:pb-0">
            <div className="w-2.5 h-2.5 mt-1.5 bg-slate-400 rounded-full" />
            <div>
              <p className="text-xs font-extrabold text-slate-800">💰 Parrainage Multiniveau Actif</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Maximisez vos revenus d'affiliation ! Partagez votre lien exclusif et gagnez automatiques : Niveau 1 (10%), Niveau 2 (5%), Niveau 3 (2%) directement transférés sur vos portefeuilles dès le dépôt de vos filleuls.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Promotion Banner (Moved to the bottom) */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl overflow-hidden relative shadow-xs">
        <div className="absolute top-0 right-0 py-1 px-3 bg-blue-600 rounded-bl-xl text-[9px] font-extrabold uppercase tracking-widest text-white flex items-center gap-1">
          <Megaphone className="h-3 w-3" />
          Annonce
        </div>
        <div className="flex items-start gap-3 mt-1">
          <div className="p-2 rounded-xl bg-blue-50 text-[#00a3e0] shrink-0 select-none">
            <Coins className="h-5 w-5 animate-bounce" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-black text-[#00a3e0]">Dreampod Actu</h4>
            <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed min-h-[36px] transition-all duration-500">
              {DYNAMIC_MESSAGES[currentMessageIndex]}
            </div>
          </div>
        </div>
        {/* Carousel indicators */}
        <div className="flex gap-1 justify-end mt-2">
          {DYNAMIC_MESSAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentMessageIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === currentMessageIndex ? "bg-blue-500 w-3" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
