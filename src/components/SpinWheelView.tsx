import React, { useState, useEffect } from "react";
import { ArrowLeft, Gift, Sparkles, HelpCircle } from "lucide-react";
import { User } from "../types";
import { api } from "../lib/api";

interface SpinWheelViewProps {
  user: User;
  onRefresh: () => void;
  onBack: () => void;
}

interface WheelWinnerItem {
  id: string;
  phone: string;
  amount: string;
  timeAgo: string;
  isNew?: boolean;
}

const PHONE_PREFIXES = [
  "+229 97", "+229 96", "+229 51", "+229 62", "+229 61",
  "+237 69", "+237 67", "+237 65", "+237 68",
  "+225 07", "+225 05", "+225 01",
  "+228 90", "+228 91", "+228 92",
  "+226 70", "+226 76"
];

const AMOUNTS = [
  "50 XOF", "100 XOF", "200 XOF", "500 XOF", "1 000 XOF",
  "100 XAF", "200 XAF", "500 XAF", "1 000 XAF"
];

function generateRandomWinner(): WheelWinnerItem {
  const prefix = PHONE_PREFIXES[Math.floor(Math.random() * PHONE_PREFIXES.length)];
  const suffix = Math.floor(10 + Math.random() * 89);
  const amount = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];
  return {
    id: "w_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    phone: `${prefix}****${suffix}`,
    amount,
    timeAgo: "À l'instant",
    isNew: true,
  };
}

const INITIAL_WINNERS: WheelWinnerItem[] = [
  { id: "init_1", phone: "+229 97****42", amount: "500 XOF", timeAgo: "il y a 3s" },
  { id: "init_2", phone: "+237 69****81", amount: "1 000 XAF", timeAgo: "il y a 8s" },
  { id: "init_3", phone: "+225 07****33", amount: "200 XOF", timeAgo: "il y a 14s" },
  { id: "init_4", phone: "+229 96****01", amount: "50 XOF", timeAgo: "il y a 22s" },
  { id: "init_5", phone: "+237 65****90", amount: "500 XAF", timeAgo: "il y a 35s" },
  { id: "init_6", phone: "+228 90****45", amount: "500 XOF", timeAgo: "il y a 48s" },
  { id: "init_7", phone: "+226 70****11", amount: "100 XOF", timeAgo: "il y a 1 min" },
  { id: "init_8", phone: "+237 67****52", amount: "1 000 XAF", timeAgo: "il y a 2 min" },
];

