/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Coins, ArrowLeft, CheckCircle, Info, Clock } from "lucide-react";
import { User } from "../types";
import { api } from "../lib/api";

interface WithdrawViewProps {
  user: User;
  onRefresh: () => void;
  onBack: () => void;
}

const PAYMENT_METHODS = [
  { id: "mtn", name: "MTN Mobile Money 🟡", countries: "Bénin, Cameroun" },
  { id: "orange", name: "Orange Money 🟠", countries: "Cameroun" },
  { id: "moov", name: "Moov Money 🟢", countries: "Bénin, Burkina Faso" },
];

export default function WithdrawView({ user, onRefresh, onBack }: WithdrawViewProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("3000");
  const [withdrawMethod, setWithdrawMethod] = useState("mtn");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const val = Number(withdrawAmount);
    if (!val || val < 500) {
      setError("Le montant minimum de retrait est de 500 FCFA.");
      return;
    }

    if (val > user.balance) {
      setError(`Solde insuffisant. Vous disposez de ${user.balance.toLocaleString()} FCFA.`);
      return;
    }

    if (!withdrawPhone.trim()) {
      setError("Veuillez renseigner le numéro mobile money de réception.");
      return;
    }

    setLoading(true);
    const selectedMethodObj = PAYMENT_METHODS.find((p) => p.id === withdrawMethod);
    const methodName = selectedMethodObj
      ? `${selectedMethodObj.name} (Vers: ${withdrawPhone.trim()})`
      : `Mobile money (${withdrawPhone})`;

    try {
      const response = await api.withdraw(val, methodName);
      setSuccess(response.message || "Votre demande de retrait a été enregistrée avec succès !");
      setWithdrawPhone("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Erreur de communication avec le serveur.");
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
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Retrait Mobile Money</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Récupérer vos fonds instantanément</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-6">
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[11px] p-3 rounded-2xl font-bold flex gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-[11px] p-4 rounded-2xl text-center font-bold flex flex-col items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500 animate-bounce" />
            <h4 className="font-extrabold text-green-700">Demande Enregistrée !</h4>
            <p className="text-[10px] leading-relaxed text-green-600 font-semibold">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount Input */}
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
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-black font-mono transition-all"
            />
            <span className="text-[10px] text-slate-400 font-medium block px-1">
              Retrait minimum autorisé : 500 FCFA
            </span>
          </div>

          {/* Operator Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
              Opérateur de Réception
            </label>
            <select
              id="withdraw-method-select"
              value={withdrawMethod}
              onChange={(e) => setWithdrawMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.countries})
                </option>
              ))}
            </select>
          </div>

          {/* Receiver Phone number */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
              Numéro Mobile Money de Réception
            </label>
            <input
              id="withdraw-phone-input"
              type="tel"
              required
              placeholder="Ex: 90123456 (avec l'indicatif de votre pays si nécessaire)"
              value={withdrawPhone}
              onChange={(e) => setWithdrawPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Processing Delay Ticker */}
          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-2.5 text-[11px] text-slate-600 leading-relaxed font-semibold">
            <Clock className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider mb-0.5">Traitement Garanti</p>
              <p>Les retraits sont examinés, validés et transférés directement sur votre compte mobile sous un délai maximal de 2 heures d'horloge d'activité administrative.</p>
            </div>
          </div>

          {/* Submit Action */}
          <button
            id="withdraw-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3.5 rounded-2xl transition-all cursor-pointer disabled:opacity-40 shadow-md shadow-emerald-500/10 active:scale-98"
          >
            {loading ? "Envoi de la requête..." : "Confirmer la demande de retrait de fonds"}
          </button>
        </form>
      </div>
    </div>
  );
}
