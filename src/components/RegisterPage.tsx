/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ArrowRight, 
  Ticket, 
  Headset, 
  Info, 
  Sparkles, 
  Download, 
  MessageSquare,
  Send
} from "lucide-react";
import { api } from "../lib/api";
import FloatingCustomerService from "./FloatingCustomerService";

interface RegisterPageProps {
  onSuccess: (token: string, user: any) => void;
  onNavigateToLogin: () => void;
}

const AFRICAN_COUNTRIES = [
  { code: "+237", name: "Cameroun", flag: "🇨🇲" },
  { code: "+229", name: "Bénin", flag: "🇧🇯" },
  { code: "+226", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "+228", name: "Togo", flag: "🇹🇬" },
  { code: "+225", name: "Côte d'Ivoire", flag: "🇨🇮" },
];

export default function RegisterPage({ onSuccess, onNavigateToLogin }: RegisterPageProps) {
  const [countryCode, setCountryCode] = useState("+228");
  const [phoneBody, setPhoneBody] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referrerCode, setReferrerCode] = useState("MASTER1");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [acceptNews, setAcceptNews] = useState(false);
  
  // Support modal
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Validation States
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill referrer code from URL or sessionStorage if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref") || sessionStorage.getItem("nutrien_referral_code");
    if (ref) {
      setReferrerCode(ref);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation pour continuer.");
      return;
    }

    if (!phoneBody.trim() || isNaN(Number(phoneBody.trim()))) {
      setError("Le numéro de téléphone doit contenir uniquement des chiffres.");
      return;
    }
    if (phoneBody.trim().length < 6) {
      setError("Veuillez entrer un numéro de téléphone valide.");
      return;
    }
    if (!password) {
      setError("Veuillez saisir un mot de passe.");
      return;
    }
    if (password.length < 4) {
      setError("Le mot de passe doit comporter au moins 4 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    let fullPhone = phoneBody.trim();
    if (!fullPhone.startsWith("+")) {
      fullPhone = `${countryCode}${fullPhone}`;
    }

    try {
      const result = await api.register({
        phone: fullPhone,
        password: password,
        referrerCode: referrerCode.trim() || undefined,
      });

      onSuccess(result.token, result.user);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCountryObj = AFRICAN_COUNTRIES.find(c => c.code === countryCode) || AFRICAN_COUNTRIES[0];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-start pb-12 select-none relative font-sans">
      <div className="w-full max-w-md space-y-4">
        
        {/* TOP HERO BANNER - SUNSET LANDSCAPE OVERLAY */}
        <div className="relative w-full h-44 sm:h-52 bg-slate-900 overflow-hidden rounded-b-[36px] shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=90" 
            alt="Sunset Field Landscape" 
            className="w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />

          {/* Centered Sprout Green Badge Icon overlapping bottom border */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl border-2 border-white ring-4 ring-emerald-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* MAIN FORM CARD - CLEAN FRAMELESS DISPLAY */}
        <div className="bg-white rounded-[32px] p-6 sm:p-7 space-y-5 relative mx-3 sm:mx-0 pt-8">
          
          {/* Header Title */}
          <div className="text-left space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Créer un compte</span>
              <span className="text-amber-400">✨</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Rejoignez-nous et commencez à investir
            </p>
          </div>

          {/* Error Notice Box */}
          {error && (
            <div className="bg-rose-50 rounded-2xl p-3 flex items-start gap-2 text-xs text-rose-800 animate-slide-in">
              <Info className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Field 1: Phone Input with Country Flag Dropdown */}
            <div className="flex items-center gap-2">
              {/* Flag Selector Dropdown Button */}
              <div className="relative shrink-0">
                <div className="flex items-center gap-1 bg-slate-50 rounded-2xl px-3.5 py-3.5 text-sm font-bold text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors">
                  <span className="text-base">{selectedCountryObj.flag}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400 ml-0.5" />
                </div>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                >
                  {AFRICAN_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Number Input Box */}
              <div className="flex-1 flex items-center bg-slate-50 rounded-2xl px-3.5 py-3.5 focus-within:bg-slate-100 transition-all">
                <span className="text-sm font-black text-slate-800 mr-2 border-r border-slate-200 pr-2 shrink-0">
                  {countryCode}
                </span>
                <input
                  id="phone-input"
                  type="tel"
                  required
                  placeholder="Numéro de téléphone"
                  value={phoneBody}
                  onChange={(e) => setPhoneBody(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Field 2: Password Input */}
            <div className="flex items-center bg-slate-50 rounded-2xl px-3.5 py-3.5 focus-within:bg-slate-100 transition-all">
              <Lock className="h-5 w-5 text-indigo-500 mr-3 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 ml-2 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Field 3: Confirm Password Input */}
            <div className="flex items-center bg-slate-50 rounded-2xl px-3.5 py-3.5 focus-within:bg-slate-100 transition-all">
              <Lock className="h-5 w-5 text-indigo-500 mr-3 shrink-0" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-400 hover:text-slate-600 ml-2 focus:outline-none cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Field 4: Referral / Invitation Code */}
            <div className="flex items-center bg-slate-50 rounded-2xl px-3.5 py-3.5 focus-within:bg-slate-100 transition-all">
              <Ticket className="h-5 w-5 text-amber-500 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="MASTER1"
                value={referrerCode}
                onChange={(e) => setReferrerCode(e.target.value)}
                className="w-full bg-transparent text-sm font-black text-slate-900 placeholder-slate-400 focus:outline-none tracking-wider uppercase"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2.5 pt-1 text-xs font-bold text-slate-700">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600 cursor-pointer"
                />
                <span>
                  J'accepte les <span className="text-indigo-600 font-extrabold">Conditions d'utilisation</span>
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={acceptNews}
                  onChange={(e) => setAcceptNews(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600 cursor-pointer"
                />
                <span>J'accepte de recevoir des offres et actualités</span>
              </label>
            </div>

            {/* Main Purple Submit Button S'inscrire -> */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366f1] hover:bg-[#4f46e5] active:scale-98 text-white font-extrabold text-base py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4 tracking-tight"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>S'inscrire</span>
                  <ArrowRight className="h-5 w-5 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login Link */}
          <div className="pt-2 text-center">
            <p className="text-xs font-bold text-slate-500">
              Vous avez déjà un compte ?{" "}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-indigo-600 font-extrabold hover:underline cursor-pointer ml-1"
              >
                Se connecter
              </button>
            </p>
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
                Besoin d'aide pour votre inscription, l'activation de votre compte ou rejoindre la communauté ?
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Telegram Official Channel */}
              <a
                href="https://t.me/+nlAW_0vhdfI2Yzdk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#0088cc] hover:bg-[#0077b3] active:scale-98 text-white font-extrabold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Rejoindre le Canal Telegram Officiel</span>
              </a>

              {/* WhatsApp Official Channel */}
              <a
                href="https://whatsapp.com/channel/0029Vb7WkWR6rsQuNY2r5i0A"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white font-extrabold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Rejoindre le Canal WhatsApp Officiel</span>
              </a>

              {/* Direct WhatsApp Service Client */}
              <a
                href="https://wa.me/22890000000?text=Bonjour%20Service%20Client%20Nutrien!"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:scale-98 text-white font-extrabold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Headset className="h-4 w-4 text-amber-300" />
                <span>Service Client WhatsApp Direct</span>
              </a>

              {/* Download App Button */}
              <button
                type="button"
                onClick={() => {
                  alert("Téléchargement de l'application Nutrien (APK / Application Web)...\nL'application s'installera directement sur votre appareil.");
                }}
                className="w-full bg-slate-900 hover:bg-black active:scale-98 text-white font-extrabold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Download className="h-4 w-4 text-orange-400" />
                <span>Télécharger & Installer l'Application</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-2xl transition-all cursor-pointer"
              >
                <span>Aller à la page de Connexion</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSupportModal(false)}
              className="w-full text-xs font-extrabold text-slate-400 hover:text-slate-600 pt-1 cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}




