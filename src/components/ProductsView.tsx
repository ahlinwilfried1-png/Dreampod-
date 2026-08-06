/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Check, Cpu, Info, X, AlertTriangle, CheckCircle2, Lock, Clock } from "lucide-react";
import { Product, Investment } from "../types";
import { api } from "../lib/api";
import { getCurrencySymbol } from "../lib/currency";
import ProductImage from "./ProductImage";

const PRODUCT_IMAGES: Record<number, { url: string; label: string; bgGradient: string; textAccent: string }> = {
  0: {
    url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    label: "Nutrien Ag Découverte (VIP 0)",
    bgGradient: "from-sky-50 to-emerald-50",
    textAccent: "text-sky-600"
  },
  1: {
    url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    label: "Nutrien Ag Élite (Produits Agricoles)",
    bgGradient: "from-emerald-50 to-green-50",
    textAccent: "text-emerald-600"
  },
  2: {
    url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
    label: "Nutrien Ag Premium (Lait Milk)",
    bgGradient: "from-teal-50 to-emerald-50",
    textAccent: "text-teal-600"
  },
  3: {
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    label: "Nutrien Ag Gold (Récoltes Agricoles)",
    bgGradient: "from-amber-50 to-yellow-50",
    textAccent: "text-amber-600"
  },
  4: {
    url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80",
    label: "Nutrien Ag Platinum (Lait Pur)",
    bgGradient: "from-green-50 to-emerald-50",
    textAccent: "text-green-600"
  },
  5: {
    url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
    label: "Nutrien Ag Infini (Céréales & Grains)",
    bgGradient: "from-emerald-50 to-green-50",
    textAccent: "text-emerald-600"
  },
  6: {
    url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
    label: "Nutrien Ag Saphir (Agro-Alimentaire)",
    bgGradient: "from-teal-50 to-cyan-50",
    textAccent: "text-teal-700"
  },
  7: {
    url: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80",
    label: "Nutrien Ag Diamant (Complexe Agricole)",
    bgGradient: "from-amber-50 to-emerald-50",
    textAccent: "text-emerald-700"
  },
  8: {
    url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    label: "Nutrien Ag Rubis (Parc Éolien & Irrigation)",
    bgGradient: "from-rose-50 to-emerald-50",
    textAccent: "text-rose-700"
  },
  9: {
    url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
    label: "Nutrien Ag Émeraude (Centrale Solaire Agricole)",
    bgGradient: "from-emerald-50 to-teal-50",
    textAccent: "text-emerald-800"
  },
  10: {
    url: "https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=800&q=80",
    label: "Nutrien Ag Alchimie (Exportation Agro-Industrielle)",
    bgGradient: "from-purple-50 to-amber-50",
    textAccent: "text-purple-700"
  },
  11: {
    url: "https://images.unsplash.com/photo-1595838729819-374d7f82a71a?auto=format&fit=crop&w=800&q=80",
    label: "Nutrien Ag Titane (Consortium Agro Global)",
    bgGradient: "from-blue-50 to-indigo-50",
    textAccent: "text-indigo-800"
  }
};

const getProductConfig = (level: number) => {
  return PRODUCT_IMAGES[level] || {
    url: "/nutrien_bag.svg",
    label: `Nutrien VIP ${level}`,
    bgGradient: "from-emerald-50 to-zinc-50",
    textAccent: "text-emerald-600"
  };
};

interface ProductsViewProps {
  products: Product[];
  investments: Investment[];
  userBalance: number;
  onRefresh: () => void;
  userPhone?: string;
}

