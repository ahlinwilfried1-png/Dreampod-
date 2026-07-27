/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowLeft, Lock, Eye, EyeOff, Gift, Check, ChevronDown, ArrowRight, Info } from "lucide-react";
import { api } from "../lib/api";

interface RegisterPageProps {
  onSuccess: (token: string, user: any) => void;
  onNavigateToLogin: () => void;
}

const AFRICAN_COUNTRIES = [
  { code: "+226", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "+237", name: "Cameroun", flag: "🇨🇲" },
  { code: "+228", name: "Togo", flag: "🇹🇬" },
  { code: "+229", name: "Bénin", flag: "🇧🇯" },
  { code: "+225", name: "Côte d'Ivoire", flag: "🇨🇮" },
];

export default function RegisterPage({ onSuccess, onNavigateToLogin }: RegisterPageProps) {
  const [countryCode, setCountryCode] = useState("+228");
  const [phoneBody, setPhoneBody] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referrerCode, setReferrerCode] = useState("1JT5LFZ34I");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [acceptNews, setAcceptNews] = useState(false);

  // Validation States
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill referrer code from URL or sessionStorage automatically
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref") || sessionStorage.getItem("nutrien_referral_code");
    if (ref) {
      setReferrerCode(ref);
    }
  }, []);

  const selectedCountry = AFRICAN_COUNTRIES.find((c) => c.code === countryCode) || AFRICAN_COUNTRIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation.");
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
    if (password.length < 4) {
      setError("Le mot de passe doit comporter au moins 4 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const fullPhone = `${countryCode}${phoneBody.trim()}`;

    try {
      const result = await api.register({
        phone: fullPhone,
        password: password,
        referrerCode: referrerCode.trim() || undefined,
      });

      onSuccess(result.token, result.user);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50/40 to-slate-50 text-slate-900 flex flex-col items-center justify-center p-0 sm:p-4 select-none relative">
      <div className="w-full max-w-md bg-white sm:rounded-3xl shadow-xl overflow-hidden min-h-screen sm:min-h-0 flex flex-col">
        
        {/* Banner Header Image with Nutrien Ag Solutions Fertilizer Bag */}
        <div className="relative h-56 w-full bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
          {/* Green Agricultural Backdrop */}
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80" 
            alt="Agricultural Field Background" 
            className="w-full h-full object-cover opacity-60 blur-[1px]"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/30" />

          {/* Back Button Top Left */}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-slate-800 shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer z-20"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
          </button>

          {/* Nutrien Fertilizer Bag Display */}
          <div className="h-40 w-32 relative z-10 drop-shadow-2xl mt-2 transition-transform hover:scale-105">
            <img 
              src="/nutrien_bag.svg" 
              alt="Nutrien Ag Solutions Fertilizer Bag" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* Center Bottom Green Leaf Badge */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-11 h-11 bg-[#16a34a] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-white z-20">
            🌱
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-7 space-y-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Title & Tagline */}
            <div className="mb-5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                Créer un compte <span className="text-amber-400 text-xl">✨</span>
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Rejoignez-nous et commencez à investir
              </p>
            </div>

            {/* Error Box */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 mb-4 flex items-start gap-2 text-xs text-red-700 animate-slide-in">
                <Info className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Numéro de téléphone */}
              <div className="flex items-center gap-2">
                {/* Flag Selector Dropdown */}
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

                {/* Phone Input Box */}
                <div className="flex-1 flex items-center bg-white border border-slate-200/90 rounded-2xl py-3.5 px-4 focus-within:ring-2 focus-within:ring-[#6C5CE7]/20 focus-within:border-[#6C5CE7] transition-all shadow-2xs">
                  <span className="text-sm font-black text-slate-800 mr-2.5 border-r border-slate-200 pr-2.5 shrink-0">
                    {countryCode}
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="Numéro de téléphone"
                    value={phoneBody}
                    onChange={(e) => setPhoneBody(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mot de passe */}
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

              {/* Confirmer le mot de passe */}
              <div className="flex items-center bg-white border border-slate-200/90 rounded-2xl py-3.5 px-4 focus-within:ring-2 focus-within:ring-[#6C5CE7]/20 focus-within:border-[#6C5CE7] transition-all shadow-2xs">
                <Lock className="h-5 w-5 text-[#6C5CE7] mr-3 shrink-0" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 ml-2 focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Invitation Code */}
              <div className="flex items-center bg-white border border-slate-200/90 rounded-2xl py-3.5 px-4 focus-within:ring-2 focus-within:ring-[#6C5CE7]/20 focus-within:border-[#6C5CE7] transition-all shadow-2xs">
                <Gift className="h-5 w-5 text-amber-500 mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Code d'invitation"
                  value={referrerCode}
                  onChange={(e) => setReferrerCode(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none tracking-wide"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-2.5 pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
                    acceptTerms ? "bg-[#6C5CE7] text-white" : "border-2 border-slate-300 bg-white"
                  }`}>
                    {acceptTerms && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    J'accepte les <span className="text-[#6C5CE7] font-bold hover:underline">Conditions d'utilisation</span>
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptNews}
                    onChange={(e) => setAcceptNews(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
                    acceptNews ? "bg-[#6C5CE7] text-white" : "border-2 border-slate-300 bg-white"
                  }`}>
                    {acceptNews && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    J'accepte de recevoir des offres et actualités
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !acceptTerms}
                className="w-full bg-[#6C5CE7] hover:bg-[#5b4bc4] active:scale-98 text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-md shadow-[#6C5CE7]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-4"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>S'inscrire</span>
                    <ArrowRight className="h-4.5 w-4.5 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Link */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500">
              Déjà un compte ?{" "}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-[#6C5CE7] font-bold hover:underline cursor-pointer ml-1"
              >
                Se connecter
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

