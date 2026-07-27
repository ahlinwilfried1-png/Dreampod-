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
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/60">
        {/* Left Card: Nombre de produits */}
        <div className="bg-slate-100/80 rounded-2xl p-3 flex flex-col justify-center border border-slate-200/60">
          <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider block">
            Formules Actives
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-600 mt-1 font-mono">
            {investments.length}
          </span>
        </div>

        {/* Right Card: Revenus collectés */}
        <div className="bg-slate-100/80 rounded-2xl p-3 flex flex-col justify-center text-right border border-slate-200/60">
          <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider block">
            Revenus collectés
          </span>
          <span className="text-lg sm:text-xl font-black text-green-600 mt-1 font-mono">
            {investments.reduce((sum, inv) => sum + (inv.daysPassed * inv.dailyIncome), 0).toLocaleString()} <span className="text-xs font-extrabold text-slate-500 font-sans">{currency}</span>
          </span>
        </div>
      </div>

      {/* List of Products */}
      <div className="space-y-4">
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
              <div className="text-center py-12 px-4">
                <Cpu className="h-8 w-8 text-slate-300 mx-auto animate-pulse mb-2" />
                <p className="text-sm font-black text-slate-600">Aucun produit disponible</p>
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
                className={`rounded-3xl p-3.5 sm:p-4 border transition-all space-y-3 relative overflow-hidden ${
                  isBlocked ? "bg-slate-100/90 border-slate-300/80 opacity-80" : "bg-white/90 border-slate-200/80 shadow-xs hover:shadow-md"
                }`}
              >
                {/* Product Image Showcase Banner with Text Overlay */}
                <div className="w-full h-52 sm:h-60 md:h-64 rounded-2xl bg-gradient-to-br from-slate-100 via-emerald-50/30 to-slate-200 relative overflow-hidden flex items-center justify-center border border-slate-200/80 shadow-inner">
                  {/* Image */}
                  <ProductImage
                    src={prod.image || config.url}
                    alt={prod.name || config.label}
                    level={prod.level}
                    isBlocked={isBlocked}
                    className="w-full h-full transition-transform duration-300 hover:scale-105"
                  />

                  {/* Top Overlay Row: Badges */}
                  <div className="absolute top-3 inset-x-3 flex justify-between items-center z-10">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-mono font-black px-2.5 py-1 rounded-xl shadow-md border border-slate-700/50">
                        POD {prod.level}
                      </span>
                      <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-xl shadow-md border border-amber-300 flex items-center gap-1">
                        <span>💎</span> {prod.name.replace(/-/g, " ").trim()}
                      </span>
                    </div>

                    {ownedCount > 0 && !isBlocked && (
                      <span className="bg-green-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1 uppercase border border-green-500">
                        <Check className="h-3.5 w-3.5 stroke-[3]" /> {ownedCount} Actif{ownedCount > 1 ? "s" : ""}
                      </span>
                    )}

                    {isBlocked && (
                      <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-1 rounded-xl shadow-md border border-amber-300/80">
                        <Lock className="h-3.5 w-3.5 text-slate-950" /> Désactivé
                      </span>
                    )}
                  </div>

                  {/* Gradient Overlay for Text Readability at Bottom of Image */}
                  <div className={`absolute inset-x-0 bottom-0 pt-10 pb-3 px-3 sm:px-4 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-transparent flex flex-col justify-end z-10 ${isBlocked ? "blur-[1px]" : ""}`}>
                    <h4 className="text-base sm:text-lg font-black text-white leading-tight drop-shadow-sm">
                      {config.label}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-200 font-bold mt-0.5 drop-shadow-sm truncate">
                      {prod.name}
                    </p>
                  </div>

                  {/* Blocked Full Overlay with Blur */}
                  {isBlocked && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 text-center z-20">
                      <span className="bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-2xl uppercase tracking-wider flex items-center gap-1.5 shadow-2xl border border-amber-300">
                        <Clock className="h-4 w-4 animate-spin" />
                        EN COURS DE PRÉPARATION
                      </span>
                    </div>
                  )}
                </div>

                {/* Larger Key-Value Pairs Specification Box (Blurred if isBlocked) */}
                <div className={`space-y-1.5 text-xs font-bold text-slate-600 bg-slate-50/90 p-3 rounded-2xl border border-slate-200/60 ${isBlocked ? "blur-[2px] opacity-70 select-none" : ""}`}>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">Durée du contrat</span>
                    <span className="text-slate-900 font-extrabold text-xs sm:text-sm">{prod.durationDays} Jours</span>
                  </div>

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">Revenus Quotidiens</span>
                    <span className="text-emerald-700 font-black text-xs sm:text-sm">{currency} {prod.dailyIncome.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">Rendement Total</span>
                    <span className="text-blue-700 font-black text-xs sm:text-sm">{currency} {prod.totalIncome.toLocaleString()}</span>
                  </div>
                </div>

                {/* Larger Integrated Pill Button */}
                <div className="flex h-11 sm:h-12 items-center bg-slate-100/90 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs">
                  {/* Price display side */}
                  <div className="flex-[5] flex items-center justify-center h-full px-3 text-[#1e3a8a] font-black text-xs sm:text-sm tracking-wide">
                    {currency} {prod.price.toLocaleString()}
                  </div>

                  {/* Invest button side */}
                  {isBlocked ? (
                    <button
                      id={`btn-invest-action-${prod.id}`}
                      disabled
                      className="flex-[7] bg-amber-500/90 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 h-full cursor-not-allowed opacity-90 uppercase tracking-wider"
                    >
                      <Lock className="h-4 w-4 text-slate-900" />
                      <span>En cours</span>
                    </button>
                  ) : (
                    <button
                      id={`btn-invest-action-${prod.id}`}
                      onClick={() => handleInvest(prod)}
                      disabled={isBuying}
                      className="flex-[7] bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 h-full text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isBuying ? (
                        <div className="h-4 w-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span className="text-yellow-300 text-sm">⚡</span>
                          <span>Souscrire</span>
                        </>
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