export default function ProductsView({ 
  products, 
  investments, 
  userBalance, 
  onRefresh,
  userPhone
}: ProductsViewProps) {
  const currency = getCurrencySymbol(userPhone);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [activeConfirmProduct, setActiveConfirmProduct] = useState<Product | null>(null);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; type: "success" | "error" | "info"; onClose?: () => void } | null>(null);

  useEffect(() => {
    if (alertModal) {
      const timer = setTimeout(() => {
        const action = alertModal.onClose;
        setAlertModal(null);
        if (action) action();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alertModal]);

  const handleInvest = (product: Product) => {
    if (product.isBlocked) {
      setAlertModal({
        title: "Produit En Cours",
        message: `Le plan "${product.name}" est actuellement en cours de préparation / verrouillé. Veuillez repasser plus tard ou contacter le support.`,
        type: "info"
      });
      return;
    }
    if (userBalance < product.price) {
      setAlertModal({
        title: "Solde Insuffisant",
        message: `Votre solde (${userBalance.toLocaleString()} ${currency}) est insuffisant. Veuillez recharger votre portefeuille de ${(product.price - userBalance).toLocaleString()} ${currency}.`,
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
        title: "Achat Réussi ! 🎉",
        message: response.message || `Investissement dans "${product.name}" (${product.price.toLocaleString()} ${currency}) activé avec succès !`,
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

  return (
    <div className="space-y-4 text-slate-800 select-none">
      
      {/* Summary Stats - Borderless & Cardless */}
      <div className="grid grid-cols-2 gap-4 pb-2">
        {/* Left Stat */}
        <div className="flex flex-col justify-center">
          <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider block">
            Formules Actives
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 font-mono">
            {investments.length}
          </span>
        </div>

        {/* Right Stat */}
        <div className="flex flex-col justify-center text-right">
          <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider block">
            Revenus collectés
          </span>
          <span className="text-xl sm:text-2xl font-black text-green-600 mt-0.5 font-mono">
            {investments.reduce((sum, inv) => sum + (inv.daysPassed * inv.dailyIncome), 0).toLocaleString()} <span className="text-xs font-extrabold text-slate-500 font-sans">{currency}</span>
          </span>
        </div>
      </div>

      {/* Section Header */}
      <div className="pt-2">
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          Centre de produits
        </h2>
      </div>

      {/* List of Products - Matching reference image style and typography */}
      <div className="space-y-4 pt-1">
        {(() => {
          const userHasVip0 = investments.some(
            inv => inv.productId === "vip0" || inv.productId === "vp0" || inv.productName?.toLowerCase().includes("vip 0") || inv.productName?.toLowerCase().includes("vp 0") || inv.productName?.toLowerCase().includes("découverte") || inv.productName?.toLowerCase().includes("decouverte")
          );

          const visibleProducts = products.filter(p => {
            const isVip0 = p.id === "vip0" || p.id === "vp0" || p.level === 0 || p.name?.toLowerCase().includes("vip 0") || p.name?.toLowerCase().includes("vp 0") || p.name?.toLowerCase().includes("découverte") || p.name?.toLowerCase().includes("decouverte");
            if (isVip0 && userHasVip0) {
              return false; // Disappears automatically once collected / subscribed!
            }
            return true;
          });

          if (visibleProducts.length === 0) {
            return (
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
                <Cpu className="h-8 w-8 text-slate-300 mx-auto animate-pulse mb-2" />
                <p className="text-sm font-black text-slate-700">Aucun produit disponible</p>
                <p className="text-xs text-slate-400 mt-0.5">Revenez bientôt pour de nouveaux plans.</p>
              </div>
            );
          }

          return visibleProducts.map((prod) => {
            const ownedCount = getSubscribedCount(prod.id);
            const isBuying = buyingId === prod.id;
            const config = getProductConfig(prod.level);
            const isBlocked = prod.isBlocked;

            return (
              <div 
                id={`product-card-${prod.id}`}
                key={prod.id}
                className={`bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3.5 relative transition-all ${
                  isBlocked ? "opacity-75" : ""
                }`}
              >
                {/* Top Row: Product Name & Cycle Days on Left, Product Image on Right */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                        {prod.name}
                      </h3>
                      {ownedCount > 0 && !isBlocked && (
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5 uppercase">
                          <Check className="h-3 w-3 stroke-[3]" /> {ownedCount} Actif
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-xs font-semibold text-slate-700 pt-0.5">
                      <span>Faire du vélo(Jours)</span>
                      <span className="font-black text-slate-900 text-sm sm:text-base ml-1.5">{prod.durationDays}</span>
                    </div>
                  </div>

                  {/* Product Image on Top Right */}
                  <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100/80 shadow-2xs">
                    <ProductImage
                      src={prod.image || config.url}
                      alt={prod.name}
                      level={prod.level}
                      isBlocked={isBlocked}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Grey Inner Box: Daily Income and Total Income */}
                <div className="bg-[#f1f5f9] rounded-xl p-3 sm:p-3.5 grid grid-cols-2 gap-2 text-center">
                  {/* Daily Income Column */}
                  <div className="space-y-0.5">
                    <div className="text-base sm:text-xl font-black text-[#ef4444] tracking-tight">
                      {prod.dailyIncome.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      Revenu quotidien
                    </div>
                  </div>

                  {/* Total Income Column */}
                  <div className="space-y-0.5">
                    <div className="text-base sm:text-xl font-black text-[#ef4444] tracking-tight">
                      {prod.totalIncome.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      Revenu total
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Price on Left, Invest Button on Right */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center">
                    <span>Prix(XAF):</span>
                    <span className="text-[#ef4444] font-black text-sm sm:text-base ml-1">
                      {prod.price.toLocaleString()}
                    </span>
                  </div>

                  {isBlocked ? (
                    <button
                      id={`btn-invest-action-${prod.id}`}
                      disabled
                      className="bg-slate-300 text-slate-600 font-extrabold text-xs sm:text-sm py-2 px-5 sm:px-6 rounded-lg uppercase tracking-wider cursor-not-allowed"
                    >
                      <span>Verrouillé</span>
                    </button>
                  ) : (
                    <button
                      id={`btn-invest-action-${prod.id}`}
                      onClick={() => handleInvest(prod)}
                      disabled={isBuying}
                      className="bg-[#ff0000] hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-xs sm:text-sm py-2 px-5 sm:px-6 rounded-lg uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      {isBuying ? (
                        <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
                      ) : (
                        "INVESTIR"
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          });
        })()}
      </div>

      {/* Confirmation Modal */}
      {activeConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xs w-full p-4 shadow-xl border border-slate-100 relative space-y-3">
            <button
              onClick={() => setActiveConfirmProduct(null)}
              className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="text-center space-y-1.5 pt-1">
              <div className="mx-auto h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-base">
                💎
              </div>
              <h3 className="text-sm font-black text-slate-900">Confirmer l'Investissement</h3>
              <p className="text-[10.5px] text-slate-500 leading-snug">
                Voulez-vous vraiment investir <span className="font-extrabold text-slate-800">{activeConfirmProduct.price.toLocaleString()} {currency}</span> dans le plan <span className="font-extrabold text-slate-800">"{activeConfirmProduct.name}"</span> ?
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-[10.5px] space-y-1.5 text-slate-600">
              <div className="flex justify-between font-bold">
                <span>Rendement quotidien :</span>
                <span className="text-green-600 font-extrabold">{activeConfirmProduct.dailyIncome.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Période de validité :</span>
                <span className="text-slate-800 font-extrabold">{activeConfirmProduct.durationDays} Jours</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Revenu total estimé :</span>
                <span className="text-emerald-600 font-extrabold">{activeConfirmProduct.totalIncome.toLocaleString()} {currency}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setActiveConfirmProduct(null)}
                className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-[11px] font-black text-slate-600 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const prod = activeConfirmProduct;
                  setActiveConfirmProduct(null);
                  executeInvest(prod);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black cursor-pointer shadow-xs shadow-emerald-500/10"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Frameless Floating Message Banner (No modal box frame) */}
      {alertModal && (
        <div 
          onClick={() => {
            const action = alertModal.onClose;
            setAlertModal(null);
            if (action) action();
          }}
          className="fixed top-4 inset-x-3 sm:inset-x-auto sm:right-4 sm:max-w-md z-[100] cursor-pointer animate-slide-down select-none"
        >
          <div className={`p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-white backdrop-blur-md transition-all ${
            alertModal.type === "success" 
              ? "bg-emerald-600/95" 
              : alertModal.type === "error" 
              ? "bg-rose-600/95" 
              : "bg-slate-900/95"
          }`}>
            <div className="shrink-0 h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
              {alertModal.type === "success" && <CheckCircle2 className="h-5 w-5 text-white" />}
              {alertModal.type === "error" && <AlertTriangle className="h-5 w-5 text-white" />}
              {alertModal.type === "info" && <Info className="h-5 w-5 text-white" />}
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-black uppercase tracking-wider text-white/90 leading-tight">
                {alertModal.title}
              </p>
              <p className="text-xs font-bold text-white leading-snug mt-0.5">
                {alertModal.message}
              </p>
            </div>
            <button className="shrink-0 text-white/80 hover:text-white p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

