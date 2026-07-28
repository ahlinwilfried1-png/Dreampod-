/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  setToken, 
  getToken, 
  removeToken, 
  api 
} from "./lib/api";
import { User, Investment, Transaction, Product, TeamMember } from "./types";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import BottomNavBar from "./components/BottomNavBar";
import DashboardView from "./components/DashboardView";
import ProductsView from "./components/ProductsView";
import TeamView from "./components/TeamView";
import ProfileView from "./components/ProfileView";
import AdminView from "./components/AdminView";
import DepositView from "./components/DepositView";
import WithdrawView from "./components/WithdrawView";
import HistoryView from "./components/HistoryView";
import SupportView from "./components/SupportView";
import AboutView from "./components/AboutView";
import SettingsView from "./components/SettingsView";
import InvestmentsView from "./components/InvestmentsView";
import BankCardView from "./components/BankCardView";
import VipView from "./components/VipView";
import { getCurrencySymbol } from "./lib/currency";
import SpinWheelView from "./components/SpinWheelView";
import ProofsView from "./components/ProofsView";
import AnnouncementsView from "./components/AnnouncementsView";
import GiftView from "./components/GiftView";
import FloatingCustomerService from "./components/FloatingCustomerService";
import { Cpu, ShieldCheck, X, Gift, Send, MessageSquare } from "lucide-react";

