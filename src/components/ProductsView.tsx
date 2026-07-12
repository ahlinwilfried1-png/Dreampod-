/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Check, Cpu, Info, X, AlertTriangle, CheckCircle2 } from "lucide-react";
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
  const [activeConfirmProduct, setActiveConfirmProduct] = useState<Product | null>(null);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; type: "success" | "error" | "info"; onClose?: () => void } | null>(null);

  const handleInvest = (product: Product) => {
    if (userBalance < product.price) {
      setAlertModal({
        title: "Solde Insuffisant",
        message: `Votre solde (${userBalance.toLocaleString()} FCFA) est insuffisant. Veuillez recharger votre portefeuille de ${(product.price - userBalance).toLocaleString()} FCFA.`,
        type: "error"
      });
      return;
    }
    setActiveConfirmProduct(product);
  };

  const executeInvest = async (product: Product) => {
    setBuyingId(product.id);
    try {
      const response = await api.invest(product.id);
      setAlertModal({
        title: "Investissement Réussi",
        message: response.message || `Votre investissement de ${product.price.toLocaleString()} FCFA dans "${product.name}" a été complété avec succès !`,
        type: "success",
        onClose: () => onRefresh()
      });
    } catch (err: any) {
      setAlertModal({
        title: "Échec de l'Investissement",
        message: err.message || "Une erreur est survenue lors de l'activation du produit d'investissement.",
        type: "error"
      });
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
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left Card: Nombre de produits */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-4.5 shadow-2xs flex flex-col justify-center">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
            Nombre de produits
          </span>
          <span className="text-xl font-black text-blue-600 mt-1 font-mono">
            {investments.length}
          </span>
        </div>

        {/* Right Card: Revenu total */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-4.5 shadow-2xs flex flex-col justify-center text-right">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
            Revenu total
          </span>
          <span className="text-xl font-black text-green-600 mt-1 font-mono">
            {investments.reduce((sum, inv) => sum + (inv.dailyIncome * inv.durationDays), 0).toLocaleString()} <span className="text-[10px] font-bold text-slate-500 font-sans">FCFA</span>
          </span>
        </div>
      </div>

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

      {/* Confirmation Modal */}
      {activeConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative space-y-4">
            <button
              onClick={() => setActiveConfirmProduct(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
                💎
              </div>
              <h3 className="text-base font-black text-slate-900">Confirmer l'Investissement</h3>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">
                Voulez-vous vraiment investir <span className="font-extrabold text-slate-800">{activeConfirmProduct.price.toLocaleString()} FCFA</span> dans le plan <span className="font-extrabold text-slate-800">"{activeConfirmProduct.name}"</span> ?
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-2 text-slate-600">
              <div className="flex justify-between font-bold">
                <span>Rendement quotidien :</span>
                <span className="text-green-600 font-extrabold">{activeConfirmProduct.dailyIncome.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Période de validité :</span>
                <span className="text-slate-800 font-extrabold">{activeConfirmProduct.durationDays} Jours</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Revenu total estimé :</span>
                <span className="text-blue-600 font-extrabold">{activeConfirmProduct.totalIncome.toLocaleString()} FCFA</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setActiveConfirmProduct(null)}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-black text-slate-600 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const prod = activeConfirmProduct;
                  setActiveConfirmProduct(null);
                  executeInvest(prod);
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black cursor-pointer shadow-md shadow-blue-500/10"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center text-2xl">
              {alertModal.type === "success" && <CheckCircle2 className="h-10 w-10 text-green-500" />}
              {alertModal.type === "error" && <AlertTriangle className="h-10 w-10 text-red-500" />}
              {alertModal.type === "info" && <Info className="h-10 w-10 text-blue-500" />}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900">{alertModal.title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">{alertModal.message}</p>
            </div>

            <button
              onClick={() => {
                const action = alertModal.onClose;
                setAlertModal(null);
                if (action) action();
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
