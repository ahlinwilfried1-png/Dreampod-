/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowLeft, CreditCard, QrCode, Shield, Check } from "lucide-react";
import { User } from "../types";
import { api } from "../lib/api";

interface BankCardViewProps {
  user: User;
  onRefresh: () => void;
  onBack: () => void;
}

export default function BankCardView({ user, onRefresh, onBack }: BankCardViewProps) {
  const [cardOperator, setCardOperator] = useState(user.linkedWalletOperator || "airtel");
  const [cardPhone, setCardPhone] = useState(user.linkedWalletNumber || "");
  const [cardOwner, setCardOwner] = useState(user.linkedWalletOwnerName || user.name || "");
  const [withdrawalCode, setWithdrawalCode] = useState(user.withdrawalCode || "");

  const [loading, setLoading] = useState(false);
  const [bankSuccess, setBankSuccess] = useState("");
  const [bankError, setBankError] = useState("");

  const saveBankCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBankSuccess("");
    setBankError("");

    try {
      const res = await api.linkWallet({
        operator: cardOperator,
        number: cardPhone,
        ownerName: cardOwner,
        withdrawalCode: withdrawalCode,
      });

      setBankSuccess(res.message || "Votre portefeuille mobile money a été lié avec succès !");
      onRefresh();
      
      setTimeout(() => {
        setBankSuccess("");
        onBack();
      }, 2000);
    } catch (err: any) {
      setBankError(err.message || "Impossible de lier le portefeuille.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="bank-card-view-container" className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3.5">
        <button
          id="bankcard-back-btn"
          onClick={onBack}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Portefeuille de Paiement</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Lier votre compte Mobile Money pour les retraits</p>
        </div>
      </div>

      {/* Simulated Card design */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden font-mono max-w-sm mx-auto">
        <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-indigo-100/80">Dreampod Secure Pay</p>
            <p className="text-sm font-black tracking-wider uppercase mt-1">PORTEFEUILLE ACTIF</p>
          </div>
          <QrCode className="h-7 w-7 opacity-80" />
        </div>
        <div className="my-6">
          <p className="text-lg font-black text-white tracking-wider">
            {cardPhone ? cardPhone : "Aucun numéro lié"}
          </p>
        </div>
        <div className="flex justify-between items-end text-[10px] uppercase text-indigo-100/70">
          <div className="max-w-[65%]">
            <p className="text-[8px]">Titulaire légal</p>
            <p className="font-bold text-white mt-0.5 truncate">{cardOwner}</p>
          </div>
          <div>
            <p className="text-[8px]">Réseau</p>
            <p className="font-bold text-white mt-0.5">{cardOperator.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Info Warning */}
      <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-2xl max-w-sm mx-auto space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-xs">
          <Shield className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Sécurité Obligatoire</span>
        </div>
        <p className="text-[10px] leading-relaxed text-amber-700 font-semibold">
          Conformément aux nouvelles mesures de sécurité, vous devez obligatoirement lier votre compte de paiement avant d'initier un retrait. Ces coordonnées seront utilisées automatiquement.
        </p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs max-w-sm mx-auto">
        <form onSubmit={saveBankCard} className="space-y-4">
          {bankSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-xs p-3 rounded-xl font-bold flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 shrink-0" />
              <span>{bankSuccess}</span>
            </div>
          )}

          {bankError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl font-bold">
              ⚠️ {bankError}
            </div>
          )}
          
          {/* Opérateur */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Choisir Opérateur</label>
            <select
              id="bankcard-operator-select"
              value={cardOperator}
              onChange={(e) => setCardOperator(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
            >
              <option value="airtel">Airtel Money 🔴</option>
              <option value="moov">Moov Money (Flooz) 🟢</option>
              <option value="orange">Orange Money 🟠</option>
              <option value="tmoney">TMoney 🟡</option>
              <option value="amana">Amana Transfert 🟣</option>
              <option value="nita">Nita Transfert 🟤</option>
            </select>
          </div>

          {/* Numéro */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Numéro Mobile Money</label>
            <input
              id="bankcard-phone-input"
              type="text"
              required
              placeholder="Ex: +227 99 88 77 66"
              value={cardPhone}
              onChange={(e) => setCardPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>

          {/* Nom du Titulaire */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nom d'identité du Titulaire</label>
            <input
              id="bankcard-owner-input"
              type="text"
              required
              placeholder="Ex: Jean Dupont"
              value={cardOwner}
              onChange={(e) => setCardOwner(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>

          {/* Code de Retrait */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Définir un Code de Retrait</label>
            <input
              id="bankcard-code-input"
              type="password"
              required
              placeholder="Ex: 1234"
              value={withdrawalCode}
              onChange={(e) => setWithdrawalCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono tracking-widest text-center font-bold"
            />
            <span className="text-[8px] text-slate-400 font-medium block px-1">
              Ce code sera requis pour valider chaque demande de retrait.
            </span>
          </div>

          <button
            id="bankcard-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-98 disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Lier le portefeuille"}
          </button>
        </form>
      </div>
    </div>
  );
}
