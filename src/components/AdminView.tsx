/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Users, 
  Wallet, 
  PlusCircle, 
  Gift, 
  Megaphone, 
  Check, 
  X, 
  Search, 
  TrendingUp, 
  UserMinus, 
  UserCheck, 
  DollarSign, 
  Cpu, 
  Bell, 
  Eye, 
  ArrowUpRight, 
  ArrowDownLeft,
  Coins,
  RefreshCw,
  Star,
  Clock,
  ShoppingBag,
  Edit,
  Trash2
} from "lucide-react";
import { User, Transaction, Product, BonusCode, UserReview, Investment } from "../types";
import { api, getLocalDbExport, saveLocalDbExport, getUseLocalFallback, setUseLocalFallback } from "../lib/api";

interface AdminViewProps {
  onRefresh: () => void;
}

export default function AdminView({ onRefresh }: AdminViewProps) {
  // Navigation internal tab
  const [adminTab, setAdminTab] = useState<"stats" | "users" | "deposits" | "withdrawals" | "products" | "codes" | "notifications" | "reviews" | "investments" | "channels">("stats");

  // User Edit Form State
  const [editingUser, setEditingUser] = useState<any>(null); // holds user object being edited
  const [editUserName, setEditUserName] = useState("");
  const [editUserPhone, setEditUserPhone] = useState("");
  const [editUserBalance, setEditUserBalance] = useState("");
  const [editUserPassword, setEditUserPassword] = useState("");
  const [editUserCommission, setEditUserCommission] = useState("");

  // Product Edit Form State
  const [editingProduct, setEditingProduct] = useState<any>(null); // holds product object being edited
  const [editProdName, setEditProdName] = useState("");
  const [editProdPrice, setEditProdPrice] = useState("");
  const [editProdDailyIncome, setEditProdDailyIncome] = useState("");
  const [editProdDuration, setEditProdDuration] = useState("");
  const [editProdCategory, setEditProdCategory] = useState<'stability' | 'wellbeing' | 'activity'>("stability");

  // Server data states
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [txsList, setTxsList] = useState<Transaction[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [codesList, setCodesList] = useState<BonusCode[]>([]);
  const [reviewsList, setReviewsList] = useState<UserReview[]>([]);
  const [investmentsList, setInvestmentsList] = useState<Investment[]>([]);
  const [channelsList, setChannelsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sub-action loaders/alerts
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [btnLoadingId, setBtnLoadingId] = useState<string | null>(null);

  // Custom modal states to replace window.confirm and window.alert (sandboxed iframe safety)
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  } | null>(null);

  const [alertState, setAlertState] = useState<{
    title: string;
    message: string;
    onClose?: () => void;
  } | null>(null);

  // Bonus form State
  const [showBonusUserModal, setShowBonusUserModal] = useState<any>(null); // holds user object
  const [bonusAmount, setBonusAmount] = useState("1000");
  const [bonusReason, setBonusReason] = useState("Récompense d'activité");

  // Product Add Form State
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodDailyIncome, setProdDailyIncome] = useState("");
  const [prodDuration, setProdDuration] = useState("30");
  const [prodCategory, setProdCategory] = useState<'stability' | 'wellbeing' | 'activity'>("stability");

  // Code Gen Form State
  const [codeString, setCodeString] = useState("");
  const [codeValue, setCodeValue] = useState("500");
  const [codeLimits, setCodeLimits] = useState("100");

  // Notice Broadcaster State
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyBody, setNotifyBody] = useState("");

  // Database Mode and Synchronization State
  const [isLocalFallback, setIsLocalFallback] = useState(getUseLocalFallback());
  const [syncing, setSyncing] = useState(false);
  const [isSupabaseHealthy, setIsSupabaseHealthy] = useState<boolean | null>(null);

  // Sync with remote server logic
  const handleDatabaseSync = async () => {
    setSyncing(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const localDb = getLocalDbExport();
      
      const payload = {
        users: localDb.users || [],
        transactions: localDb.transactions || [],
        investments: localDb.investments || [],
        userReviews: localDb.userReviews || [],
        forumPosts: localDb.forumPosts || [],
      };

      const syncResult = await api.admin.sync(payload);
      
      // Update local storage database with the fully synchronized state returned by the server
      if (syncResult && syncResult.db) {
        saveLocalDbExport(syncResult.db);
      }
      
      // Toggle local fallback to false (switch to live server)
      setUseLocalFallback(false);
      setIsLocalFallback(false);
      
      const { addedUsersCount, addedTransactionsCount, addedInvestmentsCount, addedReviewsCount, addedForumPostsCount } = syncResult.details || {};
      
      setAlertState({
        title: "🔄 Synchronisation Réussie !",
        message: `La base de données locale a été fusionnée avec succès sur le serveur Cloud Run !
        
• Comptes ajoutés : ${addedUsersCount || 0}
• Transactions ajoutées (dépôts/retraits) : ${addedTransactionsCount || 0}
• Produits payés synchronisés : ${addedInvestmentsCount || 0}
• Avis/Forum fusionnés : ${(addedReviewsCount || 0) + (addedForumPostsCount || 0)}

Vous êtes maintenant connecté sur la base de données du serveur en temps réel.`,
      });

      // Reload admin data from the live server!
      loadAdminData();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || "La synchronisation a échoué. Assurez-vous que le serveur est bien en ligne.");
      setAlertState({
        title: "Échec de Synchronisation",
        message: err.message || "Impossible de joindre le serveur pour synchroniser les données."
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleDatabaseMode = (useLocal: boolean) => {
    setUseLocalFallback(useLocal);
    setIsLocalFallback(useLocal);
    setTimeout(() => {
      loadAdminData();
      onRefresh();
    }, 100);
  };

  // Fetch all administrative telemetry on mount / refresh
  const loadAdminData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setErrorMsg("");
    }
    try {
      const statsResp = await api.admin.getStats();
      setGlobalStats(statsResp.stats);
      if (statsResp && typeof statsResp.isSupabaseHealthy === "boolean") {
        setIsSupabaseHealthy(statsResp.isSupabaseHealthy);
      }

      const usersResp = await api.admin.getUsers(searchQuery);
      setUsersList(usersResp.users);

      const txsResp = await api.admin.getTransactions();
      setTxsList(txsResp.transactions);

      const productsResp = await api.getProducts();
      setProductsList(productsResp.products);

      const codesResp = await api.admin.getBonusCodes();
      setCodesList(codesResp.bonusCodes);

      try {
        const reviewsResp = await api.admin.getReviews();
        setReviewsList(reviewsResp.reviews || []);
      } catch (revErr) {
        console.warn("Reviews module not active or loading failed:", revErr);
      }

      try {
        const invsResp = await api.admin.getInvestments();
        setInvestmentsList(invsResp.investments || []);
      } catch (invErr) {
        console.warn("Investments loading failed:", invErr);
      }

      try {
        const channelsResp = await api.getPaymentChannels();
        setChannelsList(channelsResp.channels || []);
      } catch (chanErr) {
        console.warn("Channels loading failed:", chanErr);
      }
    } catch (err: any) {
      if (!silent) {
        setErrorMsg(err.message || "Erreur de chargement des services admin.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleUpdateChannels = async (updatedChannels: any[]) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await api.admin.updatePaymentChannels(updatedChannels);
      setSuccessMsg(res.message || "Canaux de paiement mis à jour avec succès !");
      setChannelsList(res.channels || updatedChannels);
      loadAdminData();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de mise à jour des canaux de paiement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    
    // Set up real-time automatic polling every 5 seconds to sync registrations/actions from other devices
    const interval = setInterval(() => {
      loadAdminData(true);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [adminTab, searchQuery]);

  // Actions
  const handleToggleBlock = async (user: any) => {
    const actionWord = user.isBlocked ? "débloquer" : "bloquer";
    setConfirmState({
      title: `${user.isBlocked ? "Débloquer" : "Bloquer"} l'utilisateur`,
      message: `Voulez-vous vraiment ${actionWord} l'utilisateur "${user.name}" (${user.phone}) ?`,
      confirmText: "Confirmer",
      cancelText: "Annuler",
      onConfirm: async () => {
        setBtnLoadingId(user.id);
        try {
          const response = await api.admin.blockUser(user.id, !user.isBlocked);
          setAlertState({
            title: "Succès",
            message: response.message || `L'utilisateur a été ${user.isBlocked ? "débloqué" : "bloqué"}.`,
          });
          loadAdminData();
          onRefresh();
        } catch (err: any) {
          setAlertState({
            title: "Erreur",
            message: err.message || "Une erreur est survenue.",
          });
        } finally {
          setBtnLoadingId(null);
        }
      }
    });
  };

  const handleSendBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBonusUserModal) return;

    const amt = Number(bonusAmount);
    if (!amt || amt <= 0) {
      setAlertState({
        title: "Montant invalide",
        message: "Veuillez renseigner un montant valide."
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.admin.addUserBonus(showBonusUserModal.id, amt, bonusReason.trim());
      setShowBonusUserModal(null);
      setBonusAmount("1000");
      setBonusReason("Récompense d'activité");
      setAlertState({
        title: "Bonus ajouté",
        message: response.message || "Bonus ajouté avec succès !"
      });
      loadAdminData();
      onRefresh();
    } catch (err: any) {
      setAlertState({
        title: "Erreur",
        message: err.message || "Une erreur est survenue."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTx = async (txId: string, action: "approve" | "reject") => {
    const actionLabel = action === "approve" ? "APPROUVER ET CRÉDITER" : "REJETER ET ANNULER";
    setConfirmState({
      title: "Validation de Transaction",
      message: `Confirmez-vous l'action : ${actionLabel} sur la transaction "${txId}" ?`,
      confirmText: "Confirmer",
      cancelText: "Annuler",
      onConfirm: async () => {
        setBtnLoadingId(txId);
        try {
          const response = await api.admin.verifyTransaction(txId, action);
          setAlertState({
            title: "Transaction traitée",
            message: response.message || "Transaction mise à jour !",
          });
          loadAdminData();
          onRefresh();
        } catch (err: any) {
          setAlertState({
            title: "Erreur",
            message: err.message || "Une erreur est survenue.",
          });
        } finally {
          setBtnLoadingId(null);
        }
      }
    });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodDailyIncome) {
      setAlertState({
        title: "Champs obligatoires",
        message: "Veuillez compléter toutes les données."
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.admin.addProduct({
        name: prodName.trim(),
        price: Number(prodPrice),
        dailyIncome: Number(prodDailyIncome),
        durationDays: Number(prodDuration),
        category: prodCategory,
      });
      setProdName("");
      setProdPrice("");
      setProdDailyIncome("");
      setProdDuration("30");
      setProdCategory("stability");
      setAlertState({
        title: "Offre VIP Publiée",
        message: response.message || "Produit ajouté !"
      });
      loadAdminData();
    } catch (err: any) {
      setAlertState({
        title: "Erreur",
        message: err.message || "Une erreur est survenue."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setConfirmState({
      title: "Supprimer le plan VIP",
      message: "Êtes-vous sûr de vouloir supprimer définitivement ce plan VIP ? Les investissements en cours resteront actifs.",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      onConfirm: async () => {
        setLoading(true);
        try {
          const response = await api.admin.deleteProduct(productId);
          setAlertState({
            title: "Plan supprimé",
            message: response.message || "Le plan VIP a été retiré.",
          });
          loadAdminData();
        } catch (err: any) {
          setAlertState({
            title: "Erreur",
            message: err.message || "Une erreur est survenue lors de la suppression.",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeString) {
      setAlertState({
        title: "Code requis",
        message: "Le libellé de code est impératif."
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.admin.generateBonusCode(
        codeString.trim(),
        Number(codeValue),
        Number(codeLimits)
      );
      setCodeString("");
      setCodeValue("500");
      setCodeLimits("100");
      setAlertState({
        title: "Code cadeau configuré",
        message: response.message || "Code cadeau configuré !",
      });
      loadAdminData();
    } catch (err: any) {
      setAlertState({
        title: "Erreur",
        message: err.message || "Une erreur est survenue lors de la configuration.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyTitle || !notifyBody) {
      setAlertState({
        title: "Champs requis",
        message: "Veuillez saisir un titre et un contenu."
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.admin.sendNotification(
        notifyTitle.trim(),
        notifyBody.trim()
      );
      setNotifyTitle("");
      setNotifyBody("");
      setAlertState({
        title: "Annonce diffusée",
        message: response.message || "Annonce diffusée !",
      });
      loadAdminData();
    } catch (err: any) {
      setAlertState({
        title: "Erreur",
        message: err.message || "Une erreur est survenue.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReview = async (reviewId: string, action: "approve" | "reject") => {
    const actionLabel = action === "approve" ? "APPROUVER ET RENDRE PUBLIC" : "REJETER";
    setConfirmState({
      title: "Vérifier l'avis",
      message: `Voulez-vous vraiment ${actionLabel} cet avis d'utilisateur ?`,
      confirmText: "Confirmer",
      cancelText: "Annuler",
      onConfirm: async () => {
        setBtnLoadingId(reviewId);
        try {
          const response = await api.admin.verifyReview(reviewId, action);
          setAlertState({
            title: "Avis mis à jour",
            message: response.message || "Avis mis à jour !",
          });
          loadAdminData();
        } catch (err: any) {
          setAlertState({
            title: "Erreur",
            message: err.message || "Une erreur est survenue.",
          });
        } finally {
          setBtnLoadingId(null);
        }
      }
    });
  };

  const handleDeleteReview = async (reviewId: string) => {
    setConfirmState({
      title: "Supprimer l'avis",
      message: "Voulez-vous vraiment supprimer DÉFINITIVEMENT cet avis d'utilisateur ?",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      onConfirm: async () => {
        setBtnLoadingId(reviewId);
        try {
          const response = await api.admin.deleteReview(reviewId);
          setAlertState({
            title: "Avis supprimé",
            message: response.message || "Avis supprimé !",
          });
          loadAdminData();
        } catch (err: any) {
          setAlertState({
            title: "Erreur",
            message: err.message || "Une erreur est survenue.",
          });
        } finally {
          setBtnLoadingId(null);
        }
      }
    });
  };

  const handleEditUserClick = (usr: any) => {
    setEditingUser(usr);
    setEditUserName(usr.name);
    setEditUserPhone(usr.phone);
    setEditUserBalance(usr.balance.toString());
    setEditUserPassword(usr.password || "");
    setEditUserCommission(usr.commissionEarned?.toString() || "0");
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    try {
      const response = await api.admin.updateUser(editingUser.id, {
        name: editUserName.trim(),
        phone: editUserPhone.trim(),
        balance: Number(editUserBalance),
        password: editUserPassword.trim(),
        commissionEarned: Number(editUserCommission),
      });
      setAlertState({
        title: "Compte mis à jour",
        message: response.message || "Compte utilisateur mis à jour !"
      });
      setEditingUser(null);
      loadAdminData();
      onRefresh();
    } catch (err: any) {
      setAlertState({
        title: "Erreur",
        message: err.message || "Erreur de mise à jour."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    setConfirmState({
      title: "🚨 SUPPRESSION COMPTE UTILISATEUR 🚨",
      message: `⚠️ ATTENTION ! Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT le compte de l'utilisateur "${userName}" ? Cette action effacera également tous ses investissements et son historique de transactions. Cette action est IRREVERSIBLE.`,
      confirmText: "Oui, Supprimer définitivement",
      cancelText: "Annuler",
      onConfirm: async () => {
        setLoading(true);
        try {
          const response = await api.admin.deleteUser(userId);
          setAlertState({
            title: "Compte supprimé",
            message: response.message || "Compte utilisateur supprimé avec succès !"
          });
          loadAdminData();
          onRefresh();
        } catch (err: any) {
          setAlertState({
            title: "Erreur",
            message: err.message || "Erreur lors de la suppression de l'utilisateur."
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProduct(p);
    setEditProdName(p.name);
    setEditProdPrice(p.price.toString());
    setEditProdDailyIncome(p.dailyIncome.toString());
    setEditProdDuration(p.durationDays.toString());
    setEditProdCategory(p.category);
  };

  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setLoading(true);
    try {
      const response = await api.admin.updateProduct(editingProduct.id, {
        name: editProdName.trim(),
        price: Number(editProdPrice),
        dailyIncome: Number(editProdDailyIncome),
        durationDays: Number(editProdDuration),
        category: editProdCategory,
      });
      setAlertState({
        title: "Produit mis à jour",
        message: response.message || "Plan VIP mis à jour !"
      });
      setEditingProduct(null);
      loadAdminData();
    } catch (err: any) {
      setAlertState({
        title: "Erreur",
        message: err.message || "Erreur lors de la modification du produit."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProductBlock = async (product: Product) => {
    setLoading(true);
    try {
      const newStatus = !product.isBlocked;
      const response = await api.admin.updateProduct(product.id, { isBlocked: newStatus });
      setAlertState({
        title: newStatus ? "Produit désactivé" : "Produit activé",
        message: response.message || `Le produit a été ${newStatus ? 'désactivé' : 'activé'} avec succès.`
      });
      loadAdminData();
    } catch (err: any) {
      setAlertState({
        title: "Erreur",
        message: err.message || "Erreur lors de la modification du statut du produit."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvestment = async (id: string, planName: string, userName: string) => {
    setConfirmState({
      title: "Supprimer le produit payé",
      message: `Voulez-vous vraiment supprimer le produit payé "${planName}" acheté par l'utilisateur "${userName}" ? Ses gains s'arrêteront.`,
      confirmText: "Supprimer",
      cancelText: "Annuler",
      onConfirm: async () => {
        setLoading(true);
        try {
          const response = await api.admin.deleteInvestment(id);
          setAlertState({
            title: "Produit payé supprimé",
            message: response.message || "Produit payé supprimé !"
          });
          loadAdminData();
          onRefresh();
        } catch (err: any) {
          setAlertState({
            title: "Erreur",
            message: err.message || "Erreur lors de la suppression du produit payé."
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="space-y-6 pb-28 text-slate-800 select-none bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-md">
      
      {/* Title */}
      <div className="flex items-center justify-between py-1 relative">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 shadow-2xs">
            <Shield id="icon-admin-logo" className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-950">Panneau d'Administration</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Dreampod Control Center</p>
          </div>
        </div>

        <button
          id="admin-btn-reload"
          onClick={loadAdminData}
          disabled={loading}
          className="p-2.5 rounded-xl bg-white text-blue-600 hover:text-white hover:bg-blue-600 border border-slate-200 hover:border-blue-600 shadow-2xs transition-all cursor-pointer active:scale-95"
        >
          <RefreshCw className={`h-4.5 w-4.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Synchronization Control Center */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-3xs select-none">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Mode Synchro Temps Réel :{" "}
              <span className="font-black text-emerald-800">
                Activé
              </span>
            </h3>
            <p className="text-[11px] text-emerald-700 leading-normal max-w-xl">
              Toutes les inscriptions, dépôts, retraits et opérations effectués sur n'importe quel appareil sont automatiquement enregistrés et synchronisés ici en temps réel toutes les 5 secondes sans rechargement.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <div className="py-1 px-2.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
              En Ligne
            </div>
          </div>
        </div>
      </div>

      {isSupabaseHealthy === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-3xs animate-slide-in">
          <div className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-black">
              ⚠️
            </span>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-amber-900">
                Liaison Base de Données Globale : Clé API Supabase Invalide
              </h4>
              <p className="text-[11px] text-amber-700 leading-normal">
                Les clés API configurées dans les secrets de l'application (<code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[10px]">SUPABASE_URL</code> et <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[10px]">SUPABASE_SERVICE_ROLE_KEY</code>) sont absentes, expirées ou incorrectes. 
              </p>
              <p className="text-[11px] text-amber-700 leading-normal font-bold">
                💡 Conséquence : Les données sont stockées temporairement dans le stockage local du serveur et ne seront pas synchronisées si les utilisateurs se connectent depuis différents téléphones.
              </p>
              <div className="pt-1 text-[10.5px] text-amber-800 font-semibold leading-normal">
                Comment résoudre ce problème :
                <ol className="list-decimal pl-4 mt-1 space-y-0.5 font-normal">
                  <li>Allez dans le menu <strong className="font-bold">Settings (Paramètres/Secrets)</strong> de AI Studio en haut à droite.</li>
                  <li>Vérifiez et remplacez la clé de service <strong className="font-bold">SUPABASE_SERVICE_ROLE_KEY</strong> par une clé valide de votre projet Supabase.</li>
                  <li>Assurez-vous que la table <strong className="font-bold">dreampod_state</strong> est créée dans votre base Supabase si nécessaire.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin navigation layout sub-tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 select-none no-scrollbar">
        {[
          { id: "stats", label: "Analytiques", icon: TrendingUp },
          { id: "users", label: "Utilisateurs", icon: Users },
          { id: "deposits", label: "Dépôts", icon: ArrowUpRight },
          { id: "withdrawals", label: "Retraits", icon: ArrowDownLeft },
          { id: "investments", label: "Produits Payés", icon: ShoppingBag },
          { id: "products", label: "Plans VIP", icon: Cpu },
          { id: "codes", label: "Codes/Bonus", icon: Gift },
          { id: "notifications", label: "Annonces", icon: Bell },
          { id: "reviews", label: "Avis Clients", icon: Star },
          { id: "channels", label: "Canaux ⚙️", icon: Wallet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              id={`admin-tab-btn-${tab.id}`}
              key={tab.id}
              onClick={() => { setAdminTab(tab.id as any); }}
              className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Error box if any */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-600">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* --- PANEL 1: STATISTICS ANALYTICOS --- */}
      {adminTab === "stats" && globalStats && (
        <div className="space-y-6">
          
          {/* Section: Total Dépôt et Retrait */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold tracking-wider text-slate-500 uppercase px-1 flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-500" />
              Total de dépôt et retrait (Validés)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Total Dépôts */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Dépôts</p>
                  <p className="text-sm font-black text-emerald-600 mt-0.5">{(globalStats.totalDeposited || 0).toLocaleString()} F</p>
                </div>
              </div>

              {/* Total Retraits */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Retraits</p>
                  <p className="text-sm font-black text-red-600 mt-0.5">{(globalStats.totalWithdrawn || 0).toLocaleString()} F</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: En attente de validation */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold tracking-wider text-slate-500 uppercase px-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Demandes En Attente de Validation
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Dépôts en attente */}
              <button 
                onClick={() => setAdminTab("deposits")}
                className="text-left bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between hover:border-blue-300 transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Dépôts En Attente</p>
                </div>
                <div>
                  <p className="text-base font-black text-amber-500">{(globalStats.numberOfPendingDeposits || 0)} demandes</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Val: {(globalStats.totalPendingDepositsAmount || 0).toLocaleString()} F</p>
                </div>
              </button>

              {/* Retraits en attente */}
              <button 
                onClick={() => setAdminTab("withdrawals")}
                className="text-left bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between hover:border-red-300 transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Retraits En Attente</p>
                </div>
                <div>
                  <p className="text-base font-black text-red-500">{(globalStats.numberOfPendingWithdrawals || 0)} demandes</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Val: {(globalStats.totalPendingWithdrawalsAmount || 0).toLocaleString()} F</p>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Pending Validation list directly on Dashboard */}
          {txsList.filter(t => t.status === "pending").length > 0 && (
            <div className="space-y-3 bg-amber-50/40 border border-amber-200/60 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-4 w-4 animate-spin text-amber-600" />
                  Validation rapide des dépôts et retraits en attente
                </h4>
                <button 
                  onClick={() => setAdminTab("deposits")} 
                  className="text-[10px] font-extrabold text-blue-600 hover:underline"
                >
                  Voir toutes les transactions
                </button>
              </div>
              
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 no-scrollbar">
                {txsList.filter(t => t.status === "pending").map((tx) => (
                  <div key={tx.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs flex justify-between items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded ${
                          tx.type === "deposit" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                        }`}>
                          {tx.type === "deposit" ? "Dépôt" : "Retrait"}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{tx.userName}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">📞 {tx.userPhone} | Canal: {tx.method}</p>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className={`text-xs font-black block ${tx.type === "deposit" ? "text-green-600" : "text-red-600"}`}>
                          {tx.type === "deposit" ? "+" : "-"}{tx.amount.toLocaleString()} F
                        </span>
                        <span className="text-[8px] text-slate-400 block">{new Date(tx.date).toLocaleDateString()}</span>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleVerifyTx(tx.id, "approve")}
                          disabled={btnLoadingId === tx.id}
                          className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors cursor-pointer border border-green-200"
                          title="Approuver"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleVerifyTx(tx.id, "reject")}
                          disabled={btnLoadingId === tx.id}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors cursor-pointer border border-red-200"
                          title="Rejeter"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Actifs & Inventaires */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold tracking-wider text-slate-500 uppercase px-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Les Utilisateurs, Produits & Produits Payés
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {/* Les Utilisateurs */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Utilisateurs Enregistrés</p>
                    <p className="text-[10px] text-slate-500">Nombre total de comptes clients actifs</p>
                  </div>
                </div>
                <span className="text-base font-black text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-100">
                  {globalStats.totalUsers || 0}
                </span>
              </div>

              {/* Les Produits */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Produits / Plans d'Investissement</p>
                    <p className="text-[10px] text-slate-500">Nombre d'offres VIP configurées</p>
                  </div>
                </div>
                <span className="text-base font-black text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-xl border border-indigo-100">
                  {globalStats.numberOfProducts || 0}
                </span>
              </div>

              {/* Produits Payés / Investissements */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Produits Payés (Investissements)</p>
                    <p className="text-[10px] text-slate-500">Total des machines achetées par les clients</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-amber-600 block">
                    {globalStats.totalPurchasedProductsCount || 0}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {(globalStats.totalPurchasedProductsAmount || 0).toLocaleString()} F
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Marges & Profits */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-600 p-5 rounded-2xl shadow-md text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-extrabold text-blue-100 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  Bénéfices Estimés de la Plateforme (FCFA)
                </p>
                <p className="text-2xl font-black text-white mt-1">{(globalStats.platformRevenues || 0).toLocaleString()} FCFA</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl border border-white/20 text-white font-bold text-xs">
                Net / 2026
              </div>
            </div>
          </div>

          {/* Visual SVG Chart representing daily trajectory */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Graphique Analytique du Trafic Mensuel</h4>
            
            {/* SVG Visual Graphic */}
            <div className="h-44 w-full relative">
              <svg className="w-full h-full text-blue-500" viewBox="0 0 400 120">
                <defs>
                  <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="20" x2="400" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                
                {/* Area filled path under */}
                <path
                  d="M 0 100 L 40 85 L 80 60 L 120 75 L 160 50 L 200 40 L 240 55 L 280 30 L 320 20 L 360 45 L 400 10 L 400 105 L 0 105 Z"
                  fill="url(#chart-grad)"
                />
                
                {/* Line path */}
                <path
                  d="M 0 100 L 40 85 L 80 60 L 120 75 L 160 50 L 200 40 L 240 55 L 280 30 L 320 20 L 360 45 L 400 10"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Circles nodes points */}
                <circle cx="80" cy="60" r="3.5" fill="#00a3e0" stroke="white" strokeWidth="1" />
                <circle cx="200" cy="40" r="3.5" fill="#00a3e0" stroke="white" strokeWidth="1" />
                <circle cx="320" cy="20" r="3.5" fill="#00a3e0" stroke="white" strokeWidth="1" />
                <circle cx="400" cy="10" r="3.5" fill="#00a3e0" stroke="white" strokeWidth="1" />
              </svg>

              {/* Data tags */}
              <div className="absolute top-1 right-2 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-sm text-[9px] text-blue-600 font-mono">
                +14.8% Hausse
              </div>
            </div>

            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-2 px-1">
              <span>Semaine 1</span>
              <span>Semaine 2</span>
              <span>Semaine 3</span>
              <span>Semaine 4</span>
            </div>
          </div>
        </div>
      )}

      {/* --- PANEL 2: USERS ACC MANAGEMENT --- */}
      {adminTab === "users" && (
        <div className="space-y-4">
          {/* User Search form */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              id="admin-search-users"
              type="text"
              placeholder="Rechercher par Nom, Téléphone, ou Code de Parrainage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 py-3 pl-11 pr-4 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-xs"
            />
          </div>

          {/* Users List block */}
          {usersList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl">
              Aucun utilisateur trouvé correspondant à la recherche.
            </div>
          ) : (
            <div className="space-y-3.5">
              {usersList.map((usr) => (
                <div 
                  id={`admin-user-card-${usr.id}`}
                  key={usr.id}
                  className={`p-4 bg-white border rounded-2xl relative shadow-xs ${
                    usr.isBlocked ? "border-red-200 bg-red-50/10 opacity-85" : "border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        {usr.name}
                        {usr.id === "usr_admin" && (
                          <span className="text-[8px] bg-red-50 border border-red-200 px-1.5 py-0.5 text-red-600 rounded-md font-black">ADMIN PRINCIPAL</span>
                        )}
                        {usr.isBlocked && (
                          <span className="text-[8px] bg-red-100 px-1.5 py-0.5 text-red-600 rounded-md font-bold border border-red-200">SUSPENDU</span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">📞 {usr.phone} | MDP: {usr.password}</p>
                      
                      {/* Financial info */}
                      <div className="flex gap-4 mt-2.5 text-[9.5px] text-slate-700">
                        <div>
                          <span className="text-slate-400 block uppercase tracking-wider font-semibold">Solde portefeuille</span>
                          <span className="font-extrabold mt-0.5 block text-blue-600">{usr.balance.toLocaleString()} FCFA</span>
                        </div>
                        <div className="border-l border-slate-200 pl-3">
                          <span className="text-slate-400 block uppercase tracking-wider font-semibold">Filleuls (1er Ordre)</span>
                          <span className="font-bold mt-0.5 block text-slate-800">{usr.referralsN1}</span>
                        </div>
                        <div className="border-l border-slate-200 pl-3">
                          <span className="text-slate-400 block uppercase tracking-wider font-semibold">Com. gagnées</span>
                          <span className="font-bold mt-0.5 block text-emerald-600">{usr.commissionEarned.toLocaleString()} F</span>
                        </div>
                      </div>

                      {/* Linked Wallet Info */}
                      {usr.linkedWalletNumber ? (
                        <div className="mt-3 p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl max-w-md text-[9.5px] font-medium text-slate-700">
                          <p className="text-[8px] uppercase font-black tracking-wider text-blue-600 mb-1 flex items-center gap-1">
                            💳 Portefeuille Mobile lié :
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-2 gap-y-0.5 text-slate-800">
                            <div>Opérateur : <strong className="font-extrabold uppercase">{usr.linkedWalletOperator}</strong></div>
                            <div>Numéro : <strong className="font-mono font-extrabold">{usr.linkedWalletNumber}</strong></div>
                            <div className="truncate">Titulaire : <strong className="font-extrabold">{usr.linkedWalletOwnerName}</strong></div>
                          </div>
                          {usr.withdrawalCode && (
                            <div className="mt-1 text-slate-500 text-[8.5px]">
                              Code de retrait confidentiel : <strong className="font-mono font-black text-slate-700 bg-white px-1 py-0.5 border border-slate-200 rounded">{usr.withdrawalCode}</strong>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 p-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-[9.5px] text-slate-400 font-semibold max-w-md">
                          ❌ Aucun portefeuille de paiement Mobile Money lié pour l'instant.
                        </div>
                      )}
                    </div>

                    {/* Actions dropdown layout */}
                    {usr.id !== "usr_admin" && (
                      <div className="flex flex-col space-y-1.5 shrink-0">
                        {/* Block/Unblock toggle */}
                        <button
                          id={`btn-block-user-${usr.id}`}
                          onClick={() => handleToggleBlock(usr)}
                          disabled={btnLoadingId === usr.id}
                          className={`py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase transition-all flex items-center justify-center space-x-1 border cursor-pointer ${
                            usr.isBlocked 
                              ? "bg-green-50 text-green-600 hover:bg-green-100 border-green-200" 
                              : "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                          }`}
                        >
                          {usr.isBlocked ? (
                            <>
                              <UserCheck className="h-3 w-3" />
                              <span>Activer</span>
                            </>
                          ) : (
                            <>
                              <UserMinus className="h-3 w-3" />
                              <span>Bloquer</span>
                            </>
                          )}
                        </button>

                        {/* Hand custom bonus button */}
                        <button
                          id={`btn-bonus-user-${usr.id}`}
                          onClick={() => { setShowBonusUserModal(usr); }}
                          className="bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 py-1.5 px-3 rounded-lg text-[9px] font-bold text-center flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Coins className="h-3 w-3 text-yellow-500 animate-pulse" />
                          <span>Bonus direct</span>
                        </button>

                        {/* Modifier account info */}
                        <button
                          id={`btn-edit-user-${usr.id}`}
                          onClick={() => handleEditUserClick(usr)}
                          className="bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 py-1.5 px-3 rounded-lg text-[9px] font-bold text-center flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <span>Modifier</span>
                        </button>

                        {/* Supprimer account */}
                        <button
                          id={`btn-delete-user-${usr.id}`}
                          onClick={() => handleDeleteUser(usr.id, usr.name)}
                          className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white py-1.5 px-3 rounded-lg text-[9px] font-bold text-center flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                        >
                          <span>Supprimer</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- PANEL 3A: DEPOSITS APPROVALS --- */}
      {adminTab === "deposits" && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Validation des Dépôts</h3>
          
          {txsList.filter(tx => tx.type === "deposit").length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-2xl">
              Aucun dépôt à traiter.
            </div>
          ) : (
            <div className="space-y-3">
              {txsList.filter(tx => tx.type === "deposit").map((tx) => {
                const isPending = tx.status === "pending";
                
                return (
                  <div 
                    id={`admin-tx-card-${tx.id}`}
                    key={tx.id} 
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        {/* User source information */}
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                            tx.type === "deposit" ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
                          }`}>
                            {tx.type === "deposit" ? "Dépôt" : "Retrait"}
                          </span>

                          <span className="text-[10px] text-slate-800 font-bold">{tx.userName}</span>
                        </div>
                        
                        <p className="text-[9.5px] text-slate-600 font-mono mt-1.5">📞 {tx.userPhone} | Canal: {tx.method}</p>
                        
                        {tx.simOwnerName && (
                          <div className="text-[10px] text-slate-700 font-semibold mt-1 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                            <span className="font-extrabold text-slate-500 uppercase text-[8px] tracking-wider block">ID Carte SIM</span>
                            {tx.simOwnerName}
                          </div>
                        )}
                        
                        {tx.receiverNumber && (
                          <div className="text-[10px] text-slate-700 font-semibold mt-1 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                            <span className="font-extrabold text-slate-500 uppercase text-[8px] tracking-wider block">Numéro Receveur</span>
                            {tx.receiverNumber}
                          </div>
                        )}
                        
                        {tx.txRefId && (
                          <div className="text-[10px] text-slate-700 font-semibold mt-1 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                            <span className="font-extrabold text-slate-500 uppercase text-[8px] tracking-wider block">ID / Référence</span>
                            {tx.txRefId}
                          </div>
                        )}

                        {tx.screenshot && (
                          <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-xl max-w-xs">
                            <span className="font-extrabold text-slate-500 uppercase text-[8px] tracking-wider block mb-1">Preuve Capture d'écran</span>
                            <img 
                              src={tx.screenshot} 
                              alt="Preuve" 
                              className="max-h-24 object-cover rounded-lg border border-slate-200 cursor-zoom-in hover:brightness-95 transition-all" 
                              onClick={() => {
                                const w = window.open();
                                if (w) {
                                  w.document.write(`<img src="${tx.screenshot}" style="max-width:100%; height:auto;" />`);
                                }
                              }}
                            />
                          </div>
                        )}

                        <p className="text-[9px] text-slate-400 mt-1">{new Date(tx.date).toLocaleString()}</p>
                      </div>

                      <div className="text-right">
                        <span className={`text-sm font-extrabold ${tx.type === "deposit" ? "text-green-600" : "text-red-600"}`}>
                          {tx.type === "deposit" ? "+" : "-"}{tx.amount.toLocaleString()} FCFA
                        </span>
                        
                        <div className="mt-1">
                          {isPending ? (
                            <span className="text-[8px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-sm font-bold border border-amber-200 uppercase tracking-wide">En Attente</span>
                          ) : (
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-bold border block ${
                              tx.status === "completed" ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"
                            }`}>
                              {tx.status === "completed" ? "VALIDÉ" : "REJETÉ"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Operational action toggles for waiting items */}
                    {isPending && (
                      <div className="flex justify-end gap-2 mt-4 pt-3.5 border-t border-slate-100">
                        <button
                          id={`btn-approve-tx-${tx.id}`}
                          onClick={() => handleVerifyTx(tx.id, "approve")}
                          disabled={btnLoadingId === tx.id}
                          className="cursor-pointer bg-green-600 hover:bg-green-500 text-white font-extrabold py-1.5 px-4 rounded-lg text-[10px] uppercase flex items-center gap-1 shadow-xs transition-all active:scale-95"
                        >
                          <Check className="h-3 w-3" />
                          <span>Approuver</span>
                        </button>

                        <button
                          id={`btn-reject-tx-${tx.id}`}
                          onClick={() => handleVerifyTx(tx.id, "reject")}
                          disabled={btnLoadingId === tx.id}
                          className="cursor-pointer bg-red-600 hover:bg-red-500 text-white font-extrabold py-1.5 px-4 rounded-lg text-[10px] uppercase flex items-center gap-1 shadow-xs transition-all active:scale-95"
                        >
                          <X className="h-3 w-3" />
                          <span>Rejeter</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- PANEL 3B: WITHDRAWALS APPROVALS --- */}
      {adminTab === "withdrawals" && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Validation des Retraits</h3>
          
          {txsList.filter(tx => tx.type === "withdrawal").length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-2xl">
              Aucun retrait à traiter.
            </div>
          ) : (
            <div className="space-y-3">
              {txsList.filter(tx => tx.type === "withdrawal").map((tx) => {
                const isPending = tx.status === "pending";
                
                return (
                  <div 
                    id={`admin-tx-card-${tx.id}`}
                    key={tx.id} 
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        {/* User source information */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-red-50 text-red-600 border border-red-200">
                            Retrait
                          </span>

                          <span className="text-[10px] text-slate-800 font-bold">{tx.userName}</span>
                        </div>
                        
                        <p className="text-[9.5px] text-slate-600 font-mono mt-1.5 font-bold">👤 {tx.userName} | ID: {tx.userId} | 📞 {tx.userPhone}</p>
                        <p className="text-[9.5px] text-emerald-700 font-bold mt-1">🏦 Canal : {tx.method}</p>
                        {tx.linkedWalletNumber && (
                          <div className="mt-2 p-2 bg-blue-50/50 border border-blue-100 rounded-xl text-[9.5px] text-slate-700 max-w-sm">
                            <span className="font-extrabold text-blue-600 uppercase text-[8px] tracking-wider block mb-0.5">🚀 Coordonnées de réception liées :</span>
                            <div className="space-y-0.5 text-slate-800">
                              <div>Opérateur : <strong className="font-extrabold uppercase">{tx.linkedWalletOperator}</strong></div>
                              <div>Numéro lié : <strong className="font-mono font-extrabold">{tx.linkedWalletNumber}</strong></div>
                              <div>Titulaire légal : <strong className="font-extrabold">{tx.linkedWalletOwnerName}</strong></div>
                            </div>
                          </div>
                        )}
                        <p className="text-[9px] text-slate-400 mt-1">{new Date(tx.date).toLocaleString()}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-red-600">
                          -{tx.amount.toLocaleString()} FCFA
                        </span>
                        
                        <div className="mt-1">
                          {isPending ? (
                            <span className="text-[8px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-sm font-bold border border-amber-200 uppercase tracking-wide">En Attente</span>
                          ) : (
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-bold border block ${
                              tx.status === "completed" ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"
                            }`}>
                              {tx.status === "completed" ? "VALIDÉ" : "REJETÉ"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Operational action toggles for waiting items */}
                    {isPending && (
                      <div className="flex justify-end gap-2 mt-4 pt-3.5 border-t border-slate-100">
                        <button
                          id={`btn-approve-tx-${tx.id}`}
                          onClick={() => handleVerifyTx(tx.id, "approve")}
                          disabled={btnLoadingId === tx.id}
                          className="cursor-pointer bg-green-600 hover:bg-green-500 text-white font-extrabold py-1.5 px-4 rounded-lg text-[10px] uppercase flex items-center gap-1 shadow-xs transition-all active:scale-95"
                        >
                          <Check className="h-3 w-3" />
                          <span>Approuver</span>
                        </button>

                        <button
                          id={`btn-reject-tx-${tx.id}`}
                          onClick={() => handleVerifyTx(tx.id, "reject")}
                          disabled={btnLoadingId === tx.id}
                          className="cursor-pointer bg-red-600 hover:bg-red-500 text-white font-extrabold py-1.5 px-4 rounded-lg text-[10px] uppercase flex items-center gap-1 shadow-xs transition-all active:scale-95"
                        >
                          <X className="h-3 w-3" />
                          <span>Rejeter</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- PANEL 4: PRODUCTS CREATIONS --- */}
      {adminTab === "products" && (
        <div className="space-y-5">
          {/* New plan creator tool */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-slate-800">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <PlusCircle className="text-blue-500 h-4 w-4" />
              Créer Nouveau Plan VIP d'Investissement
            </h4>

            <form onSubmit={handleAddProduct} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                
                {/* Title */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-0.5">Nom du Produit</label>
                  <input
                    id="admin-prod-title"
                    type="text"
                    required
                    placeholder="Ex: VIP7 - Plan Suprême"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-0.5">Prix d'activation (FCFA)</label>
                  <input
                    id="admin-prod-price"
                    type="number"
                    required
                    placeholder="Ex: 500000"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Incomes daily */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-0.5">Revenu Journalier (FCFA)</label>
                  <input
                    id="admin-prod-income"
                    type="number"
                    required
                    placeholder="Ex: 180000"
                    value={prodDailyIncome}
                    onChange={(e) => setProdDailyIncome(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

              </div>

              <button
                id="admin-prod-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-98 mt-2"
              >
                {loading ? "Création en cours..." : "Publier l'offre d'investissement"}
              </button>
            </form>
          </div>

          {/* Existing products ledger */}
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Offres VIP en Ligne ({productsList.length})</h3>
          <div className="grid grid-cols-1 gap-3">
             {productsList.map((p) => (
              <div key={p.id} className={`p-4 bg-white border rounded-xl flex items-center justify-between shadow-xs transition-all ${p.isBlocked ? 'border-red-200 bg-red-50/5 opacity-80' : 'border-slate-200'}`}>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {p.name}
                    {p.isBlocked && <span className="text-[8px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md font-bold uppercase border border-red-200">Désactivé</span>}
                    <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-mono border border-blue-100">VIPLevel {p.level}</span>
                  </h4>
                  <p className="text-[10px] text-emerald-600 font-black mt-1">+{p.dailyIncome.toLocaleString()} FCFA / Jour | Durée: {p.durationDays}J</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Prix d'achat : {p.price.toLocaleString()} FCFA</p>
                </div>

                <div className="flex gap-2">
                  <button
                    id={`admin-btn-toggle-prod-block-${p.id}`}
                    onClick={() => handleToggleProductBlock(p)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      p.isBlocked 
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                        : "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
                    }`}
                  >
                    {p.isBlocked ? "Activer" : "Bloquer"}
                  </button>
                  <button
                    id={`admin-btn-edit-prod-${p.id}`}
                    onClick={() => handleEditProductClick(p)}
                    className="bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    id={`admin-btn-delete-prod-${p.id}`}
                    onClick={() => handleDeleteProduct(p.id)}
                    className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- PANEL 5: GIFT CODES MANAGEMENT --- */}
      {adminTab === "codes" && (
        <div className="space-y-5">
          {/* Create bonus code form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-slate-800">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <PlusCircle className="text-blue-500 h-4 w-4" />
              Générer Code Cadeau Portefeuille
            </h4>

            <form onSubmit={handleGenerateCode} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                
                {/* ID code string */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-0.5">Code</label>
                  <input
                    id="admin-code-libelle"
                    type="text"
                    required
                    placeholder="Ex: WELCOME300"
                    value={codeString}
                    onChange={(e) => setCodeString(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 font-mono uppercase"
                  />
                </div>

                {/* Cash Values */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-0.5">Montant (F)</label>
                  <input
                    id="admin-code-amount"
                    type="number"
                    required
                    value={codeValue}
                    onChange={(e) => setCodeValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Utilization Limit */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-0.5">Limite Utilis</label>
                  <input
                    id="admin-code-limits"
                    type="number"
                    required
                    value={codeLimits}
                    onChange={(e) => setCodeLimits(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

              </div>

              <button
                id="admin-code-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-xs mt-1 active:scale-98"
              >
                Générer et activer le coupon cadeau
              </button>
            </form>
          </div>

          {/* Existing coupons list */}
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Codes Actifs en circulation ({codesList.length})</h3>
          <div className="space-y-2.5">
            {codesList.map((codeObj) => (
              <div key={codeObj.id} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs font-mono font-black text-amber-600 block uppercase tracking-wide">{codeObj.code}</span>
                  <span className="text-[9.5px] text-slate-400 mt-1 block">Créé le : {new Date(codeObj.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 block">+{codeObj.amount.toLocaleString()} FCFA</span>
                  <span className="text-[9.5px] text-slate-500 block mt-0.5">{codeObj.usedCount} / {codeObj.maxUses} réclamés</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- PANEL 6: NOTICE BROADCASTER --- */}
      {adminTab === "notifications" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-slate-800">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-3.5">
            <Megaphone className="text-blue-500 h-4.5 w-4.5 animate-bounce" />
            Diffuser une Annonce Système
          </h4>

          <form onSubmit={handleSendNotification} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-0.5">Titre de l'annonce</label>
              <input
                id="admin-notif-title"
                type="text"
                required
                placeholder="Ex: Alerte Maintenance Mobile Money"
                value={notifyTitle}
                onChange={(e) => setNotifyTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Contents info */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-0.5">Message complet de la notification</label>
              <textarea
                id="admin-notif-body"
                required
                rows={5}
                placeholder="Saisissez ici le contenu de la notification générale..."
                value={notifyBody}
                onChange={(e) => setNotifyBody(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              id="admin-notif-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs shadow-xs transition-all cursor-pointer active:scale-98"
            >
              🚀 Diffuser l'annonce à tous les utilisateurs
            </button>
          </form>
        </div>
      )}

      {/* --- PANEL 7: REVIEWS MODERATION --- */}
      {adminTab === "reviews" && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs text-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500">
              <Star className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Modération des Avis Clients</h3>
              <p className="text-[10px] text-slate-500">Validez ou rejetez les témoignages écrits par les utilisateurs</p>
            </div>
          </div>

          {reviewsList.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-10 bg-slate-50 border border-slate-200 rounded-xl">
              Aucun avis soumis pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                        <span className="text-[9.5px] text-slate-500 font-mono">📞 {rev.userPhone}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 text-yellow-500"
                            fill={i < rev.rating ? "currentColor" : "none"}
                            strokeWidth={2.2}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(rev.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {rev.status === "approved" ? (
                        <span className="text-[8.5px] font-black tracking-wider uppercase py-0.5 px-2 bg-green-50 border border-green-200 rounded text-green-600">
                          Approuvé
                        </span>
                      ) : rev.status === "rejected" ? (
                        <span className="text-[8.5px] font-black tracking-wider uppercase py-0.5 px-2 bg-red-50 border border-red-200 rounded text-red-600">
                          Rejeté
                        </span>
                      ) : (
                        <span className="text-[8.5px] font-black tracking-wider uppercase py-0.5 px-2 bg-amber-50 border border-amber-200 rounded text-amber-600 animate-pulse">
                          En attente
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-normal italic leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/50">
                    " {rev.comment} "
                  </p>

                  <div className="flex items-center gap-2 pt-1 justify-end">
                    {rev.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleVerifyReview(rev.id, "approve")}
                          className="px-2.5 py-1 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Check className="h-3 w-3" />
                          Approuver
                        </button>
                        <button
                          onClick={() => handleVerifyReview(rev.id, "reject")}
                          className="px-2.5 py-1 bg-red-900 hover:bg-red-800 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                          Rejeter
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-red-600 text-slate-600 hover:text-white font-bold rounded-lg text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- PANEL 8: INVESTMENTS (PRODUITS PAYÉS) --- */}
      {adminTab === "investments" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs text-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Suivi des Produits Payés (Investissements)</h3>
                <p className="text-[10px] text-slate-500">Liste en temps réel des plans VIP achetés par les utilisateurs</p>
              </div>
            </div>

            {/* Simple search bar */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="h-4.5 w-4.5" />
              </span>
              <input
                id="admin-search-investments"
                type="text"
                placeholder="Filtrer par nom de plan ou ID utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 py-2.5 pl-11 pr-4 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
              />
            </div>

            {investmentsList.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-10 bg-slate-50 border border-slate-200 rounded-xl">
                Aucun produit payé ou investissement actif enregistré pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {investmentsList
                  .filter((inv) => {
                    const query = searchQuery.toLowerCase();
                    return (
                      inv.productName.toLowerCase().includes(query) ||
                      inv.userId.toLowerCase().includes(query)
                    );
                  })
                  .map((inv) => {
                    // Try to find the corresponding user in usersList to show their name/phone
                    const userObj = usersList.find((u) => u.id === inv.userId);
                    return (
                      <div id={`admin-investment-card-${inv.id}`} key={inv.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                              {inv.productName}
                              <span className="text-[9px] bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-blue-600 rounded-md font-bold uppercase">
                                VIP Plan
                              </span>
                            </h4>
                            <p className="text-[10.5px] text-slate-700 font-medium mt-1">
                              Acheteur : <span className="text-blue-600 font-extrabold">{userObj ? userObj.name : inv.userId}</span>
                            </p>
                            {userObj && (
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                📞 {userObj.phone}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-600 block">
                              +{inv.dailyIncome.toLocaleString()} F / j
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                              Prix: {inv.price.toLocaleString()} FCFA
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar / Duration details */}
                        <div className="bg-white p-3 rounded-lg border border-slate-200/50 space-y-2">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span className="font-bold">Progression du plan :</span>
                            <span className="font-mono font-bold text-slate-700">
                              {inv.daysPassed} / {inv.durationDays} Jours
                            </span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (inv.daysPassed / inv.durationDays) * 100)}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 pt-1">
                            <span>Acheté le: {new Date(inv.activatedAt).toLocaleDateString()}</span>
                            <span>Dernier gain: {inv.lastClaimAt ? new Date(inv.lastClaimAt).toLocaleDateString() : "Jamais"}</span>
                          </div>
                        </div>

                        {/* Supprimer button */}
                        <div className="flex justify-end pt-1">
                          <button
                            id={`admin-btn-delete-inv-${inv.id}`}
                            onClick={() => handleDeleteInvestment(inv.id, inv.productName, userObj ? userObj.name : inv.userId)}
                            className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Supprimer le produit payé</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- PANEL 9: CHANNELS CONFIGURATION (CANAUX DE DÉPÔT) --- */}
      {adminTab === "channels" && (
        <div id="admin-channels-panel" className="space-y-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs text-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Configuration des Canaux de Dépôt (SIM & Numéros)</h3>
                <p className="text-[10px] text-slate-500">Gérez les cartes SIM, les numéros de transfert officiels et les réseaux de réception pour Niger, Gabon, et Tchad</p>
              </div>
            </div>

            <div className="space-y-4">
              {channelsList.map((chan, idx) => (
                <div key={chan.id} className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{chan.name}</span>
                      <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded uppercase">ID: {chan.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500">Actif :</span>
                      <input
                        id={`channel-active-toggle-${chan.id}`}
                        type="checkbox"
                        checked={chan.active}
                        onChange={(e) => {
                          const copy = [...channelsList];
                          copy[idx] = { ...copy[idx], active: e.target.checked };
                          setChannelsList(copy);
                        }}
                        className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Pays supportés</label>
                      <input
                        id={`channel-countries-input-${chan.id}`}
                        type="text"
                        value={chan.countries}
                        onChange={(e) => {
                          const copy = [...channelsList];
                          copy[idx] = { ...copy[idx], countries: e.target.value };
                          setChannelsList(copy);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Numéro du Receveur officiel</label>
                      <input
                        id={`channel-number-input-${chan.id}`}
                        type="text"
                        value={chan.number}
                        onChange={(e) => {
                          const copy = [...channelsList];
                          copy[idx] = { ...copy[idx], number: e.target.value };
                          setChannelsList(copy);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Nom d'identification SIM</label>
                      <input
                        id={`channel-sim-input-${chan.id}`}
                        type="text"
                        value={chan.simOwnerName || ""}
                        placeholder="Ex: Orange Money Services SARL"
                        onChange={(e) => {
                          const copy = [...channelsList];
                          copy[idx] = { ...copy[idx], simOwnerName: e.target.value };
                          setChannelsList(copy);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <p className="text-[10px] text-slate-400 font-medium">Les modifications ne prendront effet que lorsque vous cliquerez sur Enregistrer ci-contre.</p>
                <button
                  id="admin-save-payment-channels-btn"
                  onClick={() => handleUpdateChannels(channelsList)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3.5 px-6 rounded-2xl transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-98 uppercase tracking-wider"
                >
                  Sauvegarder les Canaux de Paiement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EXTRA INTERNAL MODAL: DISTRIBUTE USER BONUS --- */}
      {showBonusUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative text-slate-800">
            
            <div className="bg-slate-50 py-4 px-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Coins className="text-yellow-500 h-4.5 w-4.5 animate-bounce" />
                Distribuer un Bonus Direct
              </h3>
              <button
                id="bonus-modal-close"
                onClick={() => { setShowBonusUserModal(null); }}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Target info card */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl mb-4 text-xs">
                <p className="text-slate-500 uppercase tracking-widest font-semibold text-[9.5px]">Client bénéficiaire :</p>
                <p className="font-bold text-slate-900 mt-1">{showBonusUserModal.name}</p>
                <p className="text-[10px] text-slate-600 font-mono mt-0.5">📞 {showBonusUserModal.phone}</p>
              </div>

              <form onSubmit={handleSendBonus} className="space-y-4">
                
                {/* Currency value */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Montant du Bonus (FCFA)</label>
                  <input
                    id="admin-bonus-value-usr"
                    type="number"
                    required
                    placeholder="Ex: 5000"
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Comment reasons */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Motif de la distribution</label>
                  <input
                    id="admin-bonus-reason-usr"
                    type="text"
                    required
                    placeholder="Ex: Récompense parrain exceptionnel"
                    value={bonusReason}
                    onChange={(e) => setBonusReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    id="admin-bonus-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    Crediter
                  </button>
                  <button
                    id="admin-bonus-cancel-btn"
                    type="button"
                    onClick={() => { setShowBonusUserModal(null); }}
                    className="bg-slate-100 text-slate-600 hover:bg-slate-200 py-2.5 px-4 rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Fermer
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      )}

      {/* --- EXTRA INTERNAL MODAL: EDIT USER ACCOUNT --- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative text-slate-800">
            
            <div className="bg-slate-50 py-4 px-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                Modifier le Compte Utilisateur
              </h3>
              <button
                id="edit-user-modal-close"
                onClick={() => { setEditingUser(null); }}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto pr-2 no-scrollbar">
              <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Nom Complet</label>
                  <input
                    id="edit-user-name"
                    type="text"
                    required
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Téléphone</label>
                  <input
                    id="edit-user-phone"
                    type="text"
                    required
                    value={editUserPhone}
                    onChange={(e) => setEditUserPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                {/* Wallet Balance */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Solde Portefeuille (FCFA)</label>
                  <input
                    id="edit-user-balance"
                    type="number"
                    required
                    value={editUserBalance}
                    onChange={(e) => setEditUserBalance(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Mot de passe de l'utilisateur</label>
                  <input
                    id="edit-user-password"
                    type="text"
                    required
                    value={editUserPassword}
                    onChange={(e) => setEditUserPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                {/* Commissions Earned */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Commissions Gagnées (FCFA)</label>
                  <input
                    id="edit-user-commission"
                    type="number"
                    required
                    value={editUserCommission}
                    onChange={(e) => setEditUserCommission(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    id="admin-edit-user-submit"
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    Sauvegarder
                  </button>
                  <button
                    id="admin-edit-user-cancel"
                    type="button"
                    onClick={() => { setEditingUser(null); }}
                    className="bg-slate-100 text-slate-600 hover:bg-slate-200 py-2.5 px-4 rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Annuler
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      )}

      {/* --- EXTRA INTERNAL MODAL: EDIT VIP PRODUCT --- */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative text-slate-800">
            
            <div className="bg-slate-50 py-4 px-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                Modifier le Plan VIP
              </h3>
              <button
                id="edit-prod-modal-close"
                onClick={() => { setEditingProduct(null); }}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleUpdateProductSubmit} className="space-y-4">
                
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Nom du Plan</label>
                  <input
                    id="edit-prod-name"
                    type="text"
                    required
                    value={editProdName}
                    onChange={(e) => setEditProdName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Prix d'Achat (FCFA)</label>
                  <input
                    id="edit-prod-price"
                    type="number"
                    required
                    value={editProdPrice}
                    onChange={(e) => setEditProdPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                {/* Daily Income */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Revenu Journalier (FCFA)</label>
                  <input
                    id="edit-prod-daily"
                    type="number"
                    required
                    value={editProdDailyIncome}
                    onChange={(e) => setEditProdDailyIncome(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Durée (Jours)</label>
                  <input
                    id="edit-prod-duration"
                    type="number"
                    required
                    value={editProdDuration}
                    onChange={(e) => setEditProdDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    id="admin-edit-prod-submit"
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    Modifier
                  </button>
                  <button
                    id="admin-edit-prod-cancel"
                    type="button"
                    onClick={() => { setEditingProduct(null); }}
                    className="bg-slate-100 text-slate-600 hover:bg-slate-200 py-2.5 px-4 rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Annuler
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      )}

      {/* --- CUSTOM DIALOGS FOR SAFELY REPLACING WINDOW.CONFIRM AND ALERT --- */}
      {confirmState && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative text-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              ⚠️ {confirmState.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmState.message}
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                id="custom-confirm-yes"
                onClick={() => {
                  const onConf = confirmState.onConfirm;
                  setConfirmState(null);
                  onConf();
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 animate-pulse"
              >
                {confirmState.confirmText || "Confirmer"}
              </button>
              <button
                id="custom-confirm-no"
                onClick={() => {
                  setConfirmState(null);
                }}
                className="bg-slate-100 text-slate-600 hover:bg-slate-200 py-2 px-4 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                {confirmState.cancelText || "Annuler"}
              </button>
            </div>
          </div>
        </div>
      )}

      {alertState && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative text-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              ℹ️ {alertState.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {alertState.message}
            </p>
            <div className="flex pt-1">
              <button
                id="custom-alert-close"
                onClick={() => {
                  const onClose = alertState.onClose;
                  setAlertState(null);
                  if (onClose) onClose();
                }}
                className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
