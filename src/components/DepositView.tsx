/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Wallet, ArrowLeft, CheckCircle, Info, QrCode } from "lucide-react";
import { User } from "../types";
import { api } from "../lib/api";

interface DepositViewProps {
  user: User;
  onRefresh: () => void;
  onBack: () => void;
}

const PAYMENT_METHODS = [
  { id: "mtn", name: "MTN Mobile Money 🟡", countries: "Bénin, Cameroun" },
  { id: "orange", name: "Orange Money 🟠", countries: "Cameroun" },
  { id: "moov", name: "Moov Money 🟢", countries: "Bénin, Burkina Faso" },
];

const PRESETS = ["1000", "5000", "10000", "25000", "50000", "100000"];

export default function DepositView({ user, onRefresh, onBack }: DepositViewProps) {
  const [depositAmount, setDepositAmount] = useState("5000");
  const [depositMethod, setDepositMethod] = useState("mtn");
  const [depositTransactionId, setDepositTransactionId] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const val = Number(depositAmount);
    if (!val || val < 1000) {
      setError("Le montant minimum d'un dépôt est de 1 000 FCFA.");
      return;
    }

    if (!depositTransactionId.trim()) {
      setError("Veuillez saisir l'ID/Référence de votre transaction mobile money.");
      return;
    }

    setLoading(true);
    const selectedMethodObj = PAYMENT_METHODS.find((p) => p.id === depositMethod);
    const methodName = selectedMethodObj
      ? `${selectedMethodObj.name} - ID/Ref: ${depositTransactionId.trim()}`
      : `Mobile money ID/Ref: ${depositTransactionId}`;

    try {
      const response = await api.deposit(val, methodName);
      setSuccess(response.message || "Demande de dépôt enregistrée avec succès !");
      setDepositTransactionId("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Erreur de communication avec la plateforme.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="deposit-view-container" className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3.5">
        <button
          id="deposit-back-btn"
          onClick={onBack}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Faire un Dépôt</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Recharge de portefeuille sécurisée</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-6">
        <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
          <Wallet className="h-8 w-8 text-blue-600" />
          <div>
            <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Votre Solde Actuel</p>
            <h3 className="text-xl font-black text-slate-900 font-mono">
              {user.balance.toLocaleString()} <span className="text-xs font-normal text-slate-500">FCFA</span>
            </h3>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[11px] p-3 rounded-2xl font-bold flex gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-[11px] p-4 rounded-2xl text-center font-bold flex flex-col items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <span>🌟 {success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
              Montant à recharger (FCFA)
            </label>
            <input
              id="deposit-amount-input"
              type="number"
              required
              min="1000"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-black font-mono transition-all"
            />
            <span className="text-[10px] text-slate-400 font-medium block px-1">
              Dépôt minimum obligatoire : 1 000 FCFA
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => (
              <button
                id={`preset-deposit-${preset}`}
                key={preset}
                type="button"
                onClick={() => setDepositAmount(preset)}
                className={`text-[10px] font-extrabold py-2.5 px-3 border rounded-xl transition-all cursor-pointer ${
                  depositAmount === preset
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {Number(preset).toLocaleString()} F
              </button>
            ))}
          </div>

          {/* Payment Method select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
              Sélectionner Moyen de Dépôt
            </label>
            <select
              id="deposit-method-select"
              value={depositMethod}
              onChange={(e) => setDepositMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.countries})
                </option>
              ))}
            </select>
          </div>

          {/* Detailed Instructions block */}
          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-[11px] text-slate-600 space-y-2 leading-relaxed">
            <p className="font-extrabold text-[#00a3e0] uppercase tracking-wide flex items-center gap-1">
              <Info className="h-4 w-4" /> Instructions Administratives :
            </p>
            <p>1. Effectuez le transfert de <span className="font-extrabold text-slate-800">{Number(depositAmount || 0).toLocaleString()} FCFA</span> vers le numéro Mobile Money officiel fourni par le support ou vos canaux de recharge.</p>
            <p>2. Récupérez le numéro ou l'ID de transaction unique contenu dans le SMS de confirmation.</p>
            <p>3. Renseignez-le obligatoirement dans le champ ci-dessous.</p>
          </div>

          {/* Transaction ID input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
              ID / Référence de Transaction Mobile Money
            </label>
            <input
              id="deposit-txid-input"
              type="text"
              required
              placeholder="Ex: TXN_892019402 ou Ref: 78923091"
              value={depositTransactionId}
              onChange={(e) => setDepositTransactionId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-mono placeholder-slate-400"
            />
          </div>

          {/* Submit button */}
          <button
            id="deposit-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3.5 rounded-2xl transition-all cursor-pointer disabled:opacity-40 shadow-md shadow-blue-500/10 active:scale-98"
          >
            {loading ? "Vérification en cours..." : "Soumettre la demande de dépôt"}
          </button>
        </form>
      </div>
    </div>
  );
}
