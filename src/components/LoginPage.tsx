import React, { useState } from "react";
import { Lock, Eye, EyeOff, ChevronDown, ArrowRight, Shield, RefreshCw, MessageCircle, Headset, Send } from "lucide-react";
import { api } from "../lib/api";
import FloatingCustomerService from "./FloatingCustomerService";

interface LoginPageProps {
  onSuccess: (token: string, user: any) => void;
  onNavigateToRegister: () => void;
}

const AFRICAN_COUNTRIES = [
  { code: "+226", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "+237", name: "Cameroun", flag: "🇨🇲" },
  { code: "+228", name: "Togo", flag: "🇹🇬" },
  { code: "+229", name: "Bénin", flag: "🇧🇯" },
  { code: "+225", name: "Côte d'Ivoire", flag: "🇨🇮" },
];

export default function LoginPage({ onSuccess, onNavigateToRegister }: LoginPageProps) {
  const [countryCode, setCountryCode] = useState("+228");
  const [phoneBody, setPhoneBody] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phoneBody.trim()) {
      setError("Veuillez saisir votre numéro de téléphone.");
      return;
    }
    if (!password) {
      setError("Veuillez saisir votre mot de passe.");
      return;
    }

    setLoading(true);

    let fullPhone = phoneBody.trim();
    const isShortcut = ["admin", "admin2", "admin3"].includes(fullPhone.toLowerCase());
    if (!isShortcut) {
      if (!fullPhone.startsWith("+")) {
        fullPhone = `${countryCode}${fullPhone}`;
      }
    }

    try {
      const result = await api.login({
        phone: fullPhone,
        password: password,
      });

      onSuccess(result.token, result.user);
    } catch (err: any) {
      setError(err.message || "Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50/40 to-slate-50 text-slate-900 flex flex-col items-center justify-center p-0 sm:p-4 select-none relative">
      <div className="w-full max-w-md bg-white sm:rounded-3xl shadow-xl overflow-hidden min-h-screen sm:min-h-0 flex flex-col justify-between relative">
        
        {/* Top Hero Banner Section */}
        <div className="relative h-64 w-full bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
          {/* Green Agricultural Backdrop */}
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80" 
            alt="Agricultural Field" 
            className="w-full h-full object-cover opacity-50 blur-[1px]"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />

          {/* Central Nutrien Ag Solutions Fertilizer Bag Display */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 h-36 w-28 z-10 drop-shadow-2xl transition-transform hover:scale-105">
            <img 
              src="/nutrien_bag.svg" 
              alt="Nutrien Ag Solutions Fertilizer Bag" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* Headings */}
          <div className="absolute bottom-2 inset-x-0 text-center z-10 px-4">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
              <span>NUTRIEN</span>
              <span className="text-2xl animate-bounce">🌱</span>
            </h1>
            <p className="text-xs font-bold text-emerald-800 mt-0.5">
              Ravi de vous revoir parmi nous
            </p>
          </div>
        </div>

        {/* Main Content & Form */}
        <div className="p-6 pt-3 space-y-4 flex-1 flex flex-col justify-between relative z-10">
          <div>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 mb-4 flex items-start gap-2 text-xs text-red-700 animate-slide-in">
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Phone Input with Country Code Dropdown */}
              <div className="flex items-center gap-2">
                {/* Flag Dropdown */}
                {phoneBody.trim().toLowerCase() !== "admin" && (
                  <div className="relative shrink-0">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-white border border-slate-200/90 rounded-2xl py-3.5 pl-3 pr-7 text-base font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 shadow-2xs cursor-pointer"
                    >
                      {AFRICAN_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}

                {/* Phone Body */}
                <div className="flex-1 flex items-center bg-white border border-slate-200/90 rounded-2xl py-3.5 px-4 focus-within:ring-2 focus-within:ring-[#6C5CE7]/20 focus-within:border-[#6C5CE7] transition-all shadow-2xs">
                  {phoneBody.trim().toLowerCase() !== "admin" && (
                    <span className="text-sm font-black text-slate-800 mr-2.5 border-r border-slate-200 pr-2.5 shrink-0">
                      {countryCode}
                    </span>
                  )}
                  <input
                    type="text"
                    required
                    placeholder="Numéro de téléphone"
                    value={phoneBody}
                    onChange={(e) => setPhoneBody(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex items-center bg-white border border-slate-200/90 rounded-2xl py-3.5 px-4 focus-within:ring-2 focus-within:ring-[#6C5CE7]/20 focus-within:border-[#6C5CE7] transition-all shadow-2xs">
                <Lock className="h-5 w-5 text-[#6C5CE7] mr-3 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 ml-2 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Remember Me Row */}
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`w-4.5 h-4.5 rounded flex items-center justify-center transition-all ${
                    rememberMe ? "bg-[#6C5CE7] text-white" : "border-2 border-slate-300 bg-white"
                  }`}>
                    {rememberMe && <span className="text-xs font-black">✓</span>}
                  </div>
                  <span className="font-semibold text-slate-700">Se souvenir de moi</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6C5CE7] hover:bg-[#5b4bc4] active:scale-98 text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-md shadow-[#6C5CE7]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="h-4.5 w-4.5 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Social Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400">
                ou continuer avec
              </span>
            </div>

            {/* Social Buttons */}
            <div className="flex items-center justify-center gap-4">
              {/* Google Button */}
              <button 
                type="button"
                onClick={() => setError("Connexion Google disponible sur l'application mobile.")}
                className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </button>

              {/* Apple Button */}
              <button 
                type="button"
                onClick={() => setError("Connexion Apple disponible sur l'application mobile.")}
                className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 fill-slate-900" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 0.6-2.65 1.36-.58.67-1.09 1.74-.95 2.78 1.01.08 2.05-.54 2.68-1.29z"/>
                </svg>
              </button>

              {/* Purple Shield Button */}
              <button 
                type="button"
                onClick={() => setError("Mode d'authentification sécurisé actif.")}
                className="w-14 h-14 rounded-2xl bg-[#6C5CE7] text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Shield className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>

          {/* Bottom Footer Section with Registration Link & Decorative Food Overlay */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center relative pb-2">
            <p className="text-xs font-semibold text-slate-600 relative z-10">
              Pas encore de compte ?{" "}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-[#6C5CE7] font-bold hover:underline cursor-pointer ml-1"
              >
                S'inscrire
              </button>
            </p>

            {/* Decorative bottom corner illustrations matching Nutrien theme */}
            <div className="flex justify-between items-end pointer-events-none mt-2 -mb-6 -mx-6 opacity-90">
              {/* Left Bag */}
              <div className="w-20 h-20 -rotate-12 transform">
                <img 
                  src="/nutrien_bag.svg" 
                  alt="Nutrien Bag" 
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              {/* Right Bag */}
              <div className="w-22 h-22 rotate-12 transform">
                <img 
                  src="/nutrien_bag.svg" 
                  alt="Nutrien Bag" 
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Draggable Customer Service Widget */}
      <FloatingCustomerService onClick={() => setShowSupportModal(true)} />

      {/* Customer Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative overflow-hidden">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-800 text-amber-300 rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-amber-300/60 relative">
                <Headset className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">CUSTOMER SERVICE</h3>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Support Center</p>
              </div>
              <p className="text-xs font-medium text-slate-500">
                Besoin d'aide pour votre connexion, la réinitialisation de votre mot de passe ou rejoindre la communauté ?
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <a
                href="https://t.me/+nlAW_0vhdfI2Yzdk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-between shadow-md hover:brightness-110 transition-all text-xs cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-white/20 rounded-xl">
                    <Send className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-white">Canal Officiel Telegram</div>
                    <div className="text-[10px] text-sky-100 font-medium">Rejoindre la communauté</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="https://whatsapp.com/channel/0029Vb7WkWR6rsQuNY2r5i0A"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-between shadow-md hover:brightness-110 transition-all text-xs cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-white/20 rounded-xl">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-white">Canal Officiel WhatsApp</div>
                    <div className="text-[10px] text-emerald-100 font-medium">Annonces & Actualités en direct</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="https://wa.me/22890000000?text=Bonjour,%20j'ai%20besoin%20d'aide%20sur%20Nutrien."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-between shadow-md hover:brightness-110 transition-all text-xs cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-white/20 rounded-xl">
                    <Headset className="h-4 w-4 text-amber-300" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-white">Service Client Direct</div>
                    <div className="text-[10px] text-blue-100 font-medium">Assistance 24/7 par un agent</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </a>

              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl text-xs transition-colors cursor-pointer mt-2"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

