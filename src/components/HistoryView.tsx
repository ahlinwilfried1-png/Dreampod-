/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { History, ArrowLeft, TrendingUp, Calendar, Filter } from "lucide-react";
import { Transaction } from "../types";

interface HistoryViewProps {
  transactions: Transaction[];
  onBack: () => void;
}

type FilterType = "all" | "deposit" | "withdrawal" | "bonus" | "commission";

export default function HistoryView({ transactions, onBack }: HistoryViewProps) {
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
    </div>
  );
}
