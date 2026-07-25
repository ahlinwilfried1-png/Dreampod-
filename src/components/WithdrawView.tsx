/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowLeft, Plus, CheckCircle, AlertTriangle, Headphones, Lock } from "lucide-react";
import { User, Investment, Transaction } from "../types";
import { api } from "../lib/api";
import { getCurrencySymbol } from "../lib/currency";

interface WithdrawViewProps {
  user: User;
  investments: Investment[];
  transactions?: Transaction[];
  onRefresh: () => void;
  onBack: () => void;
  onNavigateToBankCard: () => void;
}

export default function WithdrawView({ user, investments, transactions = [], onRefresh, onBack, onNavigateToBankCard }: WithdrawViewProps) {
  const currency = getCurrencySymbol(user.phone);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawalCode, setWithdrawalCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const hasActiveProduct = investments && investments.some((inv) => inv.daysPassed < inv.durationDays);
  const isWalletLinked = !!(user.linkedWalletNumber && user.linkedWalletOperator);

  // Count withdrawals submitted today
  const todayStr = new Date().toISOString().split("T")[0];
  const todayWithdrawalsCount = transactions
    ? transactions.filter(
        (tx) => tx.type === "withdrawal" && tx.date && tx.date.startsWith(todayStr)
      ).length
    : 0;

  const rawVal = Number(withdrawAmount) || 0;
  const feeAmount = Math.round(rawVal * 0.14);
  const netAmount = Math.max(0, rawVal - feeAmount);

  const getNiameyHour = () => {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Niamey",
        hour: "numeric",
        hour12: false,
      });
      return parseInt(formatter.format(new Date()), 10);
    } catch (e) {
      return new Date().getHours();
    }
  };

  const currentNiameyHour = getNiameyHour();
  const isWithdrawTimeAllowed = user.role === "admin" || (currentNiameyHour >= 8 && currentNiameyHour < 17);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isWithdrawTimeAllowed) {
      setError("Les retraits sont fermés. Vous pouvez soumettre vos demandes uniquement de 08:00 à 17:00.");
      return;
    }

    if (!isWalletLinked) {
      setError("Action impossible : Veuillez d'abord lier votre compte bancaire / mobile money.");
      return;
    }

    if (!hasActiveProduct && user.role !== "admin") {
      setError("Action impossible : Aucun retrait autorisé sans au moins un produit d'investissement actif.");
      return;
    }

    if (todayWithdrawalsCount >= 2 && user.role !== "admin") {
      setError("Limite atteinte : Vous êtes limité à 2 retraits maximum par jour.");
      return;
    }

    const val = Number(withdrawAmount);
    if (!val || val < 1000) {
      setError(`Le montant minimum de retrait est de 1 000 ${currency}.`);
      return;
    }

    if (val > user.balance) {
      setError(`Solde insuffisant. Votre solde disponible est de ${user.balance.toLocaleString()} ${currency}.`);
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
      setWithdrawAmount("");
      setWithdrawalCode("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la soumission de la demande de retrait.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="withdraw-view-container" className="space-y-5 max-w-md mx-auto pb-8 text-slate-800">
      
      {/* Top Header Bar matching screenshot */}
      <div className="flex items-center justify-between py-2 px-1 border-b border-slate-100">
        <button
          id="withdraw-back-btn"
          onClick={onBack}
          className="p-1.5 text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Retirer</h2>
        <button
          onClick={onNavigateToBankCard}
          className="text-xs font-semibold text-slate-800 hover:text-amber-600 transition-all cursor-pointer"
        >
          Enregistrer
        </button>
      </div>

      {/* Top Card: Solde disponible & Bank Card banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
        {/* Solde disponible row */}
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-bold text-slate-900">Solde disponible</span>
          <span className="text-lg font-black text-red-500 font-mono">
            {currency} {user.balance.toLocaleString()}
          </span>
        </div>

        {/* Gold Credit Card Banner */}
        <div 
          onClick={onNavigateToBankCard}
          className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 p-4 rounded-2xl text-amber-950 shadow-xs cursor-pointer hover:opacity-95 transition-all relative overflow-hidden space-y-6"
        >
          {/* Wave background decoration */}
          <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
            <svg width="180" height="90" viewBox="0 0 180 90" fill="none">
              <path d="M0 45C40 20 80 70 120 30C160 -10 180 45 180 45V90H0V45Z" fill="white" />
            </svg>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-tight">
              {isWalletLinked 
                ? `${user.linkedWalletOperator?.toUpperCase()} (${user.linkedWalletNumber})` 
                : "Veuillez lier le compte bancaire"
              }
            </span>
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-950">
              <Plus className="h-4 w-4 stroke-[3]" />
            </div>
          </div>

          <div className="text-[11px] font-semibold text-amber-900/80">
            {isWalletLinked ? `Titulaire : ${user.linkedWalletOwnerName || user.name}` : "Compte de retrait"}
          </div>
        </div>

        {/* Minimum withdrawal amount indicator */}
        <div className="text-center text-xs font-bold text-slate-800 pt-1">
          Montant minimum de retrait: <span className="text-amber-500 font-extrabold">1,000{currency}</span>
        </div>
      </div>

      {/* Main Withdrawal Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 px-1">Demande de retrait</h3>

        {/* Form container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Amount input field with left prefix matching image */}
          <div className="flex items-center bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs focus-within:border-amber-400 transition-all">
            <span className="text-xs font-black text-slate-900 px-2 border-r border-slate-200 mr-2 font-mono">
              {currency}
            </span>
            <input
              id="withdraw-amount-input"
              type="number"
              required
              min="1000"
              placeholder="Entrez le montant du retrait"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 font-bold placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Secret PIN / Withdrawal Code Input */}
          <div className="flex items-center bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs focus-within:border-amber-400 transition-all">
            <span className="text-xs font-black text-slate-900 px-2 border-r border-slate-200 mr-2 flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              PIN
            </span>
            <input
              id="withdraw-code-input"
              type="password"
              required
              placeholder="Saisissez votre code PIN de retrait"
              value={withdrawalCode}
              onChange={(e) => setWithdrawalCode(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 font-bold placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Live 14% Fee & Net calculated card */}
          {rawVal > 0 && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl space-y-1 text-xs font-medium text-slate-700">
              <div className="flex justify-between">
                <span>Frais de retrait (14%) :</span>
                <span className="font-bold text-rose-600">-{feeAmount.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 border-t border-amber-200/50 pt-1">
                <span>Montant net à recevoir :</span>
                <span className="text-emerald-700 font-mono">{netAmount.toLocaleString()} {currency}</span>
              </div>
            </div>
          )}

          {/* Validation / Status alerts */}
          {!hasActiveProduct && user.role !== "admin" && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3.5 rounded-2xl font-semibold flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Vous devez posséder au moins un produit d'investissement actif pour retirer.</span>
            </div>
          )}

          {todayWithdrawalsCount >= 2 && user.role !== "admin" && (
            <div className="bg-rose-50 border border-rose-200 text-rose-900 text-xs p-3.5 rounded-2xl font-semibold flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>Limite atteinte : Maximum 2 retraits par jour ({todayWithdrawalsCount}/2 effectués).</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-2xl font-bold flex gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-2xl font-bold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Main Retrait Button matching screenshot */}
          <button
            id="withdraw-submit-btn"
            type="submit"
            disabled={loading || (!hasActiveProduct && user.role !== "admin") || (todayWithdrawalsCount >= 2 && user.role !== "admin")}
            className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 hover:opacity-95 text-slate-950 font-extrabold text-sm py-3.5 rounded-full shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
          >
            {loading ? "Chargement..." : "Retrait"}
          </button>
        </form>
      </div>

      {/* Rules and Information Card matching image */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4 text-xs text-slate-700 font-medium leading-relaxed">
        
        <p>
          Règles de retrait : Le montant minimum de retrait est de 1 000 {currency}, limité à deux retraits par jour.
        </p>

        <p>
          Heures de traitement des retraits : De 8h00 à 17h00
        </p>

        {/* Paragraph with Customer Support Badge */}
        <div className="relative pr-14">
          <p>
            Afin de garantir un traitement efficace de vos transactions, le montant minimum de retrait est fixé à 1 000 {currency}.
          </p>
          
          {/* Circular Support Center Badge on bottom right of paragraph */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-gradient-to-tr from-blue-700 to-slate-900 text-white p-0.5 shadow-md flex items-center justify-center border-2 border-white">
            <div className="w-full h-full rounded-full bg-slate-900 flex flex-col items-center justify-center text-[7px] text-center font-black p-0.5 leading-none">
              <Headphones className="h-3.5 w-3.5 text-cyan-400 mb-0.5" />
              <span className="text-[5.5px] uppercase text-cyan-300">Support</span>
            </div>
          </div>
        </div>

        <p>
          Nous nous engageons à vous offrir une expérience de retrait rapide et sécurisée. Pour toute question ou assistance, n'hésitez pas à contacter notre service
        </p>

      </div>

    </div>
  );
}
