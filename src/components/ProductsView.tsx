/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Check, Cpu, Info, X, AlertTriangle, CheckCircle2, Lock, Clock } from "lucide-react";
import { Product, Investment } from "../types";
import { api } from "../lib/api";
import { getCurrencySymbol } from "../lib/currency";

const PRODUCT_IMAGES: Record<number, { url: string; label: string; bgGradient: string; textAccent: string }> = {
  1: {
    url: "/public/nutrien_bag.svg",
    label: "Nutrien Ag Élite",
    bgGradient: "from-emerald-50 to-green-50",
    textAccent: "text-emerald-600"
  },
  2: {
    url: "/public/nutrien_bag.svg",
    label: "Nutrien Ag Premium",
    bgGradient: "from-teal-50 to-emerald-50",
    textAccent: "text-teal-600"
  },
  3: {
    url: "/public/nutrien_bag.svg",
    label: "Nutrien Ag Gold",
    bgGradient: "from-amber-50 to-yellow-50",
    textAccent: "text-amber-600"
  },
  4: {
    url: "/public/nutrien_bag.svg",
    label: "Nutrien Ag Platinum",
    bgGradient: "from-green-50 to-emerald-50",
    textAccent: "text-green-600"
  },
  5: {
    url: "/public/nutrien_bag.svg",
    label: "Nutrien Ag Infini",
    bgGradient: "from-emerald-50 to-green-50",
    textAccent: "text-emerald-600"
  },
  6: {
    url: "/public/nutrien_bag.svg",
    label: "Nutrien Ag Saphir",
    bgGradient: "from-teal-50 to-cyan-50",
    textAccent: "text-teal-700"
  },
  7: {
    url: "/public/nutrien_bag.svg",
    label: "Nutrien Ag Diamant",
    bgGradient: "from-amber-50 to-emerald-50",
    textAccent: "text-emerald-700"
  }
};

const getProductConfig = (level: number) => {
  return PRODUCT_IMAGES[level] || {
    url: "/public/nutrien_bag.svg",
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
        title: "Investissement Réussi",
        message: response.message || `Votre investissement de ${product.price.toLocaleString()} ${currency} dans "${product.name}" a été complété avec succès !`,
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
        {products.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Cpu className="h-8 w-8 text-slate-300 mx-auto animate-pulse mb-2" />
            <p className="text-sm font-black text-slate-600">Aucun produit disponible</p>
            <p className="text-xs text-slate-400 mt-0.5">Revenez bientôt pour de nouveaux plans.</p>
          </div>
        ) : (
          products.map((prod) => {
            const ownedCount = getSubscribedCount(prod.id);
            const isBuying = buyingId === prod.id;
            const config = getProductConfig(prod.level);
            const isBlocked = prod.isBlocked;

            return (
              <div 
                id={`product-card-${prod.id}`}
                key={prod.id}
                className="bg-white/90 rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden"
              >
                {/* Product Image Showcase Banner with Text Overlay */}
                <div className="w-full h-56 sm:h-64 rounded-2xl bg-gradient-to-br from-slate-100 via-emerald-50/30 to-slate-200 relative overflow-hidden flex items-center justify-center border border-slate-200/80 shadow-inner">
                  {/* Image */}
                  <img 
                    src={config.url} 
                    alt={config.label}
                    referrerPolicy="no-referrer"
                    className={`h-full max-h-52 sm:max-h-60 object-contain drop-shadow-lg transition-transform duration-300 hover:scale-105 ${isBlocked ? "opacity-40 grayscale-[20%]" : ""}`}
                  />

                  {/* Top Overlay Row: Badges */}
                  <div className="absolute top-3 inset-x-3 flex justify-between items-center z-10">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-mono font-black px-2.5 py-1 rounded-xl shadow-md border border-slate-700/50">
                        POD-{prod.level}
                      </span>
                      <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-xl shadow-md border border-amber-300 flex items-center gap-1">
                        <span>💎</span> VIP {prod.level - 1}
                      </span>
                    </div>

                    {ownedCount > 0 && !isBlocked && (
                      <span className="bg-green-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1 uppercase border border-green-500">
                        <Check className="h-3.5 w-3.5 stroke-[3]" /> {ownedCount} Actif{ownedCount > 1 ? "s" : ""}
                      </span>
                    )}

                    {isBlocked && (
                      <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-1 rounded-xl shadow-md">
                        <Lock className="h-3.5 w-3.5 text-slate-950" /> Verrouillé
                      </span>
                    )}
                  </div>

                  {/* Gradient Overlay for Text Readability at Bottom of Image */}
                  <div className="absolute inset-x-0 bottom-0 pt-10 pb-3 px-3 sm:px-4 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-transparent flex flex-col justify-end z-10">
                    <h4 className="text-base sm:text-lg font-black text-white leading-tight drop-shadow-sm">
                      {config.label}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-200 font-bold mt-0.5 drop-shadow-sm truncate">
                      {prod.name}
                    </p>
                  </div>

                  {/* Blocked Full Overlay if in preparation */}
                  {isBlocked && (
                    <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px] flex items-center justify-center p-2 text-center z-20">
                      <span className="bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-2xl uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
                        <Clock className="h-4 w-4 animate-spin" />
                        EN COURS DE PRÉPARATION
                      </span>
                    </div>
                  )}
                </div>

                {/* Larger Key-Value Pairs Specification Box */}
                <div className="space-y-1.5 text-xs font-bold text-slate-600 bg-slate-50/90 p-3 rounded-2xl border border-slate-200/60">
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
          })
        )}
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

      {/* Alert Modal */}
      {alertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xs w-full p-4 shadow-xl border border-slate-100 text-center space-y-3">
            <div className="mx-auto h-9 w-9 rounded-full flex items-center justify-center text-xl">
              {alertModal.type === "success" && <CheckCircle2 className="h-8 w-8 text-green-500" />}
              {alertModal.type === "error" && <AlertTriangle className="h-8 w-8 text-red-500" />}
              {alertModal.type === "info" && <Info className="h-8 w-8 text-emerald-500" />}
            </div>

            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-black text-slate-900">{alertModal.title}</h3>
              <p className="text-[10.5px] text-slate-500 leading-snug">{alertModal.message}</p>
            </div>

            <button
              onClick={() => {
                const action = alertModal.onClose;
                setAlertModal(null);
                if (action) action();
              }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-black cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

