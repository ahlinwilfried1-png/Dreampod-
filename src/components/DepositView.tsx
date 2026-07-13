/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Wallet, ArrowLeft, CheckCircle, Info, Upload, Copy, Check, ShieldCheck, Image as ImageIcon } from "lucide-react";
import { User } from "../types";
import { api } from "../lib/api";

interface DepositViewProps {
  user: User;
  onRefresh: () => void;
  onBack: () => void;
}

const PAYMENT_METHODS = [
  { id: "airtel", name: "Airtel Money 🔴", countries: "Niger, Gabon, Tchad", number: "+227 99 88 77 66", simOwnerName: "DREAM SERVICES AIRTEL" },
  { id: "moov", name: "Moov Money (Flooz) 🟢", countries: "Niger, Gabon, Tchad, Togo", number: "+227 90 44 55 66", simOwnerName: "DREAM SERVICES MOOV" },
  { id: "orange", name: "Orange Money 🟠", countries: "Niger", number: "+227 96 11 22 33", simOwnerName: "DREAM SERVICES ORANGE" },
  { id: "tmoney", name: "TMoney 🟡", countries: "Togo", number: "+228 90 12 34 56", simOwnerName: "DREAM SERVICES TOGO" },
  { id: "amana", name: "Amana Transfert 🟣", countries: "Niger", number: "+227 92 11 22 33", simOwnerName: "DREAM SERVICES AMANA" },
  { id: "nita", name: "Nita Transfert 🟤", countries: "Niger", number: "+227 93 11 22 33", simOwnerName: "DREAM SERVICES NITA" },
];

const PRESETS = ["1000", "5000", "10000", "25000", "50000", "100000"];

