/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { History, ArrowLeft, Calendar, Layers, CheckCircle2, Clock } from "lucide-react";
import { Transaction, Investment } from "../types";

interface HistoryViewProps {
  transactions: Transaction[];
  investments: Investment[];
  onBack: () => void;
}

type FilterType = "all" | "deposit" | "withdrawal" | "bonus" | "commission";

export default function HistoryView({ transactions, investments, onBack }: HistoryViewProps) {
  const [historyTab, setHistoryTab] = useState<"transactions" | "investments">("transactions");
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "all") return true;
    return t.type === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="text-[10px] font-black bg-green-50 text-green-600 border border-green-200/50 px-2.5 py-0.5 rounded-full">Approuvé</span>;
      case "rejected":
        return <span className="text-[10px] font-black bg-red-50 text-red-500 border border-red-200/50 px-2.5 py-0.5 rounded-full">Rejeté</span>;
      default:
        return <span className="text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-200/50 px-2.5 py-0.5 rounded-full animate-pulse">En attente</span>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return "💳";
      case "withdrawal":
        return "💸";
      case "commission":
        return "🤝";
      case "bonus":
        return "🎁";
      default:
        return "⚡";
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Dépôt de fonds";
      case "withdrawal":
        return "Retrait de fonds";
      case "commission":
        return "Commission d'équipe";
      case "bonus":
        return "Bonus de récompense";
      case "investment":
        return "Achat Plan VIP";
      default:
        return "Opération système";
    }
  };

  return (
    <div id="history-view-container" className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3.5">
        <button
          id="history-back-btn"
          onClick={onBack}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Historique de Compte</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Suivi en temps réel de votre solde</p>
        </div>
      </div>

      {/* Main Tab Toggle: Transactions vs Products */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 select-none">
        <button
          id="tab-toggle-transactions"
          onClick={() => setHistoryTab("transactions")}
          className={`py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            historyTab === "transactions"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <History className="h-4 w-4" /> Transactions
        </button>
        <button
          id="tab-toggle-investments"
          onClick={() => setHistoryTab("investments")}
          className={`py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            historyTab === "investments"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Layers className="h-4 w-4 text-blue-500" /> Évolution Produits ({investments.length})
        </button>
      </div>

      {historyTab === "transactions" ? (
        <>
          {/* Filter Tabs Card */}
          <div className="bg-white rounded-2xl p-2 border border-slate-200/60 shadow-xs flex gap-1.5 overflow-x-auto select-none no-scrollbar">
            {[
              { id: "all", label: "Tous" },
              { id: "deposit", label: "Dépôts" },
              { id: "withdrawal", label: "Retraits" },
              { id: "bonus", label: "Bonus / Cadeaux" },
            ].map((tab) => (
              <button
                id={`filter-tab-${tab.id}`}
                key={tab.id}
                onClick={() => setFilter(tab.id as FilterType)}
                className={`text-[10.5px] font-black py-2 px-4 rounded-xl cursor-pointer shrink-0 transition-all ${
                  filter === tab.id
                    ? "bg-blue-600 text-white shadow-xs shadow-blue-500/10"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* History List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-50 pb-2.5 flex items-center gap-1.5">
              <History className="h-4 w-4 text-purple-500" />
              Liste des Transactions ({filteredTransactions.length})
            </h3>

            {filteredTransactions.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <div className="text-3xl text-slate-300">📜</div>
                <p className="text-xs text-slate-400 font-bold">Aucune transaction trouvée pour ce filtre.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((t) => {
                  const isPositive = ["deposit", "commission", "bonus"].includes(t.type);
                  return (
                    <div
                      id={`tx-item-${t.id}`}
                      key={t.id}
                      className="p-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/50 rounded-2xl flex justify-between items-center transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl h-11 w-11 rounded-xl bg-white flex items-center justify-center shadow-2xs border border-slate-100">
                          {getTransactionIcon(t.type)}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-[11.5px] tracking-wide">
                            {getTransactionLabel(t.type)}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-1.5 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(t.date).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span
                          className={`font-black text-[13px] tracking-tight ${
                            isPositive ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {isPositive ? "+" : "-"}
                          {t.amount.toLocaleString()} <span className="text-[10px]">FCFA</span>
                        </span>
                        {getStatusBadge(t.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Evolution View */
        <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-xs space-y-4 select-none">
          <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-50 pb-2.5 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-blue-500" />
            Évolution de vos Plans ({investments.length})
          </h3>

          {investments.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="text-3xl text-slate-300">💎</div>
              <p className="text-xs text-slate-400 font-bold">Vous n'avez aucun investissement actif pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {investments.map((inv) => {
                const progressPercent = Math.min(100, Math.round((inv.daysPassed / inv.durationDays) * 100));
                const isCompleted = inv.daysPassed >= inv.durationDays;
                const accumulatedIncome = inv.daysPassed * inv.dailyIncome;
                const totalExpectedIncome = inv.dailyIncome * inv.durationDays;

                return (
                  <div
                    id={`inv-item-${inv.id}`}
                    key={inv.id}
                    className="p-5 bg-slate-50 hover:bg-slate-100/30 border border-slate-200/50 rounded-2xl space-y-3.5 transition-colors"
                  >
                    {/* Header: Name and status badge */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">
                          {inv.productName}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase">
                          RÉF : {inv.id.toUpperCase()}
                        </p>
                      </div>
                      {isCompleted ? (
                        <span className="text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-200/50 px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase">
                          <CheckCircle2 className="h-3 w-3" /> Terminé
                        </span>
                      ) : (
                        <span className="text-[9px] font-black bg-green-50 text-green-600 border border-green-200/50 px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase animate-pulse">
                          <Clock className="h-3 w-3" /> Actif
                        </span>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2.5 bg-white border border-slate-100 p-3 rounded-xl text-[10px] font-bold text-slate-500 font-mono">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase font-sans tracking-wide">Prix d'Achat</span>
                        <span className="text-slate-800 font-black">{inv.price.toLocaleString()} FCFA</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block uppercase font-sans tracking-wide font-sans">Rendement Quotidien</span>
                        <span className="text-green-600 font-black">+{inv.dailyIncome.toLocaleString()} FCFA</span>
                      </div>
                    </div>

                    {/* Progression bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-500">Durée écoulée</span>
                        <span className="text-blue-600 font-black">{inv.daysPassed} / {inv.durationDays} Jours ({progressPercent}%)</span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden border border-slate-100">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-[#00a3e0] h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Accumulated Income details */}
                    <div className="flex justify-between items-center text-[11px] font-bold pt-2 border-t border-slate-200/30">
                      <span className="text-slate-500">Revenus générés</span>
                      <span className="text-green-600 font-black text-xs font-mono">
                        {accumulatedIncome.toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">sur</span> {totalExpectedIncome.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
