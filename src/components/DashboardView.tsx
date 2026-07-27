/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  PlusCircle, 
  ArrowDownCircle, 
  Activity,
  History, 
  TrendingUp, 
  Users, 
  Megaphone, 
  Bell, 
  Wallet, 
  Cpu, 
  X, 
  Grid, 
  ArrowUpRight, 
  Coins,
  CheckCircle,
  HelpCircle,
  Gift,
  MessageCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CreditCard,
  Award,
  FileText,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Camera,
  Share2,
  ShoppingBag,
  Check,
  Lock,
  Clock,
  Sparkles,
  Headphones,
  Calendar,
  Volume2
} from "lucide-react";
import { User, Transaction, Investment, Product, UserReview, GlobalNotification } from "../types";
import WellbeingFlux from "./WellbeingFlux";
import { api } from "../lib/api";
import { getCurrencySymbol } from "../lib/currency";
import ProductImage from "./ProductImage";

const PRODUCT_IMAGES: Record<number, { url: string; label: string }> = {
  0: { url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80", label: "Nutrien Ag Découverte (VIP 0)" },
  1: { url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80", label: "Nutrien Ag Élite (Produits Agricoles)" },
  2: { url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80", label: "Nutrien Ag Premium (Lait Milk)" },
  3: { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80", label: "Nutrien Ag Gold (Récoltes Agricoles)" },
  4: { url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80", label: "Nutrien Ag Platinum (Lait Pur)" },
  5: { url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80", label: "Nutrien Ag Infini (Céréales & Grains)" },
  6: { url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80", label: "Nutrien Ag Saphir (Agro-Alimentaire)" },
  7: { url: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80", label: "Nutrien Ag Diamant (Complexe Agricole)" },
  8: { url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80", label: "Nutrien Ag Rubis (Parc Éolien & Irrigation)" },
  9: { url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80", label: "Nutrien Ag Émeraude (Centrale Solaire Agricole)" },
  10: { url: "https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=800&q=80", label: "Nutrien Ag Alchimie (Exportation Agro-Industrielle)" },
  11: { url: "https://images.unsplash.com/photo-1595838729819-374d7f82a71a?auto=format&fit=crop&w=800&q=80", label: "Nutrien Ag Titane (Consortium Agro Global)" }
};

const getProductConfig = (level: number) => {
  return PRODUCT_IMAGES[level] || {
    url: "/nutrien_bag.svg",
    label: `Nutrien VIP ${level}`
  };
};

interface DashboardViewProps {
  user: User;
  investments: Investment[];
  transactions: Transaction[];
  products: Product[];
  onRefresh: () => void;
  setActiveTab: (tab: string) => void;
}

const LIVE_WITHDRAWALS = [
  { phone: "+229 97****42", amount: "1 500 XOF" },
  { phone: "+237 69****81", amount: "2 000 XAF" },
  { phone: "+225 07****33", amount: "1 400 XOF" },
  { phone: "+228 90****11", amount: "4 700 XOF" },
  { phone: "+237 65****20", amount: "1 000 XAF" },
  { phone: "+229 96****90", amount: "3 200 XOF" },
  { phone: "+226 70****15", amount: "2 500 XOF" },
  { phone: "+237 67****44", amount: "5 000 XAF" },
];

const LIVE_RECHARGES = [
  { phone: "65****596", action: "rechargé", amount: "1,950XAF" },
  { phone: "69****003", action: "rechargé", amount: "10,000XAF" },
  { phone: "67****421", action: "rechargé", amount: "5,000XAF" },
  { phone: "69****812", action: "rechargé", amount: "2,000XAF" },
  { phone: "97****420", action: "rechargé", amount: "1,500XOF" },
  { phone: "65****209", action: "rechargé", amount: "3,000XAF" },
  { phone: "07****331", action: "rechargé", amount: "1,400XOF" },
  { phone: "69****003", action: "rechargé", amount: "10,000XAF" },
];

export default function DashboardView({ 
  user, 
  investments, 
  transactions, 
  products, 
  onRefresh,
  setActiveTab
}: DashboardViewProps) {
  // Currency symbol (XAF for Cameroon +237, XOF for others)
  const currency = getCurrencySymbol(user.phone);

  // Clean user display name
  const isGenericName = !user.name || user.name === "Administrateur Général" || user.name === "Investisseur Nutrien";
  const displayName = isGenericName ? "Mon Compte" : user.name;

  // Announcement read tracking per user
  const getReadNotifIds = (): string[] => {
    try {
      const storageKey = `nutrien_read_notif_ids_${user.phone}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
      return [];
    } catch {
      return [];
    }
  };

  // UI states
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
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  // Pointage (Daily Check-in) handler
  const handlePointage = async () => {
    setCheckingIn(true);
    try {
      const resp = await api.checkIn();
      setAlertModal({
        title: "Pointage Validé !",
        message: resp.message || `Pointage quotidien réussi ! +20 ${currency} ajoutés à votre solde.`,
        type: "success",
        onClose: () => onRefresh()
      });
    } catch (err: any) {
      setAlertModal({
        title: "Pointage Déjà Effectué",
        message: err.message || "Vous avez déjà effectué votre pointage aujourd'hui. Revenez demain !",
        type: "info"
      });
    } finally {
      setCheckingIn(false);
    }
  };

  // Investment / Product purchase states
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [activeConfirmProduct, setActiveConfirmProduct] = useState<Product | null>(null);

  const handleInvest = (product: Product) => {
    if (product.isBlocked) {
      setAlertModal({
        title: "Produit En Cours",
        message: `Le plan "${product.name}" est actuellement en cours de préparation / verrouillé. Veuillez repasser plus tard.`,
        type: "info"
      });
      return;
    }
    if (user.balance < product.price) {
      setAlertModal({
        title: "Solde Insuffisant",
        message: `Votre solde (${user.balance.toLocaleString()} ${currency}) est insuffisant. Veuillez recharger votre portefeuille de ${(product.price - user.balance).toLocaleString()} ${currency}.`,
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
        message: response.message || `Souscription à "${product.name}" (${product.price.toLocaleString()} ${currency}) activée avec succès !`,
        type: "success",
        onClose: () => onRefresh()
      });
    } catch (err: any) {
      setAlertModal({
        title: "Échec de la souscription",
        message: err.message || "Une erreur est survenue lors de la validation du produit.",
        type: "error"
      });
    } finally {
      setBuyingId(null);
    }
  };

  const getSubscribedCount = (pId: string) => {
    return investments.filter(i => i.productId === pId).length;
  };

  // Eye visibility state
  const [showBalance, setShowBalance] = useState(true);

  // Announcements & Notifications states
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [announcements, setAnnouncements] = useState<GlobalNotification[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  const loadAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const res = await api.getNotifications();
      setAnnouncements(res.notifications || []);
    } catch (err) {
      console.warn("Erreur de chargement des annonces:", err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Proof of withdrawal & community proofs states
  const [communityProofs, setCommunityProofs] = useState<UserReview[]>([]);
  const [loadingProofs, setLoadingProofs] = useState(false);
  const [previewProofImage, setPreviewProofImage] = useState<string | null>(null);

  const [showPublishProof, setShowPublishProof] = useState(false);
  const [proofAmount, setProofAmount] = useState("");
  const [proofMethod, setProofMethod] = useState("MTN Mobile Money");
  const [proofNote, setProofNote] = useState("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  // Fetch approved community proofs from server
  const loadCommunityProofs = async () => {
    setLoadingProofs(true);
    try {
      const res = await api.getReviews();
      setCommunityProofs(res.reviews || []);
    } catch (err) {
      console.warn("Erreur de chargement des preuves communautaires:", err);
    } finally {
      setLoadingProofs(false);
    }
  };

  useEffect(() => {
    loadCommunityProofs();
    loadAnnouncements();
  }, []);

  // Handle proof image file change with compression
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setAlertModal({
          title: "Fichier trop lourd",
          message: "Veuillez choisir une image de moins de 10 Mo.",
          type: "error"
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1000;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
            setProofImage(compressedDataUrl);
          } else {
            setProofImage(event.target?.result as string);
          }
        };
        img.onerror = () => {
          setProofImage(event.target?.result as string);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit published proof
  const handlePublishProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofAmount || parseFloat(proofAmount) <= 0) {
      setAlertModal({
        title: "Montant requis",
        message: "Veuillez indiquer le montant du retrait.",
        type: "error"
      });
      return;
    }
    if (!proofImage) {
      setAlertModal({
        title: "Capture requise",
        message: "Veuillez importer la capture d'écran de votre notification de retrait.",
        type: "error"
      });
      return;
    }

    setIsPublishing(true);
    try {
      await api.submitReview({
        rating: 5,
        comment: `[PREUVE DE RETRAIT - ${parseFloat(proofAmount).toLocaleString()} ${currency}] ${proofNote ? proofNote : "Retrait bien reçu avec succès !"}`.trim(),
        image: proofImage,
      });

      setIsPublishing(false);
      setPublishedSuccess(true);
      loadCommunityProofs();
      setTimeout(() => {
        setPublishedSuccess(false);
        setShowPublishProof(false);
        setProofAmount("");
        setProofNote("");
        setProofImage(null);
        setAlertModal({
          title: "Preuve Publiée !",
          message: "Félicitations ! Votre preuve de retrait a été transmise à l'administrateur et sera affichée sur la plateforme après validation.",
          type: "success"
        });
      }, 1200);
    } catch (err: any) {
      setIsPublishing(false);
      setAlertModal({
        title: "Erreur",
        message: err.message || "Impossible de publier la preuve.",
        type: "error"
      });
    }
  };

  // Calculated totals for executive metrics
  const totalInvested = investments.reduce((sum, inv) => sum + inv.price, 0);
  const totalDailyIncome = investments.reduce((sum, inv) => sum + inv.dailyIncome, 0);

  return (
    <div className="space-y-5 text-slate-800 pb-4 w-full overflow-x-hidden">
      
      {/* --- TOP FLUX MARQUEE (RECHARGES EN DIRECT AVEC HAUT-PARLEUR) --- */}
      <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl py-2.5 px-3.5 shadow-2xs flex items-center gap-3 overflow-hidden select-none">
        <div className="shrink-0 flex items-center text-slate-800">
          <Volume2 className="h-5.5 w-5.5 text-slate-800 stroke-[2.2]" />
        </div>
        <div className="overflow-hidden w-full relative">
          <div className="animate-marquee flex items-center gap-6 whitespace-nowrap text-xs sm:text-sm text-slate-800">
            {[...LIVE_RECHARGES, ...LIVE_RECHARGES, ...LIVE_RECHARGES].map((item, idx) => (
              <span key={idx} className="shrink-0 flex items-center gap-1.5">
                <span className="font-bold text-slate-900">{item.phone}</span>
                <span className="text-slate-600 font-normal">{item.action}</span>
                <span className="font-extrabold text-slate-900">{item.amount}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Balance Display */}
      <div className="relative rounded-3xl text-slate-900 p-5 sm:p-6 bg-white overflow-hidden shadow-xs">
        {/* Decorative Top Tri-color Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 via-orange-400 to-orange-500" />

        {/* Top Header Row inside Card */}
        <div className="flex items-center justify-between relative z-10 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CreditCard className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 block">
                Solde Portefeuille
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-700 leading-tight">
                Portefeuille Principal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Sécurisé
            </span>

            <button
              onClick={() => setActiveTab("history")}
              className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 transition-all cursor-pointer relative"
              title="Historique"
            >
              <History className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
              title={showBalance ? "Masquer le solde" : "Afficher le solde"}
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Main Solde Display */}
        <div className="mt-4 relative z-10 pt-1">
          <p className="text-xs sm:text-sm font-bold text-slate-600 flex items-center justify-between">
            <span>Solde disponible</span>
          </p>
          <div className="flex items-baseline gap-2.5 mt-1.5">
            <h2 id="dashboard-total-balance" className="text-3.5xl sm:text-4xl md:text-5xl font-black tracking-tight text-emerald-800 font-mono">
              {showBalance ? user.balance.toLocaleString() : "••••••••"}
            </h2>
            <span className="text-sm sm:text-base font-black bg-orange-500 text-white px-2.5 py-1 rounded-lg shadow-2xs">
              {currency}
            </span>
          </div>
        </div>
      </div>

      {/* --- BANDEAU ACTIONS RAPIDES (5 Boutons alignés) --- */}
      <div className="py-2">
        <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-3.5 px-1 flex items-center justify-between">
          <span>Opérations Rapides</span>
          <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2.5 py-0.5 rounded-full">
            Nutrien Ag Solutions
          </span>
        </h3>
        <div className="grid grid-cols-5 gap-2 sm:gap-3 text-center">
          {/* 1. Recharger */}
          <button
            id="dash-action-deposit"
            onClick={() => setActiveTab("deposit")}
            className="flex flex-col items-center justify-center group cursor-pointer"
          >
            <div className="w-12 h-12 sm:w-15 sm:h-15 rounded-2xl bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white group-active:scale-95 transition-all shadow-xs shadow-orange-500/20">
              <svg className="h-6 w-6 sm:h-7 sm:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="6" width="18" height="12" rx="2.5" strokeWidth="2.2" />
                <path d="M16 12h.01" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M3 10h18" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900 mt-2 tracking-tight truncate w-full">Recharger</span>
          </button>

          {/* 2. Retirer */}
          <button
            id="dash-action-withdraw"
            onClick={() => setActiveTab("withdraw")}
            className="flex flex-col items-center justify-center group cursor-pointer"
          >
            <div className="w-12 h-12 sm:w-15 sm:h-15 rounded-2xl bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white group-active:scale-95 transition-all shadow-xs shadow-emerald-600/20">
              <svg className="h-6 w-6 sm:h-7 sm:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 16V8m0 0l-3.5 3.5M12 8l3.5 3.5" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900 mt-2 tracking-tight truncate w-full">Retirer</span>
          </button>

          {/* 3. Preuves -> Certificat */}
          <button
            id="dash-action-proofs"
            onClick={() => setActiveTab("proofs")}
            className="flex flex-col items-center justify-center group cursor-pointer"
          >
            <div className="w-12 h-12 sm:w-15 sm:h-15 rounded-2xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white group-active:scale-95 transition-all shadow-xs shadow-indigo-600/20">
              <Award className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900 mt-2 tracking-tight truncate w-full">Certificat</span>
          </button>

          {/* 4. Pointage */}
          <button
            id="dash-action-checkin"
            onClick={handlePointage}
            disabled={checkingIn}
            className="flex flex-col items-center justify-center group cursor-pointer disabled:opacity-60"
          >
            <div className="w-12 h-12 sm:w-15 sm:h-15 rounded-2xl bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-white group-active:scale-95 transition-all shadow-xs shadow-amber-500/20">
              {checkingIn ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Calendar className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              )}
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900 mt-2 tracking-tight truncate w-full">Pointage</span>
          </button>

          {/* 5. Annonces */}
          {(() => {
            const readNotifIds = getReadNotifIds();
            const unreadCount = announcements.filter(n => !readNotifIds.includes(n.id)).length;
            return (
              <button
                id="dash-action-announcements"
                onClick={() => {
                  try {
                    const storageKey = `nutrien_read_notif_ids_${user.phone}`;
                    const allIds = announcements.map(n => n.id);
                    localStorage.setItem(storageKey, JSON.stringify(allIds));
                  } catch (e) {}
                  setActiveTab("announcements");
                }}
                className="flex flex-col items-center justify-center group cursor-pointer relative"
              >
                <div className="w-12 h-12 sm:w-15 sm:h-15 rounded-2xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white group-active:scale-95 transition-all shadow-xs shadow-blue-600/20 relative">
                  <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 text-white font-black text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce z-10">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-black text-slate-900 mt-2 tracking-tight truncate w-full">Annonces</span>
              </button>
            );
          })()}
        </div>
      </div>

      {/* --- FLUX DE PRODUITS DU BIEN-ÊTRE --- */}
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

        return (
          <>
            <WellbeingFlux
              products={visibleProducts}
              currency={currency}
              onInvest={handleInvest}
              getSubscribedCount={getSubscribedCount}
            />

            {/* --- SECTION DES PRODUITS & OFFRES D'INVESTISSEMENT SUR L'ACCUEIL --- */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <ShoppingBag className="h-4.5 w-4.5 text-emerald-600" />
                    Offres d'Équipements & Produits Nutrien
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                    Choisissez un produit et commencez à percevoir vos revenus passifs quotidiens
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full">
                  {visibleProducts.length} Offres
                </span>
              </div>

              {/* Product Cards List */}
              <div className="space-y-4 pt-1">
                {visibleProducts.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-xs font-bold">Aucun produit disponible pour le moment.</p>
                  </div>
                ) : (
                  visibleProducts.map((prod) => {
                    const ownedCount = getSubscribedCount(prod.id);
                    const isBuying = buyingId === prod.id;
                    const config = getProductConfig(prod.level);
                    const isBlocked = prod.isBlocked;

                    return (
                      <div 
                        id={`dash-product-card-${prod.id}`}
                        key={prod.id}
                        className={`rounded-2xl p-3.5 space-y-3 relative overflow-hidden transition-all ${
                          isBlocked ? "bg-slate-100/90 border border-slate-300/80 opacity-80" : "bg-slate-50 border border-slate-200/60 shadow-2xs"
                        }`}
                      >
                        {/* Showcase Banner Image with Overlay */}
                        <div className="w-full h-48 sm:h-56 rounded-xl bg-gradient-to-br from-slate-100 via-emerald-50/50 to-slate-200 relative overflow-hidden flex items-center justify-center">
                          <ProductImage 
                            src={prod.image || config.url} 
                            alt={prod.name || config.label}
                            level={prod.level}
                            isBlocked={isBlocked}
                            className="w-full h-full transition-transform duration-300 hover:scale-105"
                          />

                          {/* Top Overlay Badges */}
                          <div className="absolute top-2.5 inset-x-2.5 flex justify-between items-center z-10">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-lg">
                                POD {prod.level}
                              </span>
                              <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-2 py-0.5 rounded-lg shadow-xs flex items-center gap-1">
                                <span>💎</span> {prod.name.replace(/-/g, " ").trim()}
                              </span>
                            </div>

                      {ownedCount > 0 && !isBlocked && (
                        <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xs flex items-center gap-1 uppercase">
                          <Check className="h-3 w-3 stroke-[3]" /> {ownedCount} Acheté{ownedCount > 1 ? "s" : ""}
                        </span>
                      )}

                      {isBlocked && (
                        <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xs border border-amber-300/80">
                          <Lock className="h-3 w-3 text-slate-950" /> Désactivé
                        </span>
                      )}
                    </div>

                    {/* Bottom Text Overlay */}
                    <div className={`absolute inset-x-0 bottom-0 pt-8 pb-2.5 px-3 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-transparent flex flex-col justify-end z-10 ${isBlocked ? "blur-[1px]" : ""}`}>
                      <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                        {config.label}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-200 font-bold truncate">
                        {prod.name}
                      </p>
                    </div>

                    {/* Blocked Overlay with Blur */}
                    {isBlocked && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-2 text-center z-20">
                        <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1 shadow-2xl border border-amber-300">
                          <Clock className="h-3.5 w-3.5 animate-spin" />
                          EN COURS DE PRÉPARATION
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Specs Box (Blurred if isBlocked) */}
                  <div className={`grid grid-cols-3 gap-1.5 text-center text-xs font-bold text-slate-700 bg-white p-2.5 rounded-xl shadow-2xs ${isBlocked ? "blur-[2px] opacity-70 select-none" : ""}`}>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-extrabold block">Durée</span>
                      <span className="text-slate-900 font-black text-xs">{prod.durationDays} Jours</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-extrabold block">Revenu / Jour</span>
                      <span className="text-emerald-700 font-black text-xs">+{prod.dailyIncome.toLocaleString()} F</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-extrabold block">Total Estimé</span>
                      <span className="text-blue-700 font-black text-xs">{prod.totalIncome.toLocaleString()} F</span>
                    </div>
                  </div>

                  {/* Price & Buy Button */}
                  <div className="flex h-11 items-center bg-white rounded-xl overflow-hidden shadow-2xs">
                    <div className="flex-[5] flex items-center justify-center h-full px-2 text-emerald-900 font-black text-xs sm:text-sm tracking-wide bg-emerald-50/50">
                      {prod.price.toLocaleString()} {currency}
                    </div>

                    {isBlocked ? (
                      <button
                        disabled
                        className="flex-[7] bg-amber-500/90 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 h-full cursor-not-allowed uppercase tracking-wider"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        <span>En cours</span>
                      </button>
                    ) : (
                      <button
                        id={`dash-btn-invest-${prod.id}`}
                        onClick={() => handleInvest(prod)}
                        disabled={isBuying}
                        className="flex-[7] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 h-full text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        {isBuying ? (
                          <div className="h-4 w-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span className="text-yellow-300">⚡</span>
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
      </div>
    </>
  );
})()}

      {/* MODAL CONFIRMATION ACHAT PRODUIT */}
      {activeConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
          <div className="bg-white rounded-3xl max-w-xs w-full p-4 shadow-2xl border-2 border-emerald-500 relative space-y-3">
            <button
              onClick={() => setActiveConfirmProduct(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="text-center space-y-1.5 pt-1">
              <div className="mx-auto h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-xl font-black shadow-xs">
                🛍️
              </div>
              <h3 className="text-sm font-black text-slate-900">Confirmer la Souscription</h3>
              <p className="text-[11px] text-slate-500 leading-snug">
                Voulez-vous vraiment acheter le produit <span className="font-extrabold text-slate-900">"{activeConfirmProduct.name}"</span> pour <span className="font-extrabold text-emerald-700">{activeConfirmProduct.price.toLocaleString()} {currency}</span> ?
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 text-[11px] space-y-1.5 text-slate-600 border border-slate-200/80">
              <div className="flex justify-between font-bold">
                <span>Revenu Quotidien :</span>
                <span className="text-emerald-700 font-black">+{activeConfirmProduct.dailyIncome.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Période du Contrat :</span>
                <span className="text-slate-900 font-extrabold">{activeConfirmProduct.durationDays} Jours</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200/80 pt-1.5">
                <span>Revenu Total Estimé :</span>
                <span className="text-blue-700 font-black">{activeConfirmProduct.totalIncome.toLocaleString()} {currency}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setActiveConfirmProduct(null)}
                className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-black text-slate-600 cursor-pointer"
              >
                Annuler
              </button>
              <button
                id="confirm-buy-product-btn"
                onClick={() => {
                  const prod = activeConfirmProduct;
                  setActiveConfirmProduct(null);
                  executeInvest(prod);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-emerald-600/20"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CERTIFICAT OFFICIEL ET PREUVES DE RETRAIT */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/75 backdrop-blur-sm animate-fade-in select-none max-h-screen overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col space-y-3.5 my-auto max-h-[90vh]">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-600 to-amber-600 p-4 -m-4 sm:-m-5 mb-1 text-white text-center relative shrink-0">
              <button
                onClick={() => {
                  setShowCertificateModal(false);
                  setShowPublishProof(false);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="w-11 h-11 mx-auto bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-xs mb-1.5">
                <Award className="h-6 w-6 text-amber-300" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                Certificats Officiels & Preuves
              </h3>
              <p className="text-[10.5px] text-emerald-100 font-bold mt-0.5">
                Nutrien Ag Solutions® Global Agriculture Inc.
              </p>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto pr-1 space-y-3.5 max-h-[62vh] text-left">
              {/* BOUTON / FORMULAIRE "Publier Preuve de Retrait" */}
              <div className="space-y-3">
                {!showPublishProof ? (
                  <button
                    onClick={() => setShowPublishProof(true)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-xs font-black cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Publier mon Certificat de Retrait</span>
                  </button>
                ) : (
                  <div className="bg-orange-50/60 p-3.5 rounded-2xl space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-orange-200/60 pb-2">
                      <div className="flex items-center gap-1.5 text-orange-800">
                        <Upload className="h-4 w-4 text-orange-600" />
                        <h4 className="text-xs font-black uppercase">Soumettre un Certificat de Retrait</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPublishProof(false)}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {publishedSuccess ? (
                      <div className="bg-emerald-100/80 p-3 rounded-xl text-emerald-800 text-center space-y-1 py-4">
                        <CheckCircle2 className="h-7 w-7 text-emerald-600 mx-auto" />
                        <p className="text-xs font-black">Certificat Transmis avec Succès !</p>
                        <p className="text-[11px] text-emerald-700">Votre certificat est désormais visible sur le compte de tout le monde.</p>
                      </div>
                    ) : (
                      <form onSubmit={handlePublishProofSubmit} className="space-y-2.5 text-left">
                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-700 block mb-1">
                            Montant du Retrait Reçu ({currency}) *
                          </label>
                          <input
                            type="number"
                            placeholder="ex: 25000"
                            value={proofAmount}
                            onChange={(e) => setProofAmount(e.target.value)}
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-700 block mb-1">
                            Capture d'écran / Reçu SMS *
                          </label>
                          {proofImage ? (
                            <div className="relative rounded-xl overflow-hidden max-h-36 bg-slate-100 flex items-center justify-center">
                              <img src={proofImage} alt="Preuve" className="object-contain max-h-36 w-full" />
                              <button
                                type="button"
                                onClick={() => setProofImage(null)}
                                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full cursor-pointer"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center border border-dashed border-orange-300 rounded-xl p-3 bg-white hover:bg-orange-50/50 cursor-pointer transition-all text-center">
                              <Camera className="h-5 w-5 text-orange-500 mb-1" />
                              <span className="text-[11px] font-black text-slate-800">
                                Importer la Capture du Reçu
                              </span>
                              <span className="text-[9px] text-slate-400 mt-0.5">JPG, PNG (Max 5Mo)</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-700 block mb-1">
                            Témoignage (Optionnel)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="ex: Retrait bien reçu sous 5 minutes !"
                            value={proofNote}
                            onChange={(e) => setProofNote(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isPublishing}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          {isPublishing ? (
                            <span>Envoi en cours...</span>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Soumettre ma Preuve</span>
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* GALERIE DE PREUVES PUBLIÉES PAR LA COMMUNAUTÉ */}
              <div className="pt-2 space-y-2.5 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      Téléchargement des preuves par l'utilisateur
                    </h4>
                  </div>
                  <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Communauté Réelle
                  </span>
                </div>

                {loadingProofs ? (
                  <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
                    Chargement des preuves réelles...
                  </div>
                ) : communityProofs.length === 0 ? (
                  <div className="py-6 text-center bg-slate-50 rounded-2xl p-4 text-xs text-slate-500 space-y-1">
                    <p className="font-bold">Aucune preuve disponible pour le moment.</p>
                    <p className="text-[10px] text-slate-400">Soyez le premier à publier votre reçu de retrait ci-dessus !</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {communityProofs.map((proof) => {
                      // Mask phone number for privacy e.g. 97****12
                      const rawPhone = proof.userPhone || "";
                      const maskedPhone = rawPhone.length > 5 
                        ? `${rawPhone.substring(0, 2)}****${rawPhone.substring(rawPhone.length - 2)}` 
                        : rawPhone;

                      return (
                        <div key={proof.id} className="bg-slate-50 p-3 rounded-2xl space-y-2 text-slate-800 shadow-2xs">
                          {/* User Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center uppercase">
                                {(proof.userName || "U")[0]}
                              </div>
                              <div>
                                <p className="text-[11px] font-extrabold text-slate-900 leading-none">
                                  {proof.userName || "Membre Nutrien"}
                                </p>
                                <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">
                                  Tél : {maskedPhone} • {new Date(proof.createdAt).toLocaleDateString("fr-FR")}
                                </p>
                              </div>
                            </div>
                            <span className="text-[9px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Retrait Validé
                            </span>
                          </div>

                          {/* Comment / Note */}
                          <p className="text-xs font-semibold text-slate-700 italic bg-white p-2.5 rounded-xl leading-relaxed">
                            "{proof.comment}"
                          </p>

                          {/* Screenshot Image Thumbnail if available */}
                          {proof.image && (
                            <div className="rounded-xl overflow-hidden bg-slate-900/5 max-h-48 flex items-center justify-center p-1">
                              <img 
                                src={proof.image} 
                                alt="Capture du reçu" 
                                className="max-h-44 w-auto object-contain rounded-lg cursor-zoom-in hover:opacity-95 transition-opacity"
                                onClick={() => setPreviewProofImage(proof.image || null)}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Action */}
            <div className="pt-1 shrink-0">
              <button
                onClick={() => {
                  setShowCertificateModal(false);
                  setShowPublishProof(false);
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black cursor-pointer transition-all active:scale-98"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN PROOF IMAGE PREVIEW LIGHTBOX */}
      {previewProofImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in">
          <button
            onClick={() => setPreviewProofImage(null)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full cursor-pointer transition-all"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-w-xl max-h-[85vh] overflow-hidden rounded-2xl p-2 flex items-center justify-center">
            <img 
              src={previewProofImage} 
              alt="Preuve agrandie" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
          <p className="text-xs text-white/80 mt-2 font-bold">Capture d'écran du reçu de retrait</p>
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
              {alertModal.type === "success" && <CheckCircle className="h-5 w-5 text-white" />}
              {alertModal.type === "error" && <div className="text-white text-base font-black">⚠️</div>}
              {alertModal.type === "info" && <HelpCircle className="h-5 w-5 text-white" />}
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
