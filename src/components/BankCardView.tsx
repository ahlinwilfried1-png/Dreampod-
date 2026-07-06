/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowLeft, CreditCard, QrCode } from "lucide-react";
import { User } from "../types";

interface BankCardViewProps {
  user: User;
  onRefresh: () => void;
  onBack: () => void;
}

export default function BankCardView({ user, onRefresh, onBack }: BankCardViewProps) {
  const [cardOperator, setCardOperator] = useState("mtn");
  const [cardPhone, setCardPhone] = useState(user.phone);
  const [bankSuccess, setBankSuccess] = useState("");

  const saveBankCard = (e: React.FormEvent) => {
    e.preventDefault();
    setBankSuccess("Coordonnées de paiement Mobile Money enregistrées avec succès !");
    setTimeout(() => {
      setBankSuccess("");
      onBack();
      onRefresh();
    }, 2000);
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
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Carte Bancaire</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Configuration de vos comptes mobile money</p>
        </div>
      </div>

      {/* Simulated Card design */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden font-mono max-w-sm mx-auto">
        <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-orange-100/80">Dreampod Pay</p>
            <p className="text-sm font-black tracking-wider uppercase mt-1">DREAMPOD MOBILE</p>
          </div>
          <QrCode className="h-7 w-7 opacity-80" />
        </div>
        <div className="my-6">
          <p className="text-sm font-bold text-orange-50 tracking-wider">
            {cardPhone ? `+228 ${cardPhone}` : "Aucun numéro enregistré"}
          </p>
        </div>
        <div className="flex justify-between items-end text-[10px] uppercase text-orange-100/70">
          <div>
            <p className="text-[8px]">Titulaire</p>
            <p className="font-bold text-white mt-0.5">{user.name}</p>
          </div>
          <div>
            <p className="text-[8px]">Opérateur</p>
            <p className="font-bold text-white mt-0.5">{cardOperator.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs max-w-sm mx-auto">
        <form onSubmit={saveBankCard} className="space-y-4">
          {bankSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-xs p-3 rounded-xl font-bold">
              🎉 {bankSuccess}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Choisir Opérateur</label>
            <select
              id="bankcard-operator-select"
              value={cardOperator}
              onChange={(e) => setCardOperator(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
            >
              <option value="mtn">MTN Mobile Money 🟡</option>
              <option value="orange">Orange Money 🟠</option>
              <option value="moov">Moov Money (T-Money) 🟢</option>
              <option value="wave">Wave Mobile 🔵</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Numéro de Téléphone</label>
            <input
              id="bankcard-phone-input"
              type="tel"
              required
              placeholder="Ex: 90123456"
              value={cardPhone}
              onChange={(e) => setCardPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>

          <button
            id="bankcard-submit-btn"
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Mettre à jour la carte
          </button>
        </form>
      </div>
    </div>
  );
}
