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
import ForumView from "./components/ForumView";
import DepositView from "./components/DepositView";
import WithdrawView from "./components/WithdrawView";
import HistoryView from "./components/HistoryView";
import SupportView from "./components/SupportView";
import AboutView from "./components/AboutView";
import SettingsView from "./components/SettingsView";
import InvestmentsView from "./components/InvestmentsView";
import BankCardView from "./components/BankCardView";
import VipView from "./components/VipView";
import { Cpu, ShieldCheck, X, Gift } from "lucide-react";

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
  const [user, setUser] = useState<User | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  
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
    const primaryTabs = ["dashboard", "products", "team", "forum", "profile", "admin"];
    if (primaryTabs.includes(activeTab)) {
      setPreviousTab(activeTab);
    }
    setActiveTab(tab);
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
    if (params.has("ref") || window.location.pathname.toLowerCase().includes("register")) {
      removeToken();
      setSessionToken(null);
      setUser(null);
      setAuthView("register");
    }
  }, []);

  // Show welcome modal once on initial load or login, but NOT when switching tabs/pages
  useEffect(() => {
    if (user && !sessionStorage.getItem("dreampod_welcome_shown")) {
      setShowWelcomeModal(true);
      sessionStorage.setItem("dreampod_welcome_shown", "true");
    }
  }, [user]);

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
    sessionStorage.setItem("dreampod_welcome_shown", "true");
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
    setShowWelcomeModal(false);
    sessionStorage.removeItem("dreampod_welcome_shown");
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
        <h3 className="text-sm font-extrabold text-blue-400 uppercase tracking-widest mt-6 animate-pulse">Dreampod</h3>
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
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 relative">
      
      {/* Absolute top visual header with platform notifications helper or indicator */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200/80 backdrop-blur-xl px-4 py-3.5 shadow-xs">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 select-none">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00a3e0] to-blue-700 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <h1 className="text-base font-black tracking-tight text-slate-900">
              DREAM<span className="text-[#00a3e0]">POD</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Multi-Tab Core View Layout */}
      <main className="max-w-lg mx-auto px-4 pt-6 pb-28">
        
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
          <ProductsView
            products={products}
            investments={investments}
            userBalance={user.balance}
            onRefresh={handleRefreshData}
          />
        )}

        {activeTab === "team" && (
          <TeamView
            user={user}
            transactions={transactions}
            team={team}
          />
        )}

        {activeTab === "forum" && (
          <ForumView
            user={user}
            onRefresh={handleRefreshData}
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
            onRefresh={handleRefreshData}
            onBack={() => setActiveTab(previousTab)}
          />
        )}

        {activeTab === "history" && (
          <HistoryView
            transactions={transactions}
            onBack={() => setActiveTab(previousTab)}
          />
        )}

        {activeTab === "support" && (
          <SupportView
            onBack={() => setActiveTab(previousTab)}
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
          />
        )}

      </main>

      {/* Persistent Elegant Bottom Navigation (fixed to bottom viewport) */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        isAdmin={user.role === "admin"}
      />

      {/* --- WELCOME COMMUNIQUE MODAL POPUP --- */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with elegant blur */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowWelcomeModal(false)}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 z-10 transform transition-all max-h-[85vh] flex flex-col animate-slide-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white relative flex-shrink-0">
              <button 
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>🚀 BIENVENUE SUR Dreampod</span>
                <span className="text-base">🌱💰</span>
              </h3>
              <p className="text-[11px] text-blue-100/90 mt-1 font-medium">Votre avenir financier commence ici</p>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-xs leading-relaxed select-text">
              <p className="font-bold text-slate-800 text-sm">
                La nouvelle plateforme d’investissement fiable et innovante est désormais accessible dans plusieurs pays d’Afrique 🌍
              </p>

              {/* Pays éligibles */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <p className="font-black text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <span>✅ Pays éligibles :</span>
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="bg-white border border-slate-200 py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-2xs">
                    🇨🇲 Cameroun
                  </span>
                  <span className="bg-white border border-slate-200 py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-2xs">
                    🇧🇫 Burkina Faso
                  </span>
                  <span className="bg-white border border-slate-200 py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-2xs">
                    🇧🇯 Bénin
                  </span>
                </div>
              </div>

              {/* Bonus d'inscription */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="text-2xl">🎁</div>
                <div>
                  <p className="font-black text-slate-900 text-xs">Bonus d’inscription :</p>
                  <p className="text-blue-600 font-extrabold text-sm mt-0.5">200 FCFA offerts immédiatement</p>
                </div>
              </div>

              {/* Conditions financières & Revenus quotidiens & Parrainage */}
              <div className="space-y-3.5 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                {/* Financial Conditions */}
                <div className="space-y-1.5">
                  <p className="font-black text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <span>💳 Conditions financières :</span>
                  </p>
                  <ul className="grid grid-cols-1 gap-1.5 font-bold text-[11px] text-slate-600">
                    <li className="flex items-center gap-1.5 bg-white py-1.5 px-3 rounded-xl border border-slate-200 shadow-3xs">
                      <span className="text-slate-400">📥</span> Dépôt minimum : <span className="text-slate-900 font-black">4 000 FCFA</span>
                    </li>
                    <li className="flex items-center gap-1.5 bg-white py-1.5 px-3 rounded-xl border border-slate-200 shadow-3xs">
                      <span className="text-slate-400">💸</span> Retrait minimum : <span className="text-slate-900 font-black">1 000 FCFA</span>
                    </li>
                    <li className="flex items-center gap-1.5 bg-white py-1.5 px-3 rounded-xl border border-slate-200 shadow-3xs">
                      <span className="text-slate-400">⚠️</span> Frais de retrait : <span className="text-red-500 font-black">14 %</span>
                    </li>
                  </ul>
                </div>

                {/* Daily Income */}
                <div className="space-y-1">
                  <p className="font-black text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <span>🔥 Revenus quotidiens :</span>
                  </p>
                  <p className="text-[11px] font-bold text-slate-600 pl-1">
                    Recevez <span className="text-emerald-600 font-extrabold">20 FCFA par jour</span> grâce au bonus quotidien.
                  </p>
                </div>

                {/* Parrainage */}
                <div className="space-y-1.5">
                  <p className="font-black text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <span>🤝 Programme de parrainage :</span>
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold text-slate-600 text-center">
                    <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-3xs">
                      <div className="text-sm">🥇</div>
                      <div className="text-[8px] text-slate-400 uppercase mt-0.5">Niveau 1</div>
                      <div className="text-blue-600 font-black text-xs mt-0.5">20 %</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-3xs">
                      <div className="text-sm">🥈</div>
                      <div className="text-[8px] text-slate-400 uppercase mt-0.5">Niveau 2</div>
                      <div className="text-blue-600 font-black text-xs mt-0.5">3 %</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-3xs">
                      <div className="text-sm">🥉</div>
                      <div className="text-[8px] text-slate-400 uppercase mt-0.5">Niveau 3</div>
                      <div className="text-blue-600 font-black text-xs mt-0.5">1 %</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group Link */}
              <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 space-y-1.5">
                <p className="font-black text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <span>💬 Groupe officiel :</span>
                </p>
                <a 
                  href="https://t.me/dreampod_chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-black text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <span>👉 Rejoindre le groupe Telegram</span>
                </a>
              </div>
            </div>

            {/* Actions / Close Button */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-extrabold text-xs py-3.5 rounded-2xl transition-all shadow-md shadow-blue-500/10 cursor-pointer uppercase tracking-wider text-center"
              >
                Compris, c'est parti ! 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
