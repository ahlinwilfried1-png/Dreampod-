/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
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
  Trash2,
  MessageSquare,
  Paperclip,
  Send,
  MessageCircle,
  Phone,
  Plus,
  Upload,
  Camera
} from "lucide-react";
import { User, Transaction, Product, BonusCode, UserReview, Investment, GlobalNotification } from "../types";
import { api, getLocalDbExport, saveLocalDbExport, getUseLocalFallback, setUseLocalFallback } from "../lib/api";
import { getCurrencySymbol } from "../lib/currency";
import ProductImage from "./ProductImage";
import {
  getAllConversations,
  addSupportMessage,
  markAsRead,
  clearConversationForAdmin,
  deleteMessageForAdmin,
  subscribeChatUpdates,
  SupportConversation
} from "../lib/chatStore";

interface AdminViewProps {
  onRefresh: () => void;
}

export default function AdminView({ onRefresh }: AdminViewProps) {
  // Navigation internal tab
  const [adminTab, setAdminTab] = useState<"stats" | "users" | "deposits" | "withdrawals" | "products" | "codes" | "notifications" | "reviews" | "investments" | "channels" | "chat">("stats");

  // Chat State
  const [chatConversations, setChatConversations] = useState<SupportConversation[]>(() => getAllConversations());
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [adminChatInput, setAdminChatInput] = useState("");
  const [adminImageAttachment, setAdminImageAttachment] = useState<string | null>(null);
  const adminChatEndRef = useRef<HTMLDivElement>(null);

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
  const [editProdCategory, setEditProdCategory] = useState<'stability' | 'wellbeing' | 'activity'>("wellbeing");
  const [editProdImage, setEditProdImage] = useState("");

  // Server data states
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [txsList, setTxsList] = useState<Transaction[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [productCategoryFilter, setProductCategoryFilter] = useState<"all" | "wellbeing" | "stability" | "activity">("all");
  const [codesList, setCodesList] = useState<BonusCode[]>([]);
  const [reviewsList, setReviewsList] = useState<UserReview[]>([]);
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [reviewFilterStatus, setReviewFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [investmentsList, setInvestmentsList] = useState<Investment[]>([]);
  const [channelsList, setChannelsList] = useState<any[]>([]);
  const [notificationsList, setNotificationsList] = useState<GlobalNotification[]>([]);
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

  useEffect(() => {
    if (alertState) {
      const timer = setTimeout(() => {
        const onClose = alertState.onClose;
        setAlertState(null);
        if (onClose) onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alertState]);

  // Bonus form State
  const [showBonusUserModal, setShowBonusUserModal] = useState<any>(null); // holds user object
  const [bonusAmount, setBonusAmount] = useState("1000");
  const [bonusReason, setBonusReason] = useState("Récompense d'activité");

  // Product Add Form State
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodDailyIncome, setProdDailyIncome] = useState("");
  const [prodDuration, setProdDuration] = useState("30");
  const [prodCategory, setProdCategory] = useState<'stability' | 'wellbeing' | 'activity'>("wellbeing");
  const [prodImage, setProdImage] = useState("");

  // Admin Proof / Certificate publish form state
  const [showAdminProofModal, setShowAdminProofModal] = useState(false);
  const [adminProofPhone, setAdminProofPhone] = useState("");
  const [adminProofName, setAdminProofName] = useState("");
  const [adminProofAmount, setAdminProofAmount] = useState("");
  const [adminProofNote, setAdminProofNote] = useState("");
  const [adminProofImage, setAdminProofImage] = useState<string | null>(null);
  const [adminPreviewImage, setAdminPreviewImage] = useState<string | null>(null);

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
  const [supabaseStatus, setSupabaseStatus] = useState<string>("disconnected");

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
      if (statsResp && statsResp.supabaseStatus) {
        setSupabaseStatus(statsResp.supabaseStatus);
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
        const notifsResp = await api.getNotifications();
        setNotificationsList(notifsResp.notifications || []);
      } catch (notifErr) {
        console.warn("Notifications loading failed:", notifErr);
      }

      if (!silent || adminTab !== "channels") {
        try {
          const channelsResp = await api.getPaymentChannels();
          setChannelsList(channelsResp.channels || []);
        } catch (chanErr) {
          console.warn("Channels loading failed:", chanErr);
        }
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

  const handleAddChannel = () => {
    const newChan = {
      id: "channel_" + Date.now(),
      name: "",
      operator: "",
      countries: "",
      number: "",
      simOwnerName: "",
      instructions: "",
      active: true
    };
    setChannelsList([...channelsList, newChan]);
    setSuccessMsg("Nouveau canal ajouté en bas de liste ! Veuillez configurer ses détails puis cliquer sur Enregistrer.");
  };

  useEffect(() => {
    loadAdminData();
    
    // Set up real-time automatic polling every 5 seconds to sync registrations/actions from other devices
    const interval = setInterval(() => {
      loadAdminData(true);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [adminTab, searchQuery]);

  // Live chat subscription
  useEffect(() => {
    const refreshChat = () => {
      const convs = getAllConversations();
      setChatConversations(convs);
    };
    refreshChat();
    const unsub = subscribeChatUpdates(refreshChat);
    return () => unsub();
  }, []);

  // Auto-scroll admin chat thread
  useEffect(() => {
    if (adminTab === "chat") {
      const timer = setTimeout(() => {
        adminChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [adminTab, selectedConvId, chatConversations]);

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
        image: prodImage.trim() || undefined,
      });
      setProdName("");
      setProdPrice("");
      setProdDailyIncome("");
      setProdDuration("30");
      setProdCategory("stability");
      setProdImage("");
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

  const handleDeleteNotification = async (id: string) => {
    setConfirmState({
      title: "Supprimer l'annonce ?",
      message: "Êtes-vous sûr de vouloir supprimer cette annonce ?",
      confirmText: "Oui, Supprimer",
      onConfirm: async () => {
        setConfirmState(null);
        setBtnLoadingId(id);
        try {
          await api.admin.deleteNotification(id);
          setAlertState({
            title: "Annonce supprimée",
            message: "L'annonce a été supprimée avec succès.",
          });
          loadAdminData();
        } catch (err: any) {
          setAlertState({
            title: "Erreur",
            message: err.message || "Une erreur est survenue lors de la suppression.",
          });
        } finally {
          setBtnLoadingId(null);
        }
      }
    });
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

  const handleAdminPublishProof = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBtnLoadingId("admin_proof_submit");
      const amtStr = adminProofAmount ? `${parseFloat(adminProofAmount).toLocaleString()} FCFA` : "50 000 FCFA";
      const commentText = `[PREUVE DE RETRAIT - ${amtStr}] ${adminProofNote ? adminProofNote.trim() : "Retrait bien reçu avec succès !"}`.trim();
      
      const res = await api.admin.createReview({
        userName: adminProofName || "Membre Nutrien Ag",
        userPhone: adminProofPhone || "+22890000000",
        rating: 5,
        comment: commentText,
        image: adminProofImage || undefined,
      });

      setAlertState({
        title: "Succès !",
        message: res.message || "Certificat / Preuve officielle publiée avec succès !",
      });

      setShowAdminProofModal(false);
      setAdminProofPhone("");
      setAdminProofName("");
      setAdminProofAmount("");
      setAdminProofNote("");
      setAdminProofImage(null);
      loadAdminData();
    } catch (err: any) {
      setAlertState({
        title: "Erreur",
        message: err.message || "Impossible de publier la preuve.",
      });
    } finally {
      setBtnLoadingId(null);
    }
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
    setEditProdCategory((p.category as any) || "stability");
    setEditProdImage(p.image || "");
  };

  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setLoading(true);
    try {
      const updatedFields = {
        name: editProdName.trim(),
        price: Number(editProdPrice),
        dailyIncome: Number(editProdDailyIncome),
        durationDays: Number(editProdDuration),
        category: editProdCategory,
        image: editProdImage.trim() || undefined,
      };
      const response = await api.admin.updateProduct(editingProduct.id, updatedFields);
      
      // Update local products state immediately
      setProductsList((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                ...updatedFields,
                totalIncome: Number(editProdDailyIncome) * Number(editProdDuration),
              }
            : p
        )
      );

      setAlertState({
        title: "Enregistré avec succès ! 🎉",
        message: response.message || `Le produit "${editProdName}" a été mis à jour avec succès.`
      });
      setEditingProduct(null);
      loadAdminData();
    } catch (err: any) {
      setAlertState({
        title: "Erreur",
        message: err.message || "Erreur lors de l'enregistrement du produit."
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
    <div className="space-y-6 text-slate-800 select-none py-1">
      
      {/* Title */}
      <div className="flex items-center justify-between py-1 relative">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
            <Shield id="icon-admin-logo" className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-950">Panneau d'Administration</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Nutrien Control Center</p>
          </div>
        </div>

        <button
          id="admin-btn-reload"
          onClick={loadAdminData}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-100 text-blue-600 hover:text-white hover:bg-blue-600 transition-all cursor-pointer active:scale-95"
        >
          <RefreshCw className={`h-4.5 w-4.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Admin navigation layout sub-tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 select-none no-scrollbar">
        {[
          { id: "stats", label: "Analytiques", icon: TrendingUp },
          { id: "chat", label: "Chat Support", icon: MessageSquare },
          { id: "users", label: "Utilisateurs", icon: Users },
          { id: "deposits", label: "Dépôts", icon: ArrowUpRight },
          { id: "withdrawals", label: "Retraits", icon: ArrowDownLeft },
          { id: "investments", label: "Produits Payés", icon: ShoppingBag },
          { id: "products", label: "Plans VIP", icon: Cpu },
          { id: "codes", label: "Codes/Bonus", icon: Gift },
          { id: "notifications", label: "Annonces", icon: Bell },
          { id: "reviews", label: "Avis Clients", icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          const unreadTotal = chatConversations.reduce((acc, c) => acc + (c.unreadCountForAdmin || 0), 0);

          return (
            <button
              id={`admin-tab-btn-${tab.id}`}
              key={tab.id}
              onClick={() => { setAdminTab(tab.id as any); }}
              className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer relative ${
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.id === "chat" && unreadTotal > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black text-[9px] animate-pulse">
                  {unreadTotal}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Error box if any */}
      {errorMsg && (
        <div className="p-3 bg-red-50 rounded-xl text-[11px] text-red-600">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Success box if any */}
      {successMsg && (
        <div className="p-3 bg-green-50 rounded-xl text-[11px] text-green-700 font-extrabold">
          ✅ {successMsg}
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
              <div className="py-2.5 px-3 rounded-xl bg-slate-100/60 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Dépôts</p>
                  <p className="text-sm font-black text-emerald-600 mt-0.5">{(globalStats.totalDeposited || 0).toLocaleString()} F</p>
                </div>
              </div>

              {/* Total Retraits */}
              <div className="py-2.5 px-3 rounded-xl bg-slate-100/60 flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-700 rounded-xl">
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
                className="text-left bg-amber-50/60 p-3.5 rounded-xl flex flex-col justify-between transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Dépôts En Attente</p>
                </div>
                <div>
                  <p className="text-base font-black text-amber-600">{(globalStats.numberOfPendingDeposits || 0)} demandes</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Val: {(globalStats.totalPendingDepositsAmount || 0).toLocaleString()} F</p>
                </div>
              </button>

              {/* Retraits en attente */}
              <button 
                onClick={() => setAdminTab("withdrawals")}
                className="text-left bg-rose-50/60 p-3.5 rounded-xl flex flex-col justify-between transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Retraits En Attente</p>
                </div>
                <div>
                  <p className="text-base font-black text-red-600">{(globalStats.numberOfPendingWithdrawals || 0)} demandes</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Val: {(globalStats.totalPendingWithdrawalsAmount || 0).toLocaleString()} F</p>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Pending Validation list directly on Dashboard */}
          {txsList.filter(t => t.status === "pending").length > 0 && (
            <div className="space-y-3 bg-amber-50/40 p-3.5 rounded-xl">
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
                  <div key={tx.id} className="p-3 bg-white/80 rounded-xl flex justify-between items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded ${
                          tx.type === "deposit" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
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
                          className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors cursor-pointer"
                          title="Approuver"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleVerifyTx(tx.id, "reject")}
                          disabled={btnLoadingId === tx.id}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors cursor-pointer"
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
              <div className="py-3 px-3.5 rounded-xl bg-slate-50/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Utilisateurs Enregistrés</p>
                    <p className="text-[10px] text-slate-500">Nombre total de comptes clients actifs</p>
                  </div>
                </div>
                <span className="text-base font-black text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-xl">
                  {globalStats.totalUsers || 0}
                </span>
              </div>

              {/* Les Produits */}
              <div className="py-3 px-3.5 rounded-xl bg-slate-50/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Produits / Plans d'Investissement</p>
                    <p className="text-[10px] text-slate-500">Nombre d'offres VIP configurées</p>
                  </div>
                </div>
                <span className="text-base font-black text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-xl">
                  {globalStats.numberOfProducts || 0}
                </span>
              </div>

              {/* Produits Payés / Investissements */}
              <div className="py-3 px-3.5 rounded-xl bg-slate-50/80 flex items-center justify-between">
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
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-extrabold text-blue-100 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  Bénéfices Estimés de la Plateforme (XAF / XOF)
                </p>
                <p className="text-2xl font-black text-white mt-1">{(globalStats.platformRevenues || 0).toLocaleString()} XAF / XOF</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl text-white font-bold text-xs">
                Net / 2026
              </div>
            </div>
          </div>

          {/* Visual SVG Chart representing daily trajectory */}
          <div className="py-2">
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
              className="w-full bg-white py-3 pl-11 pr-4 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 transition-all border border-slate-200/80"
            />
          </div>

          {/* Users List block */}
          {usersList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 py-6">
              Aucun utilisateur trouvé correspondant à la recherche.
            </div>
          ) : (
            <div className="space-y-1">
              {usersList.map((usr) => (
                <div 
                  id={`admin-user-card-${usr.id}`}
                  key={usr.id}
                  className={`py-3.5 px-1 border-b border-slate-200/60 relative ${
                    usr.isBlocked ? "bg-red-50/20 rounded-xl px-3" : ""
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        {usr.name}
                        {usr.id === "usr_admin" && (
                          <span className="text-[8px] bg-red-50 px-1.5 py-0.5 text-red-600 rounded-md font-black">ADMIN PRINCIPAL</span>
                        )}
                        {usr.isBlocked && (
                          <span className="text-[8px] bg-red-100 px-1.5 py-0.5 text-red-600 rounded-md font-bold">SUSPENDU</span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">📞 {usr.phone} | MDP: {usr.password}</p>
                      
                      {/* Financial info */}
                      <div className="flex gap-4 mt-2.5 text-[9.5px] text-slate-700">
                        <div>
                          <span className="text-slate-400 block uppercase tracking-wider font-semibold">Solde portefeuille</span>
                          <span className="font-extrabold mt-0.5 block text-blue-600">{usr.balance.toLocaleString()} {getCurrencySymbol(usr.phone)}</span>
                        </div>
                        <div className="border-l border-slate-200/60 pl-3">
                          <span className="text-slate-400 block uppercase tracking-wider font-semibold">Filleuls (1er Ordre)</span>
                          <span className="font-bold mt-0.5 block text-slate-800">{usr.referralsN1}</span>
                        </div>
                        <div className="border-l border-slate-200/60 pl-3">
                          <span className="text-slate-400 block uppercase tracking-wider font-semibold">Com. gagnées</span>
                          <span className="font-bold mt-0.5 block text-emerald-600">{usr.commissionEarned.toLocaleString()} F</span>
                        </div>
                      </div>

                      {/* Linked Wallet Info */}
                      {usr.linkedWalletNumber ? (
                        <div className="mt-3 p-2.5 bg-blue-50/40 rounded-xl max-w-md text-[9.5px] font-medium text-slate-700">
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
                              Code de retrait confidentiel : <strong className="font-mono font-black text-slate-700 bg-white px-1 py-0.5 rounded">{usr.withdrawalCode}</strong>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 p-2 bg-slate-50 rounded-xl text-[9.5px] text-slate-400 font-semibold max-w-md">
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
                          className={`py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                            usr.isBlocked 
                              ? "bg-green-50 text-green-600 hover:bg-green-100" 
                              : "bg-red-50 text-red-600 hover:bg-red-100"
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
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 py-1.5 px-3 rounded-lg text-[9px] font-bold text-center flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Coins className="h-3 w-3 text-yellow-500 animate-pulse" />
                          <span>Bonus direct</span>
                        </button>

                        {/* Modifier account info */}
                        <button
                          id={`btn-edit-user-${usr.id}`}
                          onClick={() => handleEditUserClick(usr)}
                          className="bg-amber-50 text-amber-700 hover:bg-amber-100 py-1.5 px-3 rounded-lg text-[9px] font-bold text-center flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <span>Modifier</span>
                        </button>

                        {/* Supprimer account */}
                        <button
                          id={`btn-delete-user-${usr.id}`}
                          onClick={() => handleDeleteUser(usr.id, usr.name)}
                          className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white py-1.5 px-3 rounded-lg text-[9px] font-bold text-center flex items-center justify-center space-x-1 cursor-pointer transition-colors"
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
            <div className="p-6 text-center text-xs text-slate-400">
              Aucun dépôt à traiter.
            </div>
          ) : (
            <div className="space-y-1">
              {txsList.filter(tx => tx.type === "deposit").map((tx) => {
                const isPending = tx.status === "pending";
                
                return (
                  <div 
                    id={`admin-tx-card-${tx.id}`}
                    key={tx.id} 
                    className="py-3.5 px-1 border-b border-slate-200/60"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        {/* User source information */}
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                            tx.type === "deposit" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                          }`}>
                            {tx.type === "deposit" ? "Dépôt" : "Retrait"}
                          </span>

                          <span className="text-[10px] text-slate-800 font-bold">{tx.userName}</span>
                        </div>
                        
                        <p className="text-[9.5px] text-slate-600 font-mono mt-1.5">📞 {tx.userPhone} | Canal: {tx.method}</p>
                        
                        {tx.simOwnerName && (
                          <div className="text-[10px] text-slate-700 font-semibold mt-1 bg-slate-50 p-2 rounded-xl">
                            <span className="font-extrabold text-slate-500 uppercase text-[8px] tracking-wider block">Nom d'identité SIM</span>
                            {tx.simOwnerName}
                          </div>
                        )}
                        
                        {tx.receiverNumber && (
                          <div className="text-[10px] text-slate-700 font-semibold mt-1 bg-slate-50 p-2 rounded-xl">
                            <span className="font-extrabold text-slate-500 uppercase text-[8px] tracking-wider block">Numéro Receveur</span>
                            {tx.receiverNumber}
                          </div>
                        )}
                        
                        {tx.txRefId && (
                          <div className="text-[10px] text-slate-700 font-semibold mt-1 bg-slate-50 p-2 rounded-xl">
                            <span className="font-extrabold text-slate-500 uppercase text-[8px] tracking-wider block">ID / Référence</span>
                            {tx.txRefId}
                          </div>
                        )}

                        {tx.screenshot && (
                          <div className="mt-2 p-2 bg-slate-50 rounded-xl max-w-xs">
                            <span className="font-extrabold text-slate-500 uppercase text-[8px] tracking-wider block mb-1">Preuve Capture d'écran</span>
                            <img 
                              src={tx.screenshot} 
                              alt="Preuve" 
                              className="max-h-24 object-cover rounded-lg cursor-zoom-in hover:brightness-95 transition-all" 
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
                          {tx.type === "deposit" ? "+" : "-"}{tx.amount.toLocaleString()} {getCurrencySymbol(tx.userPhone)}
                        </span>
                        
                        <div className="mt-1">
                          {isPending ? (
                            <span className="text-[8px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wide">En Attente</span>
                          ) : (
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-bold block ${
                              tx.status === "completed" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                            }`}>
                              {tx.status === "completed" ? "VALIDÉ" : "REJETÉ"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Operational action toggles for waiting items */}
                    {isPending && (
                      <div className="flex justify-end gap-2 mt-4 pt-3.5">
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
            <div className="p-6 text-center text-xs text-slate-400">
              Aucun retrait à traiter.
            </div>
          ) : (
            <div className="space-y-1">
              {txsList.filter(tx => tx.type === "withdrawal").map((tx) => {
                const isPending = tx.status === "pending";
                
                return (
                  <div 
                    id={`admin-tx-card-${tx.id}`}
                    key={tx.id} 
                    className="py-3.5 px-1 border-b border-slate-200/60"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        {/* User source information */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-red-50 text-red-600">
                            Retrait
                          </span>

                          <span className="text-[10px] text-slate-800 font-bold">{tx.userName}</span>
                        </div>
                        
                        <p className="text-[9.5px] text-slate-600 font-mono mt-1.5 font-bold">👤 {tx.userName} | ID: {tx.userId} | 📞 {tx.userPhone}</p>
                        <p className="text-[9.5px] text-emerald-700 font-bold mt-1">🏦 Canal : {tx.method}</p>
                        {tx.linkedWalletNumber && (
                          <div className="mt-2 p-2 bg-blue-50/50 rounded-xl text-[9.5px] text-slate-700 max-w-sm">
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
                          -{tx.amount.toLocaleString()} {getCurrencySymbol(tx.userPhone)}
                        </span>
                        
                        <div className="mt-1">
                          {isPending ? (
                            <span className="text-[8px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wide">En Attente</span>
                          ) : (
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-bold block ${
                              tx.status === "completed" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                            }`}>
                              {tx.status === "completed" ? "VALIDÉ" : "REJETÉ"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Operational action toggles for waiting items */}
                    {isPending && (
                      <div className="flex justify-end gap-2 mt-4 pt-3.5">
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
          <div className="py-2 text-slate-800">
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
                    className="w-full bg-slate-50 py-2.5 px-3 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-0.5">Prix d'activation (XAF / XOF)</label>
                  <input
                    id="admin-prod-price"
                    type="number"
                    required
                    placeholder="Ex: 500000"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-slate-50 py-2.5 px-3 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Incomes daily */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-0.5">Revenu Journalier (XAF / XOF)</label>
                  <input
                    id="admin-prod-income"
                    type="number"
                    required
                    placeholder="Ex: 180000"
                    value={prodDailyIncome}
                    onChange={(e) => setProdDailyIncome(e.target.value)}
                    className="w-full bg-slate-50 py-2.5 px-3 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-0.5">Catégorie du Produit</label>
                  <select
                    id="admin-prod-category"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="w-full bg-slate-50 py-2.5 px-3 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="wellbeing">🌿 Bien-être</option>
                    <option value="stability">⭐ VIP Standard</option>
                  </select>
                </div>

                {/* Product Image URL */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-0.5">URL de l'image (Optionnel)</label>
                  <input
                    id="admin-prod-image"
                    type="url"
                    placeholder="https://... ou laisser vide pour l'image automatique"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    className="w-full bg-slate-50 py-2.5 px-3 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

              </div>

              <button
                id="admin-prod-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-xs transition-all cursor-pointer shadow-md active:scale-98 mt-2 flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>{loading ? "Création en cours..." : "Enregistrer et Publier le Produit"}</span>
              </button>
            </form>
          </div>

          {/* Existing products ledger header & category filters */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
              Offres VIP & Produits en Ligne ({
                productsList.filter((p) => {
                  if (productCategoryFilter === "all") return true;
                  if (productCategoryFilter === "wellbeing") {
                    return p.category === "wellbeing" || p.id === "vip3" || p.id === "vip4" || p.name.toLowerCase().includes("bien-être") || p.name.toLowerCase().includes("bien être");
                  }
                  return true;
                }).length
              })
            </h3>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
              <button
                type="button"
                onClick={() => setProductCategoryFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  productCategoryFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tous ({productsList.length})
              </button>
              <button
                type="button"
                onClick={() => setProductCategoryFilter("wellbeing")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  productCategoryFilter === "wellbeing" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                🌿 Bien-être ({productsList.filter(p => p.category === "wellbeing" || p.id === "vip3" || p.id === "vip4" || p.name.toLowerCase().includes("bien-être") || p.name.toLowerCase().includes("bien être")).length})
              </button>
            </div>
          </div>

          <div className="space-y-1">
             {productsList
               .filter((p) => {
                 if (productCategoryFilter === "all") return true;
                 if (productCategoryFilter === "wellbeing") {
                   return p.category === "wellbeing" || p.id === "vip3" || p.id === "vip4" || p.name.toLowerCase().includes("bien-être") || p.name.toLowerCase().includes("bien être");
                 }
                 return true;
               })
               .map((p) => (
              <div key={p.id} className={`py-3.5 px-1 border-b border-slate-200/60 flex items-center justify-between transition-all ${p.isBlocked ? 'bg-red-50/20 rounded-xl px-3 opacity-80' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80 shadow-2xs">
                    <ProductImage
                      src={p.image}
                      alt={p.name}
                      level={p.level}
                      isBlocked={p.isBlocked}
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                      {p.name}
                      {p.isBlocked && <span className="text-[8px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md font-bold uppercase">Désactivé</span>}
                      <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-mono">VIPLevel {p.level}</span>
                      {(p.category === "wellbeing" || p.id === "vip3" || p.id === "vip4" || p.name.toLowerCase().includes("bien-être") || p.name.toLowerCase().includes("bien être")) && (
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                          🌿 Bien-être
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-emerald-600 font-black mt-0.5">+{p.dailyIncome.toLocaleString()} XAF/XOF / Jour | Durée: {p.durationDays}J</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Prix d'achat : {p.price.toLocaleString()} XAF/XOF</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    id={`admin-btn-toggle-prod-block-${p.id}`}
                    onClick={() => handleToggleProductBlock(p)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      p.isBlocked 
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
                        : "bg-red-50 text-red-700 hover:bg-red-100"
                    }`}
                  >
                    {p.isBlocked ? "Activer" : "Bloquer"}
                  </button>
                  <button
                    id={`admin-btn-edit-prod-${p.id}`}
                    onClick={() => handleEditProductClick(p)}
                    className="bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    id={`admin-btn-delete-prod-${p.id}`}
                    onClick={() => handleDeleteProduct(p.id)}
                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center"
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
          <div className="py-2 text-slate-800">
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
                    className="w-full bg-slate-50 py-2.5 px-3 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 font-mono uppercase"
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
                    className="w-full bg-slate-50 py-2.5 px-3 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    className="w-full bg-slate-50 py-2.5 px-3 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
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
          <div className="space-y-1">
            {codesList.map((codeObj) => (
              <div key={codeObj.id} className="py-3 px-1 border-b border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-black text-amber-600 block uppercase tracking-wide">{codeObj.code}</span>
                  <span className="text-[9.5px] text-slate-400 mt-1 block">Créé le : {new Date(codeObj.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 block">+{codeObj.amount.toLocaleString()} XAF/XOF</span>
                  <span className="text-[9.5px] text-slate-500 block mt-0.5">{codeObj.usedCount} / {codeObj.maxUses} réclamés</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- PANEL 6: NOTICE BROADCASTER --- */}
      {adminTab === "notifications" && (
        <div className="py-2 text-slate-800">
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
                className="w-full bg-slate-50 py-2.5 px-3 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
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
                className="w-full bg-slate-50 p-3 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
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

          {/* Active Announcements List */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-slate-600" />
              Annonces Diffusées ({notificationsList.length})
            </h5>
            {notificationsList.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucune annonce actuellement diffusée.</p>
            ) : (
              <div className="space-y-1">
                {notificationsList.map((notif, idx) => (
                  <div key={notif.id || idx} className="py-3 px-1 border-b border-slate-200/60 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-900">{notif.title}</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">{notif.content}</p>
                      <span className="text-[9px] font-bold text-slate-400 block mt-1">
                        {notif.date ? new Date(notif.date).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteNotification(notif.id)}
                      disabled={btnLoadingId === notif.id}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer transition-all"
                    >
                      {btnLoadingId === notif.id ? "..." : "Supprimer"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- PANEL 7: REVIEWS & PROOFS MODERATION --- */}
      {adminTab === "reviews" && (
        <div className="py-2 space-y-4 text-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500">
                <Star className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Gestion des Certificats Officiels</h3>
                <p className="text-[10px] text-slate-500">Publiez ou modérez les certificats et preuves de retrait visibles sur tous les comptes d'utilisateurs</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAdminProofModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Publier un Certificat</span>
              </button>
              <span className="text-[11px] font-black bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl">
                Total : {reviewsList.length}
              </span>
            </div>
          </div>

          {/* Search and Filters for Reviews */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1 pb-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone, commentaire..."
                value={reviewSearchQuery}
                onChange={(e) => setReviewSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
              {(["all", "pending", "approved", "rejected"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setReviewFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-[10.5px] font-extrabold cursor-pointer transition-all whitespace-nowrap ${
                    reviewFilterStatus === st
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st === "all" ? "Tous" : st === "pending" ? "En attente" : st === "approved" ? "Approuvés" : "Rejetés"}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const filteredReviews = reviewsList.filter((rev) => {
              const matchesSearch =
                (rev.userName || "").toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
                (rev.userPhone || "").includes(reviewSearchQuery) ||
                (rev.comment || "").toLowerCase().includes(reviewSearchQuery.toLowerCase());
              
              const matchesStatus =
                reviewFilterStatus === "all" || rev.status === reviewFilterStatus;

              return matchesSearch && matchesStatus;
            });

            if (filteredReviews.length === 0) {
              return (
                <p className="text-center text-slate-400 text-xs py-10 bg-slate-50 rounded-xl">
                  {reviewsList.length === 0 
                    ? "Aucune preuve ou avis soumis pour le moment." 
                    : "Aucun témoignage ne correspond aux critères de recherche."}
                </p>
              );
            }

            return (
              <div className="space-y-1">
                {filteredReviews.map((rev) => (
                  <div key={rev.id} className="py-3.5 px-1 border-b border-slate-200/60 space-y-2.5 transition-colors">
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
                          <span className="text-[8.5px] font-black tracking-wider uppercase py-0.5 px-2 bg-green-100 text-green-700 rounded-full">
                            Approuvé
                          </span>
                        ) : rev.status === "rejected" ? (
                          <span className="text-[8.5px] font-black tracking-wider uppercase py-0.5 px-2 bg-red-100 text-red-700 rounded-full">
                            Rejeté
                          </span>
                        ) : (
                          <span className="text-[8.5px] font-black tracking-wider uppercase py-0.5 px-2 bg-amber-100 text-amber-700 rounded-full animate-pulse">
                            En attente
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-medium italic leading-relaxed bg-white p-3 rounded-xl shadow-2xs">
                      " {rev.comment} "
                    </p>

                    {/* Capture d'écran preuve si présente */}
                    {rev.image && (
                      <div className="mt-2 rounded-xl overflow-hidden max-w-xs bg-slate-900/5 p-1.5">
                        <p className="text-[9px] font-bold text-slate-500 mb-1 px-1 flex items-center justify-between">
                          <span>📸 Capture Preuve / Certificat :</span>
                          <span className="text-emerald-600 cursor-pointer hover:underline" onClick={() => setAdminPreviewImage(rev.image || null)}>🔍 Agrandir</span>
                        </p>
                        <img 
                          src={rev.image} 
                          alt="Preuve" 
                          className="w-full h-auto max-h-52 object-contain rounded-lg cursor-zoom-in hover:opacity-95 transition-all"
                          onClick={() => setAdminPreviewImage(rev.image || null)}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1 justify-end">
                      {rev.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleVerifyReview(rev.id, "approve")}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-[10px] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Check className="h-3 w-3" />
                            Approuver
                          </button>
                          <button
                            onClick={() => handleVerifyReview(rev.id, "reject")}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold rounded-xl text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                            Rejeter
                          </button>
                        </>
                      )}

                      {/* Bouton de suppression définitive du témoignage */}
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-extrabold rounded-xl text-[10px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Supprimer définitivement ce témoignage ou cette preuve"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Supprimer le témoignage</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* --- PANEL 8: INVESTMENTS (PRODUITS PAYÉS) --- */}
      {adminTab === "investments" && (
        <div className="space-y-4">
          <div className="py-2 space-y-4 text-slate-800">
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
                className="w-full bg-slate-50 py-2.5 pl-11 pr-4 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
              />
            </div>

            {investmentsList.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-10 bg-slate-50 rounded-xl">
                Aucun produit payé ou investissement actif enregistré pour le moment.
              </p>
            ) : (
              <div className="space-y-1">
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
                      <div id={`admin-investment-card-${inv.id}`} key={inv.id} className="py-3.5 px-1 border-b border-slate-200/60 space-y-3">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                              {inv.productName}
                              <span className="text-[9px] bg-blue-50 px-1.5 py-0.5 text-blue-600 rounded-md font-bold uppercase">
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
                              Prix: {inv.price.toLocaleString()} XAF/XOF
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar / Duration details */}
                        <div className="bg-white p-3 rounded-lg space-y-2">
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
                            className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
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

      {/* SECTION: MESSAGERIE SUPPORT CLIENT (LIVE CHAT ADMIN) */}
      {adminTab === "chat" && (() => {
        const activeConv = chatConversations.find((c) => c.id === selectedConvId) || chatConversations[0] || null;
        const totalUnreadAdmin = chatConversations.reduce((acc, c) => acc + (c.unreadCountForAdmin || 0), 0);
        const filteredConvs = chatConversations.filter((conv) => {
          const q = searchQuery.toLowerCase();
          return (
            conv.userName.toLowerCase().includes(q) ||
            conv.userPhone.toLowerCase().includes(q) ||
            conv.lastMessage.toLowerCase().includes(q)
          );
        });

        return (
          <div className="space-y-4 animate-fade-in">
            {/* Top Banner */}
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-4 rounded-2xl text-white shadow-md">
              <div>
                <h3 className="text-sm font-black tracking-tight flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  Messagerie Support Client & Direct Chat
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Cliquez sur un utilisateur dans la rangée ci-dessous pour ouvrir et répondre à sa conversation.
                </p>
              </div>
              <div className="bg-blue-800/60 border border-blue-400/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{totalUnreadAdmin} non lu(s)</span>
              </div>
            </div>

            {/* RANGÉE DES UTILISATEURS EN CONVERSATION */}
            <div className="py-2 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-emerald-600" />
                    Utilisateurs en discussion ({filteredConvs.length})
                  </span>
                  {totalUnreadAdmin > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                      {totalUnreadAdmin} nouveau(x)
                    </span>
                  )}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Chercher client / téléphone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100 py-1.5 pl-8 pr-3 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* RANGÉE DÉROULANTE HORIZONTALE DES CARDS DE CHAT */}
              <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 pt-1 select-none">
                {filteredConvs.length === 0 ? (
                  <div className="w-full p-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl">
                    Aucune discussion client trouvée.
                  </div>
                ) : (
                  filteredConvs.map((conv) => {
                    const isSelected = activeConv?.id === conv.id;
                    const hasUnread = conv.unreadCountForAdmin > 0;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          setSelectedConvId(conv.id);
                          markAsRead(conv.id, "admin");
                        }}
                        className={`min-w-[150px] sm:min-w-[165px] max-w-[180px] shrink-0 p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? "bg-blue-50/90 ring-2 ring-blue-500/30 shadow-xs scale-[1.01]"
                            : "bg-slate-50/80 hover:bg-slate-100/90 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                              isSelected ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
                            }`}>
                              {conv.userName ? conv.userName.slice(0, 2).toUpperCase() : "UT"}
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-[11px] font-black text-slate-900 truncate leading-tight">
                                {conv.userName}
                              </h5>
                              <p className="text-[9px] text-slate-500 font-mono truncate">📞 {conv.userPhone}</p>
                            </div>
                          </div>

                          {hasUnread && (
                            <span className="min-w-[18px] h-4.5 px-1 bg-red-600 text-white font-black text-[10px] rounded-full flex items-center justify-center border-0 shadow-xs animate-bounce shrink-0">
                              {conv.unreadCountForAdmin}
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-600 truncate font-medium bg-white/80 p-1.5 rounded-lg">
                          {conv.lastMessage}
                        </p>

                        <div className="mt-1.5 flex items-center justify-between text-[8.5px] text-slate-400 font-mono">
                          <span className="truncate max-w-[70px]">ID: {conv.id}</span>
                          <span>{conv.lastTime}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* CONVERSATION SELECTIONNEE AFFICHEE EN BAS */}
            <div className="bg-slate-50/70 rounded-2xl overflow-hidden flex flex-col h-[520px] border border-slate-200/50">
              {activeConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3.5 bg-slate-100/90 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">{activeConv.userName}</h4>
                        <span className="text-[9.5px] font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                          ID: {activeConv.id}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-mono mt-0.5">📞 {activeConv.userPhone}</p>
                    </div>

                    <button
                      onClick={() => {
                        clearConversationForAdmin(activeConv.id);
                        setChatConversations(getAllConversations());
                      }}
                      className="text-xs text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-xl font-bold bg-rose-50 cursor-pointer transition-colors"
                      title="Efface la discussion de votre côté uniquement (reste visible pour le client)"
                    >
                      Effacer la discussion
                    </button>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                    {activeConv.messages
                      .filter((m) => !m.deletedForAdmin)
                      .map((m) => {
                        const isAdmin = m.sender === "admin";
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col group ${isAdmin ? "items-end" : "items-start"}`}
                          >
                            <div className="flex items-center gap-1.5 max-w-[85%]">
                              {/* If admin message, trash icon on left */}
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteMessageForAdmin(m.id, activeConv.id);
                                    setChatConversations(getAllConversations());
                                  }}
                                  title="Supprimer ce message chez moi uniquement"
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer shrink-0"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}

                              <div className={`p-3 rounded-2xl text-xs leading-relaxed font-semibold shadow-2xs w-full ${
                                isAdmin
                                  ? "bg-emerald-600 text-white rounded-br-xs"
                                  : "bg-white text-slate-900 rounded-bl-xs shadow-2xs"
                              }`}>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className={`block text-[9px] font-black uppercase ${isAdmin ? "text-emerald-200" : "text-blue-600"}`}>
                                    {isAdmin ? "Administrateur Nutrien" : m.userName || "Client"}
                                  </span>
                                </div>
                                {m.attachment && (
                                  <div className="mb-2 rounded-xl overflow-hidden max-w-[220px]">
                                    <img src={m.attachment} alt="Pièce jointe" className="w-full h-auto object-cover" />
                                  </div>
                                )}
                                <p className="whitespace-pre-wrap">{m.text}</p>
                                <span className={`block text-[9px] mt-1 text-right font-mono ${isAdmin ? "text-emerald-100" : "text-slate-400"}`}>
                                  {m.time}
                                </span>
                              </div>

                              {/* If user message, trash icon on right */}
                              {!isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteMessageForAdmin(m.id, activeConv.id);
                                    setChatConversations(getAllConversations());
                                  }}
                                  title="Supprimer ce message chez moi uniquement"
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer shrink-0"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    <div ref={adminChatEndRef} />
                  </div>

                  {/* Quick Response Templates */}
                  <div className="px-3 py-1.5 bg-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setAdminChatInput("Bonjour ! Votre demande a été traitée avec succès par l'administration.")}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-[9.5px] font-bold rounded-lg whitespace-nowrap cursor-pointer shadow-2xs"
                    >
                      ✅ Traité avec succès
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminChatInput("Votre dépôt a bien été crédité sur votre compte Nutrien.")}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[9.5px] font-bold rounded-lg whitespace-nowrap cursor-pointer shadow-2xs"
                    >
                      💳 Dépôt validé
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminChatInput("Veuillez nous fournir une capture d'écran claire du SMS de confirmation.")}
                      className="px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 text-[9.5px] font-bold rounded-lg whitespace-nowrap cursor-pointer shadow-2xs"
                    >
                      📩 Demander capture SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminChatInput("Votre demande de retrait a été validée et envoyée vers votre Mobile Money.")}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-[9.5px] font-bold rounded-lg whitespace-nowrap cursor-pointer shadow-2xs"
                    >
                      💸 Retrait effectué
                    </button>
                  </div>

                  {/* Image Preview if selected */}
                  {adminImageAttachment && (
                    <div className="px-3 py-1.5 bg-emerald-50 flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-900">Capture / Reçu prêt à être envoyé</span>
                      <button onClick={() => setAdminImageAttachment(null)} className="text-rose-600 font-bold hover:underline cursor-pointer">
                        Annuler
                      </button>
                    </div>
                  )}

                  {/* Input form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!adminChatInput.trim() && !adminImageAttachment) return;
                      addSupportMessage({
                        conversationId: activeConv.id,
                        sender: "admin",
                        senderName: "Administrateur Nutrien",
                        text: adminChatInput.trim(),
                        attachment: adminImageAttachment || undefined
                      });
                      setSelectedConvId(activeConv.id);
                      markAsRead(activeConv.id, "admin");
                      setAdminChatInput("");
                      setAdminImageAttachment(null);
                      setTimeout(() => {
                        adminChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
                      }, 50);
                    }}
                    className="p-2.5 bg-slate-50 flex items-center gap-2"
                  >
                    <input
                      type="file"
                      id="admin-chat-file-input"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            if (evt.target?.result) setAdminImageAttachment(evt.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("admin-chat-file-input")?.click()}
                      className="p-2 text-slate-400 hover:text-emerald-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                      title="Joindre une image/reçu"
                    >
                      <Paperclip className="h-4.5 w-4.5" />
                    </button>

                    <input
                      type="text"
                      placeholder="Répondre à ce client..."
                      value={adminChatInput}
                      onChange={(e) => setAdminChatInput(e.target.value)}
                      className="flex-1 bg-white shadow-2xs rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
                    />

                    <button
                      type="submit"
                      disabled={!adminChatInput.trim() && !adminImageAttachment}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                        adminChatInput.trim() || adminImageAttachment
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-2">
                  <MessageSquare className="h-10 w-10 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">Sélectionnez un utilisateur dans la rangée ci-dessus</p>
                  <p className="text-[11px] text-slate-400">Pour afficher la conversation, répondre aux messages ou envoyer des justificatifs.</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* --- EXTRA INTERNAL MODAL: DISTRIBUTE USER BONUS --- */}
      {showBonusUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative text-slate-800">
            
            <div className="bg-slate-50 py-4 px-6 flex items-center justify-between">
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
              <div className="bg-slate-50 p-3.5 rounded-xl mb-4 text-xs">
                <p className="text-slate-500 uppercase tracking-widest font-semibold text-[9.5px]">Client bénéficiaire :</p>
                <p className="font-bold text-slate-900 mt-1">{showBonusUserModal.name}</p>
                <p className="text-[10px] text-slate-600 font-mono mt-0.5">📞 {showBonusUserModal.phone}</p>
              </div>

              <form onSubmit={handleSendBonus} className="space-y-4">
                
                {/* Currency value */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Montant du Bonus (XAF / XOF)</label>
                  <input
                    id="admin-bonus-value-usr"
                    type="number"
                    required
                    placeholder="Ex: 5000"
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value)}
                    className="w-full bg-slate-50 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    className="w-full bg-slate-50 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
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
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative text-slate-800">
            
            <div className="bg-slate-50 py-4 px-6 flex items-center justify-between">
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
                    className="w-full bg-slate-50 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
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
                    className="w-full bg-slate-50 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                {/* Wallet Balance */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Solde Portefeuille (XAF / XOF)</label>
                  <input
                    id="edit-user-balance"
                    type="number"
                    required
                    value={editUserBalance}
                    onChange={(e) => setEditUserBalance(e.target.value)}
                    className="w-full bg-slate-50 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
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
                    className="w-full bg-slate-50 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                {/* Commissions Earned */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Commissions Gagnées (XAF / XOF)</label>
                  <input
                    id="edit-user-commission"
                    type="number"
                    required
                    value={editUserCommission}
                    onChange={(e) => setEditUserCommission(e.target.value)}
                    className="w-full bg-slate-50 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
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
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative text-slate-800">
            
            <div className="bg-slate-50 py-4 px-6 flex items-center justify-between">
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

            <div className="p-6 max-h-[80vh] overflow-y-auto pr-2 no-scrollbar">
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
                    className="w-full bg-slate-50 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Prix d'Achat (XAF / XOF)</label>
                  <input
                    id="edit-prod-price"
                    type="number"
                    required
                    value={editProdPrice}
                    onChange={(e) => setEditProdPrice(e.target.value)}
                    className="w-full bg-slate-50 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                {/* Daily Income */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Revenu Journalier (XAF / XOF)</label>
                  <input
                    id="edit-prod-daily"
                    type="number"
                    required
                    value={editProdDailyIncome}
                    onChange={(e) => setEditProdDailyIncome(e.target.value)}
                    className="w-full bg-slate-50 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
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
                    className="w-full bg-slate-50 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Catégorie du Produit</label>
                  <select
                    id="edit-prod-category"
                    value={editProdCategory}
                    onChange={(e) => setEditProdCategory(e.target.value as any)}
                    className="w-full bg-slate-50 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-blue-500"
                  >
                    <option value="wellbeing">🌿 Bien-être</option>
                    <option value="stability">⭐ VIP Standard</option>
                  </select>
                </div>

                {/* Product Image URL */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">URL de l'image (Optionnel)</label>
                  <input
                    id="edit-prod-image"
                    type="url"
                    placeholder="https://... ou vide pour image auto"
                    value={editProdImage}
                    onChange={(e) => setEditProdImage(e.target.value)}
                    className="w-full bg-slate-50 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                <div className="flex gap-2.5 pt-3 sticky bottom-0 bg-white py-2 border-t border-slate-100 z-10">
                  <button
                    id="admin-edit-prod-submit"
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>Enregistrer</span>
                  </button>
                  <button
                    id="admin-edit-prod-cancel"
                    type="button"
                    onClick={() => { setEditingProduct(null); }}
                    className="bg-slate-100 text-slate-600 hover:bg-slate-200 py-3 px-4 rounded-xl text-xs font-bold cursor-pointer transition-colors"
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
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative text-slate-800 p-6 space-y-4">
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

      {/* Frameless Floating Message Banner (No modal box frame) */}
      {alertState && (
        <div 
          onClick={() => {
            const onClose = alertState.onClose;
            setAlertState(null);
            if (onClose) onClose();
          }}
          className="fixed top-4 inset-x-3 sm:inset-x-auto sm:right-4 sm:max-w-md z-[100] cursor-pointer animate-slide-down select-none"
        >
          <div className="p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-white backdrop-blur-md transition-all bg-emerald-600/95">
            <div className="shrink-0 h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
              ℹ️
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-black uppercase tracking-wider text-white/90 leading-tight">
                {alertState.title}
              </p>
              <p className="text-xs font-bold text-white leading-snug mt-0.5">
                {alertState.message}
              </p>
            </div>
            <button className="shrink-0 text-white/80 hover:text-white p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- ADMIN PUBLISH CERTIFICATE / PROOF MODAL --- */}
      {showAdminProofModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative text-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                <Upload className="h-4 w-4 text-emerald-600" />
                Publier un Certificat / Preuve Officielle
              </h3>
              <button
                onClick={() => setShowAdminProofModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Cette preuve ou certificat sera immédiatement publié et visible sur <strong className="text-slate-800">TOUS les comptes utilisateurs</strong>.
            </p>

            <form onSubmit={handleAdminPublishProof} className="space-y-3 text-left">
              <div>
                <label className="text-[10.5px] font-black uppercase text-slate-700 block mb-1">
                  Nom de l'utilisateur / Titre
                </label>
                <input
                  type="text"
                  placeholder="ex: Jean K. / Nutrien Official"
                  value={adminProofName}
                  onChange={(e) => setAdminProofName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10.5px] font-black uppercase text-slate-700 block mb-1">
                    Téléphone (ex: +22890123456)
                  </label>
                  <input
                    type="text"
                    placeholder="+22890123456"
                    value={adminProofPhone}
                    onChange={(e) => setAdminProofPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10.5px] font-black uppercase text-slate-700 block mb-1">
                    Montant de Retrait (FCFA)
                  </label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={adminProofAmount}
                    onChange={(e) => setAdminProofAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10.5px] font-black uppercase text-slate-700 block mb-1">
                  Image du Certificat / Reçu SMS (Image File ou URL) *
                </label>
                {adminProofImage ? (
                  <div className="relative rounded-xl overflow-hidden max-h-40 bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <img src={adminProofImage} alt="Preuve Admin" className="object-contain max-h-40 w-full" />
                    <button
                      type="button"
                      onClick={() => setAdminProofImage(null)}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center rounded-xl p-3 border border-dashed border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/80 cursor-pointer transition-all text-center">
                      <Camera className="h-5 w-5 text-emerald-600 mb-1" />
                      <span className="text-[11px] font-black text-slate-800">Importer un fichier image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setAdminProofImage(ev.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="url"
                      placeholder="Ou collez une URL d'image directe (https://...)"
                      onChange={(e) => {
                        if (e.target.value) setAdminProofImage(e.target.value);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10.5px] font-black uppercase text-slate-700 block mb-1">
                  Commentaire / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="ex: Retrait réussi et confirmé par Mobile Money"
                  value={adminProofNote}
                  onChange={(e) => setAdminProofNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={btnLoadingId === "admin_proof_submit"}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer transition-all shadow-xs"
                >
                  {btnLoadingId === "admin_proof_submit" ? "Publication..." : "Publier immédiatement"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminProofModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADMIN FULL SCREEN IMAGE LIGHTBOX --- */}
      {adminPreviewImage && (
        <div 
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setAdminPreviewImage(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[88vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setAdminPreviewImage(null)}
              className="absolute -top-11 right-0 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full cursor-pointer shadow-lg"
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={adminPreviewImage} 
              alt="Preuve Admin" 
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}

    </div>
  );
}
