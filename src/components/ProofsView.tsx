/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Upload, 
  Camera, 
  X, 
  CheckCircle2, 
  Image as ImageIcon,
  Coins,
  ShieldCheck,
  Plus
} from "lucide-react";
import { UserReview } from "../types";
import { api } from "../lib/api";
import { getCurrencySymbol } from "../lib/currency";

interface ProofsViewProps {
  onBack: () => void;
  userPhone?: string;
}

export default function ProofsView({ onBack, userPhone }: ProofsViewProps) {
  const currency = getCurrencySymbol(userPhone);
  const [proofs, setProofs] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form states for uploading a new proof
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const OFFICIAL_CERTIFICATE_IMAGE = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=90";

  const loadProofs = async (showLoadingState = true) => {
    if (showLoadingState) setLoading(true);
    try {
      const res = await api.getReviews();
      setProofs(res.reviews || []);
    } catch (err) {
      console.warn("Erreur chargement des preuves:", err);
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  useEffect(() => {
    loadProofs(true);

    const handleRealtimeUpdate = () => {
      loadProofs(false);
    };

    window.addEventListener("nutrien_realtime_update", handleRealtimeUpdate);

    // Poll every 8 seconds as safety fallback
    const interval = setInterval(() => {
      loadProofs(false);
    }, 8000);

    return () => {
      window.removeEventListener("nutrien_realtime_update", handleRealtimeUpdate);
      clearInterval(interval);
    };
  }, []);

  const compressAndSetImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1400;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setImage(compressedDataUrl);
          setErrorMessage("");
        } else {
          setImage(event.target?.result as string);
        }
      };
      img.onerror = () => {
        setImage(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("L'image est trop volumineuse (max 10Mo).");
        return;
      }
      compressAndSetImage(file);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage("Veuillez indiquer un montant de retrait valide.");
      return;
    }
    if (!image) {
      setErrorMessage("Veuillez joindre la capture d'écran du reçu SMS / Mobile Money.");
      return;
    }

    setSubmitting(true);
    try {
      const formattedComment = note ? note.trim() : "Retrait bien reçu avec succès !";
      await api.submitReview({
        rating: 5,
        comment: formattedComment,
        image: image,
      });

      setSubmitting(false);
      setSubmitSuccess(true);
      loadProofs();
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowUploadForm(false);
        setAmount("");
        setNote("");
        setImage(null);
      }, 1500);
    } catch (err: any) {
      setSubmitting(false);
      setErrorMessage(err.message || "Impossible d'envoyer la preuve. Veuillez réessayer.");
    }
  };

  // Helper function to format phone number to match the user's screenshot e.g. +23768****777
  const formatPhone = (phone: string) => {
    if (!phone) return "+22960****000";
    const cleaned = phone.replace(/\s+/g, "");
    if (cleaned.length > 6) {
      const prefix = cleaned.startsWith("+") ? cleaned.slice(0, 6) : `+${cleaned.slice(0, 5)}`;
      const suffix = cleaned.slice(-3);
      return `${prefix}****${suffix}`;
    }
    return cleaned;
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-12 select-none">
      
      {/* 1. TOP HEADER BAR */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-2xs">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1.5 text-slate-800 hover:text-slate-600 cursor-pointer rounded-full active:bg-slate-100 transition-colors"
          title="Retour"
        >
          <ArrowLeft className="h-6 w-6 stroke-[2.5]" />
        </button>
        <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          Téléchargement des Preuves
        </h1>
        <div className="w-6" /> {/* Spacer for symmetry */}
      </div>

      <div className="p-3 sm:p-4 space-y-4 max-w-lg mx-auto">
        
        {/* 2. HERO BANNER WITH REWARD PROMPT */}
        <div className="relative bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 border border-amber-200 rounded-3xl p-4 sm:p-5 overflow-hidden shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-2 z-10 max-w-[65%]">
            <h2 className="text-xs sm:text-sm font-black uppercase text-slate-900 leading-snug tracking-tight">
              TÉLÉCHARGEZ VOTRE CERTIFICAT DE RETRAIT POUR OBTENIR DES RÉCOMPENSES EN ESPÈCES
            </h2>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-xs cursor-pointer transition-transform active:scale-95"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{showUploadForm ? "Fermer le formulaire" : "Télécharger mon certificat"}</span>
            </button>
          </div>

          {/* Money Bag Graphic / Icon on the right */}
          <div className="relative shrink-0 flex items-center justify-center pr-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-300 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 border-2 border-white">
              <Coins className="h-12 w-12 text-white drop-shadow-md" />
            </div>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white uppercase">
              Bonus
            </span>
          </div>
        </div>

        {/* 3. UPLOAD FORM (EXPANDABLE) */}
        {showUploadForm && (
          <div className="bg-white p-4 rounded-3xl border border-orange-200 shadow-md space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                <Upload className="h-4 w-4 text-orange-500" />
                Publier un certificat de retrait
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-800 text-center space-y-1">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-black">Certificat Publié avec Succès !</p>
                <p className="text-[11px] text-emerald-700">Votre certificat de retrait est désormais disponible et visible immédiatement sur le compte de tout le monde.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitProof} className="space-y-3 text-left">
                {errorMessage && (
                  <div className="p-2.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-200">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-700 block mb-1">
                    Montant du Retrait Reçu ({currency}) *
                  </label>
                  <input
                    type="number"
                    placeholder="ex: 50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-700 block mb-1">
                    Capture / Image du Certificat ou Reçu Mobile Money *
                  </label>
                  {image ? (
                    <div className="relative rounded-xl overflow-hidden max-h-40 bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <img src={image} alt="Certificat" className="object-contain max-h-40 w-full" />
                      <button
                        type="button"
                        onClick={() => setImage(null)}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center rounded-xl p-4 border border-dashed border-orange-300 bg-orange-50/30 hover:bg-orange-50/80 cursor-pointer transition-all text-center">
                      <Camera className="h-6 w-6 text-orange-500 mb-1" />
                      <span className="text-[11px] font-black text-slate-800">
                        Cliquez pour importer le certificat ou la capture
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">JPG, PNG (Max 5Mo)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-700 block mb-1">
                    Témoignage (Optionnel)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="ex: Je confirme avoir reçu mon paiement, merci ❤️"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <span>Envoi en cours...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Publier mon certificat & Obtenir ma récompense</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* SECTION HEADER */}
        <div className="pt-2 flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            Téléchargement des preuves par l'utilisateur
          </h2>
        </div>

        {/* 6. PROOFS LIST */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-bold animate-pulse bg-white rounded-2xl border border-slate-200">
            Chargement des certificats...
          </div>
        ) : proofs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-2">
            <p className="text-xs font-extrabold text-slate-700">Aucun certificat disponible pour le moment.</p>
            <p className="text-[11px] text-slate-400">
              Soyez le premier à publier votre certificat de retrait ci-dessus !
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {proofs.map((item) => {
              // Extract phone & format e.g. +23768****777
              const formattedPhone = formatPhone(item.userPhone);
              
              // Extract amount from comment if available or default
              let displayAmount = "+1,000";
              const amountMatch = item.comment.match(/(\d[\d\s,.]*)\s*(FCFA|XAF|XOF)/i);
              if (amountMatch) {
                displayAmount = `+${parseFloat(amountMatch[1].replace(/\s/g, "")).toLocaleString()}`;
              } else if (item.comment.includes("+")) {
                const plusMatch = item.comment.match(/\+[\d,]+/);
                if (plusMatch) displayAmount = plusMatch[0];
              }

              // Clean comment text by removing brackets tag if present
              const cleanComment = item.comment.replace(/^\[PREUVE DE RETRAIT - [^\]]+\]\s*/i, "").trim();

              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl border border-slate-300 p-3 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-400 transition-colors"
                >
                  {/* Left Column Text Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                        {formattedPhone}
                      </span>
                      <span className="text-sm font-extrabold text-red-500">
                        {displayAmount}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-400">
                      {new Date(item.createdAt).toISOString().split("T")[0]}
                    </p>

                    <p className="text-xs font-semibold text-slate-800 leading-snug break-words">
                      {cleanComment || "Merci veko"}
                    </p>
                  </div>

                  {/* Right Column Image Thumbnail (Clickable for full screen lightbox) */}
                  <div 
                    onClick={() => item.image && setPreviewImage(item.image)}
                    className={`w-20 h-16 sm:w-24 sm:h-20 rounded-xl border border-slate-300 overflow-hidden flex items-center justify-center bg-slate-50 shrink-0 relative group ${item.image ? 'cursor-pointer hover:border-orange-500 hover:shadow-md' : ''}`}
                    title={item.image ? "Cliquer pour agrandir l'image" : undefined}
                  >
                    {item.image ? (
                      <>
                        <img 
                          src={item.image} 
                          alt="Preuve de retrait" 
                          className="w-full h-full object-cover pointer-events-none select-none group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-slate-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">🔍 Voir</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <ImageIcon className="h-7 w-7 stroke-[1.5]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* FULL-SCREEN IMAGE LIGHTBOX PREVIEW MODAL */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl w-full max-h-[88vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-11 right-0 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg"
              title="Fermer"
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={previewImage} 
              alt="Certificat / Preuve en grand" 
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            <div className="mt-3 text-center">
              <span className="text-white/80 text-xs font-bold bg-black/60 px-4 py-1.5 rounded-full border border-white/10">
                🔍 Document Officiel / Preuve de Retrait
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
