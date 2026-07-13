/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Coins, ArrowLeft, CheckCircle, Clock, AlertTriangle, ShieldCheck, Wallet, ArrowRight } from "lucide-react";
import { User, Investment } from "../types";
import { api } from "../lib/api";

interface WithdrawViewProps {
  user: User;
  investments: Investment[];
  onRefresh: () => void;
  onBack: () => void;
  onNavigateToBankCard: () => void;
}

export default function WithdrawView({ user, investments, onRefresh, onBack, onNavigateToBankCard }: WithdrawViewProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("3000");
  const [withdrawalCode, setWithdrawalCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const hasActiveProduct = investments && investments.some((inv) => inv.daysPassed < inv.durationDays);
  const isWalletLinked = !!(user.linkedWalletNumber && user.linkedWalletOperator);

  const getNiameyHour = () => {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Niamey",
        hour: "numeric",
        hour12: false,
      });
      return parseInt(formatter.format(new Date()), 10);
    } catch (e) {
      return new Date().getHours(); // fallback
    }
  };

  const currentNiameyHour = getNiameyHour();
  const isWithdrawTimeAllowed = user.role === "admin" || (currentNiameyHour >= 9 && currentNiameyHour < 17);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isWithdrawTimeAllowed) {
      setError("Les retraits sont fermés. Vous pouvez soumettre vos demandes uniquement de 09:00 à 17:00 (Heure du Niger).");
      return;
    }

    if (!isWalletLinked) {
      setError("Action impossible : Vous devez d'abord lier votre portefeuille mobile money à votre compte.");
      return;
    }

    if (!hasActiveProduct) {
      setError("Action impossible : Vous devez posséder au moins un produit d'investissement actif pour pouvoir effectuer un retrait.");
      return;
    }

    const val = Number(withdrawAmount);
    if (!val || val < 500) {
      setError("Le montant minimum de retrait est de 500 FCFA.");
      return;
    }

    if (val > user.balance) {
      setError(`Solde insuffisant. Vous disposez de ${user.balance.toLocaleString()} FCFA.`);
      return;
    }

    if (!withdrawalCode.trim()) {
      setError("Veuillez saisir votre code de retrait secret.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.withdraw(val, withdrawalCode.trim());
      setSuccess(response.message || "Votre demande de retrait a été enregistrée avec succès !");
      setWithdrawalCode("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la soumission de la demande de retrait.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="withdraw-view-container" className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3.5">
        <button
          id="withdraw-back-btn"
          onClick={onBack}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Demander un Retrait</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Retirer vos revenus sur votre compte mobile money</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-6 max-w-md mx-auto">
        
        {/* Balance Status Display */}
        <div className="flex justify-between items-center bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <Coins className="h-8 w-8 text-emerald-600" />
            <div>
              <p className="text-[10px] uppercase font-black tracking-wider text-emerald-600">Solde Retirable</p>
              <h3 className="text-xl font-black text-slate-900 font-mono">
                {user.balance.toLocaleString()} <span className="text-xs font-normal text-slate-500">FCFA</span>
              </h3>
            </div>
          </div>
          <span className="text-[9px] font-black bg-emerald-100/70 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-md uppercase tracking-wider">
            Disponible 💸
          </span>
        </div>

        {/* CONDITION 1: WALLET NOT LINKED */}
        {!isWalletLinked ? (
          <div className="space-y-5">
            <div className="bg-rose-50 border border-rose-100 text-rose-950 p-5 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-rose-700 font-black uppercase text-[10px] tracking-wider">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                Portefeuille non lié !
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                Avant de pouvoir soumettre une demande de retrait, chaque utilisateur doit obligatoirement lier son portefeuille mobile money à son compte.
              </p>
              <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                Cette liaison sécurise vos transactions et garantit que vos fonds seront envoyés sur votre compte Mobile Money personnel et valide.
              </p>
            </div>

            <button
              id="withdraw-goto-link-btn"
              onClick={onNavigateToBankCard}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3.5 rounded-2xl transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-98 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Wallet className="h-4 w-4" />
              <span>Lier mon portefeuille maintenant</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          // CONDITION 2: WALLET LINKED -> SHOW FORM
          <div className="space-y-5">
            {/* Display Linked Wallet Info */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Portefeuille Mobile lié</p>
                <span className="flex items-center gap-1 text-[8px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Sécurisé
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-800">
                <div>
                  <span className="text-[8px] text-slate-400 font-black uppercase block">Opérateur</span>
                  <span className="uppercase">{user.linkedWalletOperator}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 font-black uppercase block">Numéro de transfert</span>
                  <span className="font-mono">{user.linkedWalletNumber}</span>
                </div>
                <div className="col-span-2 border-t border-slate-200/60 pt-2 mt-1">
                  <span className="text-[8px] text-slate-400 font-black uppercase block">Titulaire de la carte / SIM</span>
                  <span className="text-slate-900">{user.linkedWalletOwnerName}</span>
                </div>
              </div>
            </div>

            {/* Product requirement check */}
            {!hasActiveProduct && (
              <div className="bg-amber-50 border border-amber-200/80 text-amber-900 text-xs p-4.5 rounded-2xl font-semibold flex flex-col gap-2.5 shadow-2xs select-none">
                <div className="flex items-center gap-2 text-amber-700 font-black uppercase text-[10px] tracking-wider">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  Retrait Suspendu (Produit requis)
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  Vous devez posséder <span className="font-extrabold text-slate-800 underline">au moins un produit d'investissement actif</span> (un plan VIP en cours d'évolution) pour débloquer la fonctionnalité de retrait sur la plateforme.
                </p>
              </div>
            )}

            {/* Time restriction notice */}
            {!isWithdrawTimeAllowed && (
              <div className="bg-rose-50 border border-rose-200 text-rose-900 text-xs p-4.5 rounded-2xl font-semibold flex flex-col gap-2.5 shadow-2xs select-none">
                <div className="flex items-center gap-2 text-rose-700 font-black uppercase text-[10px] tracking-wider">
                  <Clock className="h-4 w-4 text-rose-600 shrink-0" />
                  Service de Retrait Fermé
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  Les retraits sont autorisés uniquement entre <span className="font-extrabold text-slate-800 underline">09:00 et 17:00 (Heure de Niamey, Niger)</span>.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-[11px] p-3 rounded-2xl font-bold flex gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 text-[11px] p-4 rounded-2xl text-center font-bold flex flex-col items-center gap-2 animate-fadeIn">
                <CheckCircle className="h-6 w-6 text-green-500 animate-bounce" />
                <h4 className="font-extrabold text-green-700">Demande Enregistrée !</h4>
                <p className="text-[10px] leading-relaxed text-green-600 font-semibold">{success}</p>
              </div>
            )}

            {/* WITHDRAWAL FORM CONTAINS ONLY AMOUNT, CODE, SUBMIT BUTTON */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Le montant du retrait */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  Montant du Retrait (FCFA)
                </label>
                <input
                  id="withdraw-amount-input"
                  type="number"
                  required
                  min="500"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-black font-mono transition-all"
                />
                <span className="text-[9px] text-slate-400 font-semibold block px-1">
                  Retrait minimum autorisé : 500 FCFA
                </span>
              </div>

              {/* Le code de retrait */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  Code de Retrait secret
                </label>
                <input
                  id="withdraw-code-input"
                  type="password"
                  required
                  placeholder="Saisissez votre code PIN de retrait"
                  value={withdrawalCode}
                  onChange={(e) => setWithdrawalCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-xs font-mono tracking-widest text-center text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-bold transition-all"
                />
                <span className="text-[9px] text-slate-400 font-semibold block px-1">
                  Le code confidentiel défini lors de la liaison de votre portefeuille.
                </span>
              </div>

              {/* Processing Notice */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed font-semibold">
                <Clock className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-slate-700 uppercase text-[9px] tracking-wider mb-0.5">Heures de service</p>
                  <p>Ouvert tous les jours de 09:00 à 17:00 (Heure de Niamey).</p>
                </div>
              </div>

              {/* Le bouton Soumettre */}
              <button
                id="withdraw-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full font-black text-xs py-3.5 rounded-2xl transition-all shadow-md active:scale-98 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-emerald-500/10 disabled:opacity-50"
              >
                {loading ? "Envoi de la demande..." : "Soumettre"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
