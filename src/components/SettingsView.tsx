/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lock, ArrowLeft, CheckCircle, ShieldCheck, Key } from "lucide-react";
import { api } from "../lib/api";

interface SettingsViewProps {
  onBack: () => void;
}

export default function SettingsView({ onBack }: SettingsViewProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmNewPassword) {
      setError("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
      return;
    }

    if (newPassword.length < 4) {
      setError("Le nouveau mot de passe doit contenir au moins 4 caractères.");
      return;
    }

    setLoading(true);
    try {
      await api.changePassword({ oldPassword, newPassword });
      setSuccess("Votre mot de passe a été modifié avec succès !");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setError(
        err.message ||
          "Impossible de modifier le mot de passe. Veuillez vérifier votre mot de passe actuel."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="settings-view-container" className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3.5">
        <button
          id="settings-back-btn"
          onClick={onBack}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Paramètres de Sécurité</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gérer vos identifiants d'accès</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-6">
        <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase">Protection du Compte</h3>
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed mt-0.5">Nous recommandons de modifier régulièrement votre mot de passe pour assurer la sécurité de vos fonds.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[11px] p-3 rounded-2xl font-bold flex gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-[11px] p-4 rounded-2xl text-center font-bold flex flex-col items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500 animate-bounce" />
            <span>🌟 {success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Old password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
              Mot de Passe Actuel
            </label>
            <input
              id="settings-old-password-input"
              type="password"
              required
              placeholder="Saisissez votre mot de passe actuel"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
              Nouveau Mot de Passe
            </label>
            <input
              id="settings-new-password-input"
              type="password"
              required
              placeholder="Saisissez au moins 4 caractères"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Confirm new password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
              Confirmer le Nouveau Mot de Passe
            </label>
            <input
              id="settings-confirm-password-input"
              type="password"
              required
              placeholder="Veuillez confirmer à nouveau"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Submit Action */}
          <button
            id="settings-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3.5 rounded-2xl transition-all cursor-pointer disabled:opacity-40 shadow-md shadow-blue-500/10 active:scale-98"
          >
            {loading ? "Mise à jour en cours..." : "Modifier le mot de passe de sécurité"}
          </button>
        </form>
      </div>
    </div>
  );
}
