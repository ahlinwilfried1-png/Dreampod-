/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Check, Cpu } from "lucide-react";
import { Product, Investment } from "../types";
import { api } from "../lib/api";

const PRODUCT_IMAGES: Record<number, { url: string; label: string; bgGradient: string; textAccent: string }> = {
  1: {
    url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80",
    label: "Dreampod Élite",
    bgGradient: "from-blue-50 to-indigo-50",
    textAccent: "text-blue-600"
  },
  2: {
    url: "https://images.unsplash.com/photo-1507646227500-4d389b0012be?auto=format&fit=crop&w=400&q=80",
    label: "Dreampod Premium",
    bgGradient: "from-cyan-50 to-teal-50",
    textAccent: "text-teal-600"
  },
  3: {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    label: "Dreampod Gold",
    bgGradient: "from-amber-50 to-yellow-50",
    textAccent: "text-amber-600"
  },
  4: {
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80",
    label: "Dreampod Platinum",
    bgGradient: "from-purple-50 to-indigo-50",
    textAccent: "text-purple-600"
  },
  5: {
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80",
    label: "Dreampod Infini",
    bgGradient: "from-emerald-50 to-green-50",
    textAccent: "text-emerald-600"
  },
  6: {
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=400&q=80",
    label: "Dreampod Saphir",
    bgGradient: "from-blue-50 to-sky-50",
    textAccent: "text-blue-700"
  }
};

const getProductConfig = (level: number) => {
  return PRODUCT_IMAGES[level] || {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    label: `Dreampod VIP ${level}`,
    bgGradient: "from-slate-50 to-zinc-50",
    textAccent: "text-slate-600"
  };
};

interface ProductsViewProps {
  products: Product[];
  investments: Investment[];
  userBalance: number;
  onRefresh: () => void;
}

export default function ProductsView({ 
  products, 
  investments, 
  userBalance, 
  onRefresh 
}: ProductsViewProps) {
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const handleInvest = async (product: Product) => {
    if (userBalance < product.price) {
      alert(`Votre solde (${userBalance.toLocaleString()} FCFA) est insuffisant. Veuillez recharger votre portefeuille de ${(product.price - userBalance).toLocaleString()} FCFA.`);
      return;
    }

    const confirmBuy = window.confirm(`Voulez-vous vraiment investir ${product.price.toLocaleString()} FCFA dans "${product.name}" ? Rendement de ${product.dailyIncome.toLocaleString()} FCFA par jour pendant ${product.durationDays} jours.`);
    if (!confirmBuy) return;

    setBuyingId(product.id);
    try {
      const response = await api.invest(product.id);
      alert(response.message || "Investissement complété avec succès !");
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Erreur de communication.");
    } finally {
      setBuyingId(null);
    }
  };

  const getSubscribedCount = (pId: string) => {
    return investments.filter(i => i.productId === pId).length;
  };

  const activeProducts = products.filter(p => !p.isBlocked);

  return (
    <div className="space-y-4 pb-28 text-slate-800 select-none">
      
      {/* List of Products */}
      <div className="space-y-4">
        {activeProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 px-4">
            <Cpu className="h-10 w-10 text-slate-300 mx-auto animate-pulse mb-3" />
            <p className="text-xs font-bold text-slate-500">Aucun produit disponible</p>
            <p className="text-[10px] text-slate-400 mt-1">Revenez bientôt pour de nouveaux plans.</p>
          </div>
        ) : (
          activeProducts.map((prod) => {
            const ownedCount = getSubscribedCount(prod.id);
            const isBuying = buyingId === prod.id;
            const config = getProductConfig(prod.level);

            return (
              <div 
                id={`product-card-${prod.id}`}
                key={prod.id}
                className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
              >
                
                {/* Top Row: Logo, Title & VIP Badge */}
                <div className="flex gap-4 items-start">
                  
                  {/* Beautiful Product Image */}
                  <div className="h-20 w-20 shrink-0 rounded-2xl overflow-hidden shadow-xs border border-slate-100 bg-slate-50 relative">
                    <img 
                      src={config.url} 
                      alt={config.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-[8px] text-white px-1 py-0.5 rounded font-mono font-bold">
                      POD-{prod.level}
                    </span>
                  </div>

                  {/* Title & Level Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                      {config.label}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{prod.name}</p>
                    
                    {/* Gold VIP Badge */}
                    <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-black px-2.5 py-0.5 rounded-lg mt-1.5 border border-amber-200/50">
                      <span className="text-amber-500">💎</span> VIP {prod.level - 1}
                    </div>
                  </div>

                  {/* Active Subscribed indicator */}
                  {ownedCount > 0 && (
                    <span className="shrink-0 bg-green-50 text-green-600 border border-green-100 px-2.5 py-0.5 rounded-full text-[9px] font-black flex items-center gap-0.5 uppercase">
                      <Check className="h-3 w-3" /> {ownedCount} Actif
                    </span>
                  )}
                </div>

                {/* Detail Key-Value Pairs */}
                <div className="mt-4 space-y-2 border-t border-slate-100/75 pt-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>Revenu</span>
                    <span className="text-slate-800 font-extrabold">{prod.durationDays} Jours</span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>Revenus Quotidiens</span>
                    <span className="text-green-600 font-black">FCFA {prod.dailyIncome.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>Revenu Total</span>
                    <span className="text-blue-600 font-black">FCFA {prod.totalIncome.toLocaleString()}</span>
                  </div>
                </div>

                {/* Integrated Pill Button */}
                <div className="mt-4 flex h-11 items-center bg-[#f3f6fa] rounded-full overflow-hidden border border-slate-100/50 shadow-3xs">
                  {/* Price display side */}
                  <div className="flex-[5] flex items-center justify-center h-full px-4 text-[#1e3a8a] font-black text-xs">
                    FCFA {prod.price.toLocaleString()}
                  </div>

                  {/* Invest button side */}
                  <button
                    id={`btn-invest-action-${prod.id}`}
                    onClick={() => handleInvest(prod)}
                    disabled={isBuying}
                    className="flex-[7] bg-blue-600 hover:bg-blue-500 active:bg-blue-700 h-full text-white font-black text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isBuying ? (
                      <div className="h-4 w-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="text-yellow-400 text-sm">⚡</span>
                        <span>Investir</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
