/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowLeft, Smartphone, Info, ChevronRight, Headphones, CheckCircle } from "lucide-react";
import { User } from "../types";
import { api } from "../lib/api";
import { getCurrencySymbol } from "../lib/currency";

interface DepositViewProps {
  user: User;
  onRefresh: () => void;
  onBack: () => void;
}

const PAYMENT_LINK_URL = "https://westpay.cfd/link/ghtd44ucmrzqa1uz";

const RECHARGE_PRESETS = [
  { amount: "3000" },
  { amount: "7000" },
  { amount: "15000" },
  { amount: "20000" },
  { amount: "30000" },
  { amount: "50000" },
  { amount: "75000" },
  { amount: "100000" },
  { amount: "150000" },
];

const COUNTRY_CODES = [
  { code: "+226", flag: "🇧🇫", country: "Burkina Faso" },
  { code: "+237", flag: "🇨🇲", country: "Cameroun" },
  { code: "+228", flag: "🇹🇬", country: "Togo" },
  { code: "+229", flag: "🇧🇯", country: "Bénin" },
  { code: "+225", flag: "🇨🇮", country: "Côte d'Ivoire" },
];

export default function DepositView({ user, onRefresh, onBack }: DepositViewProps) {
  const currency = getCurrencySymbol(user.phone);
  const [depositAmount, setDepositAmount] = useState("3000");
  const [phonePrefix, setPhonePrefix] = useState("+237");
  const [userPhone, setUserPhone] = useState(() => {
    if (user.phone && user.phone.length > 4) {
      return user.phone.replace(/^\+\d{1,3}\s?/, "");
    }
    return "";
  });
  const [selectedChannel, setSelectedChannel] = useState("allpay");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [userTxHistory, setUserTxHistory] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.getProfile().then((res: any) => {
      if (res.transactions) {
        setUserTxHistory(res.transactions.filter((tx: any) => tx.type === "deposit"));
      }
    }).catch(console.error);
  }, []);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const val = Number(depositAmount);
    if (!val || val < 1000) {
      setError(`Le montant minimum d'un dépôt est de 1 000 ${currency}.`);
      return;
    }

    if (!userPhone.trim()) {
      setError("Veuillez saisir votre numéro de téléphone.");
      return;
    }

    setLoading(true);

    try {
      const fullPhone = `${phonePrefix} ${userPhone.trim()}`;
      await api.deposit(val, selectedChannel === "allpay" ? "Allpay Direct" : "Goray Money", {
        receiverNumber: PAYMENT_LINK_URL,
        simOwnerName: fullPhone,
      });

      window.open(PAYMENT_LINK_URL, "_blank");
      setSuccess(`Rechargement de ${val.toLocaleString()} ${currency} initié ! La page de paiement a été ouverte.`);
      onRefresh();
    } catch (err: any) {
      window.open(PAYMENT_LINK_URL, "_blank");
      setSuccess("Redirection vers la page de paiement...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="deposit-view-container" className="space-y-4 max-w-md mx-auto pb-10 text-slate-800 select-none">
      
      {/* Header Bar matching screenshot */}
      <div className="flex items-center justify-between py-2 px-1 border-b border-slate-100">
        <button
          id="deposit-back-btn"
          onClick={onBack}
          className="p-1.5 text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Recharger</h2>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="text-xs font-semibold text-slate-800 hover:text-amber-600 transition-all cursor-pointer"
        >
          Enregistrer
        </button>
      </div>

      <form onSubmit={handleDepositSubmit} className="space-y-4">
        
        {/* Top Gold/Yellow Card */}
        <div className="bg-gradient-to-b from-amber-200/80 to-amber-100/90 rounded-3xl p-4.5 space-y-3 shadow-2xs border border-amber-200/50">
          <label className="text-xs font-bold text-slate-900 block">
            Numéro de téléphone
          </label>

          {/* White Phone Input Field with Country Code Selector & Icon */}
          <div className="bg-white rounded-2xl p-2.5 flex items-center gap-2 shadow-2xs">
            <select
              value={phonePrefix}
              onChange={(e) => setPhonePrefix(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent border-r border-slate-200 pr-1 focus:outline-none cursor-pointer"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} ({c.country})
                </option>
              ))}
            </select>
            <input
              id="deposit-phone-input"
              type="tel"
              required
              placeholder="Numéro de téléphone"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
            />
            <Smartphone className="h-4 w-4 text-slate-400 shrink-0 mr-1" />
          </div>

          {/* Balance & Facture row */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="font-semibold text-slate-800">
              Équilibre({currency}): <strong className="font-bold font-mono">{user.balance.toLocaleString()}</strong>
            </span>
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="bg-white/80 hover:bg-white text-slate-800 px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-0.5 shadow-2xs cursor-pointer transition-all"
            >
              Facture <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Recharge Amount Section */}
        <div className="bg-amber-50/50 rounded-3xl overflow-hidden border border-amber-100/80 shadow-2xs space-y-3 pb-4">
          
          {/* Header Banner */}
          <div className="bg-[#feefc3] px-4 py-2.5 flex items-center gap-2 text-slate-900 font-bold text-xs">
            <Info className="h-4 w-4 text-slate-700" />
            <span>Montant de la recharge</span>
          </div>

          {/* Presets Grid (3 columns cleanly styled) */}
          <div className="px-3 pt-2 grid grid-cols-3 gap-2.5">
            {RECHARGE_PRESETS.map((p) => {
              const isSelected = depositAmount === p.amount;
              const formattedVal = Number(p.amount).toLocaleString();

              return (
                <button
                  key={p.amount}
                  id={`preset-deposit-${p.amount}`}
                  type="button"
                  onClick={() => setDepositAmount(p.amount)}
                  className={`w-full py-3 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-white border-2 border-amber-500 text-amber-600 shadow-2xs scale-[1.02]"
                      : "bg-white border-slate-100 text-slate-900 hover:border-amber-200"
                  }`}
                >
                  {formattedVal}
                </button>
              );
            })}
          </div>

          {/* Amount Display / Manual Input box matching screenshot */}
          <div className="px-3 pt-1">
            <div className="bg-white rounded-2xl p-3 flex items-center border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-900 mr-3 font-mono">
                {currency}
              </span>
              <input
                id="deposit-amount-input"
                type="number"
                required
                min="1000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full text-sm font-black text-rose-500 bg-transparent focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Main Recharger Action Button Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs space-y-3 relative overflow-hidden">
          {/* Error / Success alerts */}
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-2xl font-bold">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-2xl font-bold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Recharger maintenant Main Action Button with Floating Support Badge */}
          <div className="relative pt-1">
            <button
              id="deposit-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 hover:opacity-95 text-slate-950 font-extrabold text-sm py-3.5 rounded-full shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {loading ? "Redirection..." : "Recharger maintenant"}
            </button>

            {/* Support Center Floating Circular Badge on the right of button */}
            <div className="absolute right-0 -top-1 w-12 h-12 rounded-full bg-slate-900 text-white p-0.5 shadow-md flex items-center justify-center border-2 border-white pointer-events-none">
              <div className="w-full h-full rounded-full bg-slate-900 flex flex-col items-center justify-center text-[7px] text-center font-black leading-none">
                <Headphones className="h-3.5 w-3.5 text-cyan-400 mb-0.5" />
                <span className="text-[5px] uppercase text-cyan-300">Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Steps / Info section at bottom */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs space-y-2 text-xs text-slate-600 font-medium leading-relaxed">
          <p className="font-bold text-slate-900">Étapes pour recharger votre compte :</p>
          <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
            <li>Saisissez votre numéro de téléphone.</li>
            <li>Choisissez le montant souhaité parmi nos offres avantageuses.</li>
            <li>Cliquez sur "Recharger maintenant" pour accéder à la page de paiement sécurisée.</li>
          </ol>
        </div>

      </form>

      {/* History Modal when clicking Enregistrer / Facture */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Historique des Rechargements</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-xs text-slate-500 font-bold hover:text-slate-900 cursor-pointer">
                Fermer
              </button>
            </div>

            {userTxHistory.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Aucun rechargement effectué pour le moment.</p>
            ) : (
              <div className="space-y-2">
                {userTxHistory.map((tx) => (
                  <div key={tx.id} className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{tx.amount.toLocaleString()} {currency}</p>
                      <p className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tx.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                      tx.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {tx.status === "approved" ? "Validé" : tx.status === "rejected" ? "Rejeté" : "En cours"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