export default function App() {
  // Session States
  const [token, setSessionToken] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("ref")) {
      removeToken(); // Clear previous session when joining with a referral link to force new registration
      return null;
    }
    return getToken();
  });
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("nutrien_user_cache");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [investments, setInvestments] = useState<Investment[]>(() => {
    try {
      const saved = localStorage.getItem("nutrien_investments_cache");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem("nutrien_transactions_cache");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("nutrien_products_cache");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [team, setTeam] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem("nutrien_team_cache");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // UI states
  const [authView, setAuthView] = useState<"login" | "register">(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("login") || window.location.pathname.toLowerCase().includes("login")) {
      return "login";
    }
    return "register";
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [previousTab, setPreviousTab] = useState<string>("dashboard");
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleSetActiveTab = (tab: string) => {
    const primaryTabs = ["dashboard", "products", "team", "profile", "admin"];
    if (primaryTabs.includes(activeTab)) {
      setPreviousTab(activeTab);
    }
    setActiveTab(tab);
    if (tab === "dashboard") {
      setShowWelcomeModal(true);
    }
  };

  // Auto-Sync User status details from backend
  const syncAccountStats = async () => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    try {
      const stats = await api.getStats();
      setUser(stats.user);
      setInvestments(stats.investments || []);
      setTransactions(stats.transactions || []);
      setProducts(stats.products || []);
      setTeam(stats.team || []);

      // Persist in local storage cache for instant subsequent renders
      try {
        localStorage.setItem("nutrien_user_cache", JSON.stringify(stats.user));
        if (stats.investments) localStorage.setItem("nutrien_investments_cache", JSON.stringify(stats.investments));
        if (stats.transactions) localStorage.setItem("nutrien_transactions_cache", JSON.stringify(stats.transactions));
        if (stats.products) localStorage.setItem("nutrien_products_cache", JSON.stringify(stats.products));
        if (stats.team) localStorage.setItem("nutrien_team_cache", JSON.stringify(stats.team));
      } catch (e) {
        // Ignore cache write errors
      }
    } catch (error: any) {
      console.error("Session stats retrieval failure indeed:", error);
      // Auto logout ONLY if the session is explicitly unauthorized or user is missing/blocked
      if (
        error.status === 401 || 
        error.status === 403 || 
        error.message?.includes("Utilisateur non trouvé") ||
        error.message?.includes("Authentification") ||
        error.message?.includes("Session")
      ) {
        handleLogout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      if (!user) {
        setLoading(true);
      }
      syncAccountStats();
    }
  }, [token]);

  // If the user visits with a referral code, display the register page directly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      sessionStorage.setItem("nutrien_referral_code", ref);
    }
    if (params.has("ref") || window.location.pathname.toLowerCase().includes("register")) {
      removeToken();
      setSessionToken(null);
      setUser(null);
      setAuthView("register");
    }
  }, []);

  // Show welcome modal every time an active user visits or reloads the dashboard (page d'accueil)
  useEffect(() => {
    if (user && activeTab === "dashboard") {
      setShowWelcomeModal(true);
    }
  }, [user, activeTab]);

  // Clean up URL query parameters and pathname when logged in to prevent accidental resets
  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search);
      if (params.has("ref") || window.location.pathname !== "/" || window.location.search !== "") {
        try {
          window.history.replaceState({}, document.title, "/");
        } catch (e) {
          console.warn("Failed to replace state:", e);
        }
      }
    }
  }, [user]);

  const handleAuthSuccess = (newToken: string, loggedInUser: User) => {
    setToken(newToken);
    setSessionToken(newToken);
    setUser(loggedInUser);
    setShowWelcomeModal(true);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    removeToken();
    setSessionToken(null);
    setUser(null);
    setInvestments([]);
    setTransactions([]);
    setProducts([]);
    setTeam([]);
    try {
      localStorage.removeItem("nutrien_user_cache");
      localStorage.removeItem("nutrien_investments_cache");
      localStorage.removeItem("nutrien_transactions_cache");
      localStorage.removeItem("nutrien_products_cache");
      localStorage.removeItem("nutrien_team_cache");
    } catch (e) {}
    setShowWelcomeModal(false);
    setAuthView("register");
    setActiveTab("dashboard");
  };

  // User refresh trigger helper
  const handleRefreshData = () => {
    setRefreshing(true);
    syncAccountStats();
  };

  // Loader screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050B18] text-white flex flex-col items-center justify-center p-6 select-none">
        <div className="relative flex items-center justify-center p-6 border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl w-24 h-24 shadow-2xl">
          <Cpu className="h-10 w-10 text-blue-500 stroke-[1.8] animate-spin duration-3000" />
          <div className="absolute inset-0 border border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin duration-1000" />
        </div>
        <h3 className="text-sm font-extrabold text-emerald-500 uppercase tracking-widest mt-6 animate-pulse">NUTRIEN</h3>
        <p className="text-[10px] text-slate-400 tracking-wide mt-2">Chargement sécurisé de vos données en cours...</p>
      </div>
    );
  }

  // Auth Layout fallback
  if (!user || !token) {
    return authView === "login" ? (
      <LoginPage
        onSuccess={handleAuthSuccess}
        onNavigateToRegister={() => setAuthView("register")}
      />
    ) : (
      <RegisterPage
        onSuccess={handleAuthSuccess}
        onNavigateToLogin={() => setAuthView("login")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50/40 to-slate-50 text-slate-800 relative w-full overflow-x-hidden">
      
      {/* Main Multi-Tab Core View Layout */}
      <main className="w-full max-w-2xl mx-auto px-3 sm:px-6 pt-3 pb-24 overflow-x-hidden">
        
        {activeTab === "dashboard" && (
          <DashboardView
            user={user}
            investments={investments}
            transactions={transactions}
            products={products}
            onRefresh={handleRefreshData}
            setActiveTab={handleSetActiveTab}
          />
        )}

        {activeTab === "products" && (
          <InvestmentsView
            investments={investments}
            onBack={() => setActiveTab("dashboard")}
            setActiveTab={handleSetActiveTab}
            userPhone={user.phone}
          />
        )}

        {activeTab === "team" && (
          <TeamView
            user={user}
            transactions={transactions}
            team={team}
          />
        )}

        {activeTab === "profile" && (
          <ProfileView
            user={user}
            investments={investments}
            transactions={transactions}
            onRefresh={handleRefreshData}
            onLogout={handleLogout}
            setActiveTab={handleSetActiveTab}
          />
        )}

        {activeTab === "admin" && user.role === "admin" && (
          <AdminView
            onRefresh={handleRefreshData}
          />
        )}

        {activeTab === "deposit" && (
          <DepositView
            user={user}
            onRefresh={handleRefreshData}
            onBack={() => setActiveTab(previousTab)}
          />
        )}

        {activeTab === "withdraw" && (
          <WithdrawView
            user={user}
            investments={investments}
            transactions={transactions}
            onRefresh={handleRefreshData}
            onBack={() => setActiveTab(previousTab)}
            onNavigateToBankCard={() => {
              setPreviousTab("withdraw");
              setActiveTab("bankcard");
            }}
          />
        )}

        {activeTab === "history" && (
          <HistoryView
            transactions={transactions}
            investments={investments}
            onBack={() => setActiveTab(previousTab)}
            userPhone={user.phone}
          />
        )}

        {activeTab === "support" && (
          <SupportView
            onBack={() => setActiveTab(previousTab)}
            userPhone={user.phone}
            initialMode="chat"
          />
        )}

        {activeTab === "customer_service" && (
          <SupportView
            onBack={() => setActiveTab(previousTab)}
            userPhone={user.phone}
            initialMode="channels"
          />
        )}

        {activeTab === "about" && (
          <AboutView
            onBack={() => setActiveTab(previousTab)}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView
            onBack={() => setActiveTab(previousTab)}
          />
        )}

        {activeTab === "investments" && (
          <InvestmentsView
            investments={investments}
            onBack={() => setActiveTab(previousTab)}
            setActiveTab={handleSetActiveTab}
            userPhone={user.phone}
          />
        )}

        {activeTab === "bankcard" && (
          <BankCardView
            user={user}
            onRefresh={handleRefreshData}
            onBack={() => setActiveTab(previousTab)}
          />
        )}

        {activeTab === "vip" && (
          <VipView
            onBack={() => setActiveTab(previousTab)}
            setActiveTab={handleSetActiveTab}
            userPhone={user.phone}
          />
        )}

        {activeTab === "wheel" && (
          <SpinWheelView
            user={user}
            onRefresh={handleRefreshData}
            onBack={() => setActiveTab(previousTab)}
          />
        )}

        {activeTab === "proofs" && (
          <ProofsView
            onBack={() => setActiveTab(previousTab)}
            userPhone={user.phone}
          />
        )}

        {activeTab === "announcements" && (
          <AnnouncementsView
            onBack={() => setActiveTab(previousTab)}
            userPhone={user.phone}
          />
        )}

        {activeTab === "gift" && (
          <GiftView
            user={user}
            onRefresh={handleRefreshData}
            onBack={() => setActiveTab(previousTab)}
          />
        )}

      </main>

      {/* Floating Draggable Customer Service Badge Widget */}
      {activeTab !== "admin" && (
        <FloatingCustomerService onClick={() => handleSetActiveTab("customer_service")} />
      )}

      {/* Persistent Elegant Bottom Navigation (fixed to bottom viewport) */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        isAdmin={user.role === "admin"}
      />

      {/* --- WELCOME COMMUNIQUE MODAL POPUP --- */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop with elegant blur */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowWelcomeModal(false)}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl z-10 transform transition-all max-h-[85vh] flex flex-col animate-slide-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-5 py-3.5 text-white relative flex-shrink-0">
              <button 
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                <span>🚀 BIENVENUE SUR NUTRIEN</span>
                <span className="text-sm">🌱💰</span>
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5 font-medium">Votre avenir financier commence ici</p>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 overflow-y-auto space-y-3 text-slate-700 text-xs leading-relaxed select-text">
              <p className="font-bold text-slate-900 text-xs leading-normal">
                Bienvenue sur Nutrien ! La plateforme d’investissement agricole automatisée. 🌍
              </p>

              {/* Bonus & Financial Highlights */}
              <div className="py-2 flex items-center gap-3 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200/60">
                <div className="text-2xl">🎁</div>
                <div>
                  <p className="font-black text-slate-900 text-xs">Bonus de bienvenue :</p>
                  <p className="text-emerald-700 font-black text-sm">200 {getCurrencySymbol(user.phone)} offerts à l'inscription</p>
                </div>
              </div>

              {/* Financial Conditions */}
              <div className="py-1 space-y-1.5">
                <p className="font-black text-slate-900 uppercase tracking-wider text-[10px]">
                  💳 Infos clés :
                </p>
                <div className="grid grid-cols-2 gap-2 font-bold text-xs">
                  <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                    <span className="text-slate-500 text-[10px] block">Dépôt Minimum</span>
                    <span className="text-slate-900 font-black">3 000 {getCurrencySymbol(user.phone)}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                    <span className="text-slate-500 text-[10px] block">Retrait Minimum</span>
                    <span className="text-slate-900 font-black">1 000 {getCurrencySymbol(user.phone)}</span>
                  </div>
                </div>
              </div>

              {/* Official Channels Links */}
              <div className="pt-2 space-y-2">
                <a 
                  href="https://t.me/+nlAW_0vhdfI2Yzdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#0088cc] hover:bg-[#0077b3] text-white font-black text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md active:scale-98"
                >
                  <Send className="h-4 w-4" />
                  <span>Rejoindre la Chaîne Telegram</span>
                </a>

                <a 
                  href="https://whatsapp.com/channel/0029Vb7WkWR6rsQuNY2r5i0A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md active:scale-98"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Rejoindre le Canal WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Actions / Close Button */}
            <div className="p-3 bg-emerald-50/50 border-t border-emerald-200/40 flex-shrink-0">
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 active:scale-98 text-white font-extrabold text-xs py-3 rounded-xl transition-all text-center cursor-pointer uppercase tracking-wider"
              >
                Accéder au Tableau de Bord
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
