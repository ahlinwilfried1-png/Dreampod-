/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Shield, Info, Smartphone, Lock, UserPlus, Eye, EyeOff } from "lucide-react";
import { api, getUseLocalFallback, setUseLocalFallback } from "../lib/api";

interface RegisterPageProps {
  onSuccess: (token: string, user: any) => void;
  onNavigateToLogin: () => void;
}

const AFRICAN_COUNTRIES = [
  { code: "+229", name: "Bénin 🇧🇯" },
  { code: "+237", name: "Cameroun 🇨🇲" },
  { code: "+226", name: "Burkina Faso 🇧🇫" },
];

export default function RegisterPage({ onSuccess, onNavigateToLogin }: RegisterPageProps) {
  const [countryCode, setCountryCode] = useState("+229");
  const [phoneBody, setPhoneBody] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referrerCode, setReferrerCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Custom database simulation state
  const [isLocalFallback, setIsLocalFallback] = useState(getUseLocalFallback());

  const handleToggleMode = () => {
    const newVal = !isLocalFallback;
    setUseLocalFallback(newVal);
    setIsLocalFallback(newVal);
  };
  
  // Validation States
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: "Très faible", color: "bg-red-500" });

  // Prefill referrer code from URL automatically
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferrerCode(ref);
    }
  }, []);

  // Evaluate Password Security Strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, text: "Inexistant", color: "bg-red-200" });
      return;
    }
    
    let score = 1;
    if (password.length >= 4) score = 5;

    let text = "Trop court";
    let color = "bg-red-500";
    if (score === 5) {
      text = "Correct ✨";
      color = "bg-green-500 shadow-green-500/20 shadow-xs";
    }
    setPasswordStrength({ score, text, color });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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

      // Triggers login success state
      onSuccess(result.token, result.user);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 select-none pb-24 md:pb-6 relative overflow-hidden">
      {/* Decorative ambient background gradients (soft blue, light/airy) */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-100 rounded-full blur-[100px] pointer-events-none opacity-60" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-100 rounded-full blur-[100px] pointer-events-none opacity-60" />

      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl relative z-10 shadow-xl border border-slate-200/80">
        
        {/* Core Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 mb-3 select-none">
            <UserPlus id="icon-register-user" className="h-7 w-7 stroke-[1.8]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 select-none">
            DREAM<span className="text-blue-600">POD</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Créez votre compte et recevez <span className="text-blue-600 font-bold">200 FCFA</span> de bonus de bienvenue !
          </p>
        </div>

        {/* Sponsor/Referral Highlight */}
        {referrerCode && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-4 flex items-center space-x-3 text-xs text-emerald-800 animate-slide-in">
            <Shield className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold">Vous êtes invité(e) !</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">Code de votre parrain : <span className="font-black bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded-md text-xs">{referrerCode}</span></p>
            </div>
          </div>
        )}

        {/* Error Box */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4 flex items-start space-x-2 text-xs text-red-700 animate-slide-in">
            <Info className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Numéro de téléphone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 px-1">
              <Smartphone className="h-3.5 w-3.5 text-blue-600" />
              Numéro de téléphone
            </label>
            <div className="flex space-x-2">
              {/* National code dropdown */}
              <select
                id="register-select-country"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-2xl py-3 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              >
                {AFRICAN_COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code} className="bg-white text-slate-800">
                    {country.code} ({country.name.split(" ")[0]})
                  </option>
                ))}
              </select>

              {/* Input field */}
              <input
                id="register-input-phone"
                type="tel"
                required
                placeholder="Ex: 90123456"
                value={phoneBody}
                onChange={(e) => setPhoneBody(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 px-1">
              <Lock className="h-3.5 w-3.5 text-blue-600" />
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="register-input-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 pr-11 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Strength indicator */}
            {password && (
              <div className="px-1 mt-1">
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>Sécurité : <span className="font-semibold text-slate-700">{passwordStrength.text}</span></span>
                  <span>{passwordStrength.score}/5</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden flex space-x-0.5 border border-slate-200/50">
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <div
                      key={idx}
                      className={`h-full flex-1 transition-all duration-350 ${
                        idx <= passwordStrength.score ? passwordStrength.color : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirmation du mot de passe */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 px-1">
              <Lock className="h-3.5 w-3.5 text-blue-600" />
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                id="register-input-confirm"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 pr-11 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[10px] text-red-500 px-1 mt-0.5">Les mots de passe ne correspondent pas.</p>
            )}
          </div>

          {/* Code Parrain */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 px-1">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              Code Parrain / ID Parrain (Optionnel)
            </label>
            <input
              id="register-input-referrer"
              type="text"
              placeholder="Ex: JEAN90 (laisser vide sinon)"
              value={referrerCode}
              onChange={(e) => setReferrerCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Submit */}
          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-blue-500/10 mt-4 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer text-sm"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
            ) : (
              <span>S'inscrire</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-500">
            Vous avez déjà un compte ?{" "}
            <button
              id="register-goto-login-btn"
              onClick={onNavigateToLogin}
              className="text-blue-600 hover:text-blue-500 font-bold transition-all ml-1 underline underline-offset-4 cursor-pointer"
            >
              Se connecter
            </button>
          </p>
        </div>

        {/* Database Connection Mode Toggler */}
        <div className="mt-4 pt-4 border-t border-dashed border-slate-200/80 text-center">
          <button
            type="button"
            onClick={handleToggleMode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border cursor-pointer hover:bg-slate-50 active:scale-95 bg-white text-slate-700 border-slate-200"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isLocalFallback ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`} />
            <span>Mode : <strong className={isLocalFallback ? "text-amber-600" : "text-emerald-600"}>{isLocalFallback ? "Simulation Locale" : "Serveur principal (Supabase)"}</strong></span>
          </button>
          <p className="text-[9px] text-slate-400 mt-1.5 max-w-[240px] mx-auto leading-normal">
            {isLocalFallback 
              ? "Les données sont stockées sur votre appareil. Pratique si le serveur est indisponible." 
              : "Données connectées en temps réel sur notre serveur principal."}
          </p>
        </div>

      </div>
    </div>
  );
}