export default function DepositView({ user, onRefresh, onBack }: DepositViewProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [depositAmount, setDepositAmount] = useState("5000");
  const [depositMethod, setDepositMethod] = useState("");
  const [channels, setChannels] = useState<any[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  
  // Step 2 Fields
  const [simOwnerName, setSimOwnerName] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [depositTransactionId, setDepositTransactionId] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoadingChannels(true);
    api.getPaymentChannels()
      .then(res => {
        if (res.channels) {
          const activeChannels = res.channels.filter((c: any) => c.active);
          setChannels(activeChannels);
          if (activeChannels.length > 0) {
            setDepositMethod(activeChannels[0].id);
          }
        }
      })
      .catch(err => {
        console.error("Error loading channels:", err);
        // Fallback in case of absolute API failure
        const activeFallback = PAYMENT_METHODS;
        setChannels(activeFallback);
        if (activeFallback.length > 0) {
          setDepositMethod(activeFallback[0].id);
        }
      })
      .finally(() => {
        setIsLoadingChannels(false);
      });
  }, []);

  const selectedMethodObj = channels.find((p) => p.id === depositMethod) || channels[0];

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(selectedMethodObj.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La capture d'écran est trop lourde (maximum 5 Mo).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La capture d'écran est trop lourde (maximum 5 Mo).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const val = Number(depositAmount);
    if (!val || val < 1000) {
      setError("Le montant minimum d'un dépôt est de 1 000 FCFA.");
      return;
    }

    setStep(2);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!simOwnerName.trim()) {
      setError("Veuillez saisir le Nom d'identification de votre carte SIM.");
      return;
    }

    if (!depositTransactionId.trim()) {
      setError("Veuillez renseigner l'ID ou Référence de votre transaction.");
      return;
    }

    setLoading(true);
    const val = Number(depositAmount);

    try {
      const response = await api.deposit(val, selectedMethodObj.name, {
        simOwnerName: simOwnerName.trim(),
        receiverNumber: selectedMethodObj.number,
        screenshot: screenshot || undefined,
        txRefId: depositTransactionId.trim(),
      });

      setSuccess(response.message || "Votre demande de dépôt a été transmise avec succès !");
      
      // Reset inputs
      setSimOwnerName("");
      setScreenshot(null);
      setDepositTransactionId("");
      setStep(1);
      
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la soumission de votre dépôt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="deposit-view-container" className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3.5">
        <button
          id="deposit-back-btn"
          onClick={step === 2 ? () => setStep(1) : onBack}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            {step === 1 ? "Faire un Dépôt" : "Validation du Dépôt"}
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            {step === 1 ? "Étape 1 : Informations de Recharge" : "Étape 2 : Confirmation de Transfert"}
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-6">
        
        {/* Step Indicator */}
        <div className="flex gap-2">
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step === 1 ? "bg-blue-600" : "bg-blue-200"}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step === 2 ? "bg-blue-600" : "bg-blue-200"}`} />
        </div>

        {step === 1 && (
          <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
            <Wallet className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Votre Solde Actuel</p>
              <h3 className="text-xl font-black text-slate-900 font-mono">
                {user.balance.toLocaleString()} <span className="text-xs font-normal text-slate-500">FCFA</span>
              </h3>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[11px] p-3 rounded-2xl font-bold flex gap-2 animate-pulse">
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

        {/* STEP 1: CONFIGURATION OF DEPOSIT */}
        {step === 1 && (
          isLoadingChannels ? (
            <div className="py-12 text-center space-y-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600"></div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Chargement des moyens de paiement sécurisés...</p>
            </div>
          ) : channels.length === 0 ? (
            <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-3xl text-center space-y-3">
              <div className="text-2xl">⚠️</div>
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">Aucun moyen de paiement configuré</h4>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
                L'administration n'a configuré aucun canal de dépôt actif pour le moment. Veuillez patienter ou contacter le support.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContinue} className="space-y-5">
              {/* Amount input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  Montant à recharger (FCFA)
                </label>
                <input
                  id="deposit-amount-input"
                  type="number"
                  required
                  min="1000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-black font-mono transition-all"
                />
                <span className="text-[10px] text-slate-400 font-medium block px-1">
                  Dépôt minimum obligatoire : 1 000 FCFA
                </span>
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    id={`preset-deposit-${preset}`}
                    key={preset}
                    type="button"
                    onClick={() => setDepositAmount(preset)}
                    className={`text-[10px] font-extrabold py-2.5 px-3 border rounded-xl transition-all cursor-pointer ${
                      depositAmount === preset
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {Number(preset).toLocaleString()} F
                  </button>
                ))}
              </div>

              {/* Payment Method select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  Sélectionner Moyen de Dépôt
                </label>
                <select
                  id="deposit-method-select"
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                >
                  {channels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.countries})
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit step 1 button -> Continue */}
              <button
                id="deposit-submit-btn"
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3.5 rounded-2xl transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-98 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>Continuer</span>
              </button>
            </form>
          )
        )}

        {/* STEP 2: DETAILS VALIDATION SCREEN */}
        {step === 2 && (
          <form onSubmit={handleSubmitDeposit} className="space-y-5">
            
            {/* Amount Summary Indicator */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Montant sélectionné</p>
                <p className="text-base font-black text-slate-900 font-mono">{Number(depositAmount).toLocaleString()} FCFA</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Moyen de paiement</p>
                <p className="text-xs font-bold text-slate-800">
                  {selectedMethodObj.name} {selectedMethodObj.operator && <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-black uppercase ml-1">{selectedMethodObj.operator}</span>}
                </p>
              </div>
            </div>

            {/* Dynamic Custom Channel Instructions */}
            {selectedMethodObj.instructions && (
              <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-2xl space-y-1">
                <p className="text-[9px] text-indigo-700 font-black uppercase tracking-wider flex items-center gap-1">
                  <span className="p-0.5 bg-indigo-100 text-indigo-800 rounded">💡</span> Instructions importantes :
                </p>
                <p className="text-[11px] text-slate-700 font-bold leading-relaxed">
                  {selectedMethodObj.instructions}
                </p>
              </div>
            )}

            {/* Nom de l'identification de la carte SIM */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex justify-between">
                <span>Nom de l'identification de la carte SIM</span>
                <span className="text-red-500 font-extrabold text-[12px]">*</span>
              </label>
              <input
                id="deposit-sim-name-input"
                type="text"
                required
                placeholder="Ex: Jean Dupont"
                value={simOwnerName}
                onChange={(e) => setSimOwnerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-all placeholder-slate-400"
              />
              <span className="text-[9px] text-slate-400 font-semibold block px-1">
                Le nom d'enregistrement légal de la puce SIM ayant envoyé les fonds.
              </span>
            </div>

            {/* Numéro du receveur */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                Numéro du Receveur officiel
              </label>
              <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-2xl">
                <div className="space-y-0.5">
                  <p className="text-[9px] text-emerald-600 font-black uppercase tracking-wider">Envoyer votre transfert vers :</p>
                  <p className="text-sm font-black text-slate-900 font-mono tracking-wide">{selectedMethodObj.number}</p>
                  {selectedMethodObj.simOwnerName && (
                    <p className="text-[10px] text-slate-500 font-bold mt-1">
                      Nom d'identité SIM : <span className="text-emerald-700 font-black">{selectedMethodObj.simOwnerName}</span>
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="p-2.5 bg-white border border-emerald-200 rounded-xl text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-[9px] font-black uppercase">Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black uppercase">Copier</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Capture d'écran */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                Capture d'écran (Reçu de la transaction)
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  screenshot 
                    ? "border-emerald-400 bg-emerald-50/20" 
                    : "border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-slate-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {screenshot ? (
                  <div className="space-y-2">
                    <img 
                      src={screenshot} 
                      alt="Capture de transfert" 
                      className="max-h-24 mx-auto rounded-lg object-contain border border-slate-200 shadow-2xs"
                    />
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">Capture d'écran chargée ✓</p>
                    <p className="text-[9px] text-slate-400 font-bold">Cliquez ou déposez un nouveau fichier pour remplacer</p>
                  </div>
                ) : (
                  <>
                    <div className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-full shadow-2xs">
                      <Upload className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10.5px] font-extrabold text-slate-700">Cliquez pour importer la capture d'écran</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Glissez-déposez l'image ici (Max: 5Mo)</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ID de transaction */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex justify-between">
                <span>ID de Transaction unique (ID / Réf)</span>
                <span className="text-red-500 font-extrabold text-[12px]">*</span>
              </label>
              <input
                id="deposit-txid-input"
                type="text"
                required
                placeholder="Ex: TXN_781920392 ou Réf: 28392102"
                value={depositTransactionId}
                onChange={(e) => setDepositTransactionId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-mono placeholder-slate-400 transition-all"
              />
              <p className="text-[9px] text-slate-400 font-bold px-1">
                L'identifiant unique présent dans votre SMS de confirmation ou reçu de paiement.
              </p>
            </div>

            {/* Submit & Back Action Row */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                id="deposit-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3.5 rounded-2xl transition-all cursor-pointer disabled:opacity-40 shadow-md shadow-emerald-500/10 active:scale-98 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Soumettre dépôt</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs py-3 rounded-2xl transition-all cursor-pointer text-center uppercase tracking-wider"
              >
                Retour
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