export default function SpinWheelView({ user, onRefresh, onBack }: SpinWheelViewProps) {
  // Spin Wheel State
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelError, setWheelError] = useState("");
  const [wheelSuccess, setWheelSuccess] = useState("");
  const [liveWinners, setLiveWinners] = useState<WheelWinnerItem[]>(INITIAL_WINNERS);

  // Auto update live winners feed
  useEffect(() => {
    const interval = setInterval(() => {
      const newWinner = generateRandomWinner();
      setLiveWinners((prev) => [newWinner, ...prev.slice(0, 14)]);
    }, 3800);

    return () => clearInterval(interval);
  }, []);

  const handleSpinWheel = async () => {
    if (isSpinning) return;
    setWheelError("");
    setWheelSuccess("");
    setIsSpinning(true);

    try {
      const resp = await api.spinWheel();
      
      const prizeIndex = resp.prize.index;
      // Index ranges 0 to 5. Each slice is 60 deg. Target pointer center is at top (12 o'clock)
      const targetAngle = 360 - (prizeIndex * 60 + 30);
      // We want to do 5 complete spins + target angle
      const finalDeg = rotation + 1800 + targetAngle - (rotation % 360);
      setRotation(finalDeg);

      setTimeout(() => {
        setIsSpinning(false);
        setWheelSuccess(resp.message);

        // Add user win to live feed if prize won
        if (resp.prize && resp.prize.amount > 0) {
          const userCurr = user.phone?.startsWith("+237") || user.phone?.startsWith("237") ? "XAF" : "XOF";
          const myWinItem: WheelWinnerItem = {
            id: "my_" + Date.now(),
            phone: user.phone ? `${user.phone.substring(0, 6)}****${user.phone.slice(-2)}` : "Vous",
            amount: `${resp.prize.amount.toLocaleString()} ${userCurr}`,
            timeAgo: "À l'instant",
            isNew: true,
          };
          setLiveWinners((prev) => [myWinItem, ...prev.slice(0, 14)]);
        }

        onRefresh();
      }, 4100);

    } catch (err: any) {
      setIsSpinning(false);
      setWheelError(err.message || "Une erreur est survenue lors du lancement de la roue.");
    }
  };

  const ticketsAvailable = user.spinsAvailable || 0;

  return (
    <div className="space-y-6 text-slate-800 animate-slide-in">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
        <button 
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            🎡 Roue de la Fortune
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Tournez la roue et tentez de gagner des cash prizes !
          </p>
        </div>
      </div>

      {/* Ticket Counter Hero Card */}
      <div className="relative p-4.5 rounded-2xl shadow-md bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider text-white">
              <Gift className="h-3.5 w-3.5" />
              Vos Tickets de Tirage
            </span>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-4xl font-extrabold tracking-tight">
                {ticketsAvailable}
              </span>
              <span className="text-sm font-bold text-amber-100 uppercase">
                {ticketsAvailable > 1 ? "Tickets restants" : "Ticket restant"}
              </span>
            </div>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-3xl shadow-lg shrink-0">
            🎟️
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-5 grid grid-cols-3 gap-2 bg-black/15 backdrop-blur-xs rounded-2xl p-3 border border-white/15 text-center text-xs font-bold text-white">
          <div>
            <span className="block text-amber-200 text-[9px] uppercase font-bold">Filleuls Actifs</span>
            <span className="text-sm font-black mt-0.5 block">{user.investedReferralsCount || 0}</span>
          </div>
          <div className="border-x border-white/20">
            <span className="block text-amber-200 text-[9px] uppercase font-bold">Tirages Effectués</span>
            <span className="text-sm font-black mt-0.5 block">{user.spinsUsed || 0}</span>
          </div>
          <div>
            <span className="block text-amber-200 text-[9px] uppercase font-bold">Tickets Dispo</span>
            <span className="text-sm font-black mt-0.5 block">{ticketsAvailable}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Wheel Component */}
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs text-center relative overflow-hidden">
        <div className="max-w-xs mx-auto">
          {/* Wheel Frame */}
          <div className="relative my-4 w-64 h-64 mx-auto">
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
                {/* Slice 5: 0 F (Red) */}
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
          <div className="space-y-3 mt-4">
            {wheelError && (
              <div className="p-3 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-100 animate-slide-in">
                ⚠️ {wheelError}
              </div>
            )}

            {wheelSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-100 animate-bounce shadow-xs">
                🎉 {wheelSuccess}
              </div>
            )}

            {ticketsAvailable <= 0 ? (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full bg-slate-100 text-slate-400 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Aucun ticket disponible 🎫</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleSpinWheel}
                disabled={isSpinning}
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white py-3.5 rounded-2xl text-xs font-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSpinning ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                    <span>La roue tourne... 🎡</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Lancer le tirage ({ticketsAvailable} ticket{ticketsAvailable > 1 ? "s" : ""}) 🚀</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Winners Ticker Stream */}
      <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h3 className="text-xs font-black text-slate-900 tracking-wide uppercase">
              Flux en Direct des Gagnants
            </h3>
          </div>
          <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
            EN DIRECT 🎡
          </span>
        </div>

        {/* Stream List */}
        <div className="max-h-56 overflow-y-auto space-y-2 pr-0.5 scrollbar-thin">
          {liveWinners.map((winner) => (
            <div
              key={winner.id}
              className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                winner.isNew
                  ? "bg-gradient-to-r from-amber-50/90 via-emerald-50/50 to-white border-emerald-200/80 shadow-2xs animate-fade-in"
                  : "bg-slate-50/60 border-slate-100/80"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs shadow-xs font-black shrink-0">
                  🎁
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-800 leading-tight">
                    {winner.phone}
                  </p>
                  <p className="text-[9.5px] font-medium text-slate-400 mt-0.5">
                    a fait tourner la roue • {winner.timeAgo}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-xs">
                  +{winner.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules & Info Card */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider">
          <HelpCircle className="h-4 w-4 text-amber-500" />
          <span>Comment obtenir des tickets de tirage ?</span>
        </div>
        
        <ul className="text-xs text-slate-600 space-y-2 font-medium">
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">1</span>
            <span>Partagez votre lien ou code de parrainage avec vos proches et amis.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">2</span>
            <span>Chaque fois qu'un filleul direct (Niveau 1) active un plan d'investissement VIP, vous débloquez <strong className="text-slate-900 font-black">1 ticket gratuit</strong>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">3</span>
            <span>Tous les gains remportés sur la roue sont <strong className="text-emerald-600 font-black">directement crédités sur votre solde principal</strong> et retirables immédiatement !</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
