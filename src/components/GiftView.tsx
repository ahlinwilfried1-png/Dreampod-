/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowLeft, Gift, CheckCircle, Sparkles, Tag, ShieldCheck, MessageCircle, ExternalLink } from "lucide-react";
import { User } from "../types";
import { api } from "../lib/api";
import { getCurrencySymbol } from "../lib/currency";

interface GiftViewProps {
  user: User;
  onRefresh: () => void;
  onBack: () => void;
}

export default function GiftView({ user, onRefresh, onBack }: GiftViewProps) {
  const currency = getCurrencySymbol(user.phone);
  const [bonusCode, setBonusCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleClaimBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonusCode.trim()) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.claimBonusCode(bonusCode.trim());
      setSuccess(response.message || "Code cadeau validé avec succès !");
      setBonusCode("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Code cadeau invalide ou déjà utilisé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="gift-view-container" className="space-y-4 max-w-md mx-auto pb-8 text-slate-800 select-none">
      {/* Top Header Bar - Completely smooth borderless header */}
      <div className="flex items-center justify-between py-2 px-1 border-b border-slate-100">
        <button
          id="gift-back-btn"
          onClick={onBack}
          className="p-1.5 text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Code Cadeau</h2>
        <div className="w-8" />
      </div>

      {/* Smooth Banner Illustration - Frameless, soft gradient */}
      <div className="bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 text-white rounded-3xl p-6 shadow-sm relative overflow-hidden space-y-3">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-15 pointer-events-none">
          <Gift className="w-44 h-44" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold">
          <Sparkles className="h-3.5 w-3.5 text-amber-200" />
          <span>Récompense Exclusive</span>
        </div>

        <h3 className="text-lg font-black tracking-tight leading-snug">
          Activez votre Code Cadeau
        </h3>

        <p className="text-xs text-white/90 font-medium leading-relaxed max-w-[260px]">
          Entrez le code secret distribué par l'administration ou dans le groupe officiel pour créditer votre solde immédiatement.
        </p>
      </div>

      {/* Activation Form Section - Frameless, smooth elements */}
      <div className="space-y-3 pt-2">
        <form onSubmit={handleClaimBonus} className="space-y-3">
          
          {/* Frameless Smooth Input Field */}
          <div className="bg-slate-100/90 rounded-2xl p-3.5 flex items-center gap-2 focus-within:bg-slate-100 focus-within:ring-2 focus-within:ring-rose-400 transition-all">
            <Tag className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
            <input
              id="gift-code-input"
              type="text"
              required
              placeholder="Entrez le code cadeau (ex: WELCOME200)"
              value={bonusCode}
              onChange={(e) => setBonusCode(e.target.value)}
              className="w-full bg-transparent text-xs font-bold uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none tracking-wider"
            />
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="bg-rose-50 text-rose-600 text-xs p-3.5 rounded-2xl font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-700 text-xs p-3.5 rounded-2xl font-bold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            id="gift-submit-btn"
            type="submit"
            disabled={loading || !bonusCode.trim()}
            className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:opacity-95 text-white font-extrabold text-sm py-3.5 rounded-full shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
          >
            {loading ? "Vérification..." : "Activer le Cadeau"}
          </button>
        </form>
      </div>

      {/* WhatsApp Channel Join Banner */}
      <a
        id="gift-whatsapp-channel-btn"
        href="https://whatsapp.com/channel/0029Vb8YR5RInlqVFq9AOa33"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-3xl p-4.5 shadow-sm transition-all cursor-pointer active:scale-98 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide">Canal WhatsApp Officiel</span>
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">VIP</span>
              </div>
              <p className="text-[11px] text-emerald-100 font-medium">Rejoignez la communauté pour recevoir tous les codes cadeaux</p>
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-emerald-200 group-hover:text-white transition-colors shrink-0 ml-1" />
        </div>
      </a>

      {/* Explanatory Rules & Information - Smooth frameless container */}
      <div className="bg-slate-50/80 rounded-3xl p-5 space-y-3 text-xs text-slate-600 font-medium leading-relaxed">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <ShieldCheck className="h-4 w-4 text-rose-500" />
          <span>Comment obtenir des codes cadeaux ?</span>
        </div>

        <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-600">
          <li>Rejoignez notre canal officiel Telegram ou WhatsApp pour recevoir les codes quotidiens.</li>
          <li>Participez aux événements d'équipe et défis de parrainage.</li>
          <li>Chaque code cadeau est à usage unique par compte utilisateur.</li>
          <li>Le montant est immédiatement ajouté à votre solde disponible ({currency}).</li>
        </ul>
      </div>
    </div>
  );
}
