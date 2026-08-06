/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Transaction } from "../types";

interface WithdrawRecordsViewProps {
  transactions: Transaction[];
  onBack: () => void;
  onRefresh?: () => void;
}

/**
 * Generates or formats a unique transaction ID matching the screenshot format:
 * e.g., B2608041526490546 (B + YYMMDDHHMMSS + 4 deterministic/random digits)
 */
export function formatWithdrawalCode(tx: Transaction): string {
  if (tx.txRefId && tx.txRefId.startsWith("B")) {
    return tx.txRefId;
  }

  try {
    const d = new Date(tx.date || Date.now());
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");

    // Deterministic 4-digit hash from tx.id
    let hash = 0;
    const idStr = tx.id || "tx";
    for (let i = 0; i < idStr.length; i++) {
      hash = (hash * 31 + idStr.charCodeAt(i)) % 10000;
    }
    const suffix = String(Math.abs(hash)).padStart(4, "0");

    return `B${yy}${mm}${dd}${hh}${min}${ss}${suffix}`;
  } catch (e) {
    return `B260804${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  }
}

/**
 * Formats ISO date string to DD/MM/YYYY HH:mm:ss format matching the screenshot
 */
export function formatWithdrawalDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Format currency number as FCFA 17,400 matching the screenshot style
 */
export function formatFCFAAmount(amount: number): string {
  const formattedNum = amount.toLocaleString("en-US");
  return `FCFA ${formattedNum}`;
}

export default function WithdrawRecordsView({
  transactions = [],
  onBack,
  onRefresh,
}: WithdrawRecordsViewProps) {

  // Auto-sync data every 5 seconds to get real-time updates when admin approves/rejects
  useEffect(() => {
    if (onRefresh) {
      onRefresh();
      const interval = setInterval(() => {
        onRefresh();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [onRefresh]);

  // Filter ONLY withdrawal transactions
  const withdrawalTxs = transactions.filter((t) => t.type === "withdrawal");

  // Sort from most recent to oldest
  const sortedWithdrawals = [...withdrawalTxs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Réussi";
      case "approved":
        return "Approuvé";
      case "rejected":
        return "Rejeté";
      case "pending":
      default:
        return "En attente";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "text-emerald-500 font-bold";
      case "rejected":
        return "text-rose-600 font-bold";
      case "pending":
      default:
        return "text-amber-500 font-bold";
    }
  };

  return (
    <div id="withdraw-records-container" className="min-h-screen bg-[#f8f6f9] text-slate-800 pb-16">
      
      {/* Top Red Header Bar matching the screenshot */}
      <div className="bg-red-600 text-white sticky top-0 z-30 flex items-center justify-between px-4 py-3 shadow-sm">
        <button
          id="withdraw-records-back-btn"
          onClick={onBack}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-white flex items-center justify-center"
          title="Retour"
        >
          <ArrowLeft className="h-6 w-6 stroke-[2.5]" />
        </button>

        <h1 className="text-base font-bold tracking-wide text-center flex-1 pr-6">
          Historique des retraits
        </h1>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-white/80 hover:text-white"
            title="Rafraîchir"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="max-w-md mx-auto p-4 space-y-3.5">
        
        {sortedWithdrawals.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-rose-200/80 shadow-2xs text-center space-y-3 my-4">
            <div className="text-4xl">💸</div>
            <h3 className="text-sm font-bold text-slate-800">
              Aucun enregistrement de retrait
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Chaque demande de retrait effectuée sera enregistrée automatiquement et conservée ici de façon permanente.
            </p>
          </div>
        ) : (
          sortedWithdrawals.map((tx) => {
            const uniqueCode = formatWithdrawalCode(tx);
            const statusLabel = getStatusText(tx.status);
            const statusColorClass = getStatusColor(tx.status);

            // Net received amount after 18% fee
            const rawAmount = tx.amount || 0;
            const netReceived = Math.max(0, Math.round(rawAmount * 0.82));

            return (
              <div
                id={`withdraw-card-${tx.id}`}
                key={tx.id}
                className="bg-white rounded-2xl p-4 border border-rose-300/80 shadow-2xs space-y-2"
              >
                {/* Header row: Transaction Code & Status */}
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-800 tracking-tight font-mono">
                    {uniqueCode}
                  </span>
                  <span className={`text-sm ${statusColorClass}`}>
                    {statusLabel}
                  </span>
                </div>

                {/* Details list matching screenshot */}
                <div className="text-xs text-slate-700 space-y-1 font-normal pt-1">
                  
                  {/* Montant row */}
                  <div className="flex items-center">
                    <span className="w-20 inline-block text-slate-600 font-medium">
                      Montant
                    </span>
                    <span className="font-medium text-slate-900">
                      : {formatFCFAAmount(rawAmount)}
                    </span>
                  </div>

                  {/* Reçu row */}
                  <div className="flex items-center">
                    <span className="w-20 inline-block text-slate-600 font-medium">
                      Reçu
                    </span>
                    <span className="font-medium text-slate-900">
                      : {formatFCFAAmount(netReceived)}
                    </span>
                  </div>

                  {/* Date row */}
                  <div className="flex items-center">
                    <span className="w-20 inline-block text-slate-600 font-medium">
                      Date
                    </span>
                    <span className="font-medium text-slate-900">
                      : {formatWithdrawalDate(tx.date)}
                    </span>
                  </div>

                </div>
              </div>
            );
          })
        )}

        {/* Muted bottom text matching screenshot */}
        <div className="text-center text-xs font-medium text-slate-400 pt-6 pb-4">
          Aucune autre donnée
        </div>

      </div>
    </div>
  );
}
