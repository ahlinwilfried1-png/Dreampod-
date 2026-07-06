/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Smartphone, Lock, LogIn, Info, Eye, EyeOff, MessageCircle, RefreshCw } from "lucide-react";
import { api } from "../lib/api";

interface LoginPageProps {
  onSuccess: (token: string, user: any) => void;
  onNavigateToRegister: () => void;
}

const AFRICAN_COUNTRIES = [
  { code: "+229", name: "Bénin 🇧🇯" },
  { code: "+237", name: "Cameroun 🇨🇲" },
  { code: "+226", name: "Burkina Faso 🇧🇫" },
];

export default function LoginPage({ onSuccess, onNavigateToRegister }: LoginPageProps) {
  const [countryCode, setCountryCode] = useState("+229");
  const [phoneBody, setPhoneBody] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Custom forgot password popup state
  const [showForgotModal, setShowForgotModal] = useState(false);

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

    // Support plain Admin bypass or format phone fully
    let fullPhone = phoneBody.trim();
    if (fullPhone.toLowerCase() !== "admin") {
      // If it doesn't already have an African prefix, append it
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 pb-24 md:pb-6 relative overflow-hidden">
      {/* Decorative ambient background gradients */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-100 rounded-full blur-[110px] pointer-events-none opacity-65" />
      <div className="absolute bottom-1/4 right-1/4 w-85 h-85 bg-indigo-100 rounded-full blur-[120px] pointer-events-none opacity-65" />

      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl relative z-10 shadow-xl border border-slate-200/80">
        
        {/* Head branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 mb-4 shadow-sm">
            <LogIn id="icon-login-btn-logo" className="h-8 w-8 stroke-[1.8]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 select-none">
            DREAM<span className="text-blue-600">POD</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            La banque du futur. Faites fructifier vos capitaux en toute sécurité.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-start space-x-2 text-xs text-red-700 animate-slide-in">
            <Info className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Numéro de téléphone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 px-1">
              <Smartphone className="h-3.5 w-3.5 text-blue-600" />
              Numéro de téléphone ou Nom d'utilisateur
            </label>
            <div className="flex space-x-2">
              {/* Optional Country list (hide if username is typed like 'admin') */}
              {phoneBody.trim().toLowerCase() !== "admin" && (
                <select
                  id="login-select-country"
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
              )}

              <input
                id="login-input-phone"
                type="text"
                required
                placeholder={phoneBody === "admin" ? "admin" : "Ex: 90123456"}
                value={phoneBody}
                onChange={(e) => setPhoneBody(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-blue-600" />
                Mot de passe
              </label>
              
              <button
                id="login-forgot-btn"
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-500 transition-colors cursor-pointer"
              >
                Mot de passe oublié ?
              </button>
            </div>
            
            <div className="relative">
              <input
                id="login-input-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Entrez votre mot de passe"
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
          </div>

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-blue-500/10 mt-6 flex items-center justify-center space-x-2 disabled:opacity-50 select-none cursor-pointer text-sm"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Se connecter</span>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="mt-6 text-center border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-500">
            Nouveau sur la plateforme ?{" "}
            <button
              id="login-goto-register-btn"
              onClick={onNavigateToRegister}
              className="text-blue-600 hover:text-blue-500 font-bold transition-all ml-1 underline underline-offset-4 cursor-pointer animate-pulse"
            >
              S'inscrire / Créer un compte
            </button>
          </p>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in select-none">
          <div className="bg-white p-6 max-w-sm w-full rounded-3xl shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-600 mb-3.5">
                <RefreshCw className="h-6 w-6 stroke-[1.8] animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Récupération de mot de passe</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Pour des raisons de sécurité, les réinitialisations de mot de passe sont gérées par nos agents support. Veuillez contacter notre service d'assistance client WhatsApp avec vos justificatifs d'inscription.
              </p>
              
              <div className="space-y-2">
                <a
                  href="https://wa.me/22890000000?text=Bonjour,%20j'ai%20oublie%20mon%20mot%20de%20passe%20sur%20Dreampod."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Support WhatsApp</span>
                </a>
                
                <button
                  id="forgot-modal-close"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 transition-colors mt-2 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
