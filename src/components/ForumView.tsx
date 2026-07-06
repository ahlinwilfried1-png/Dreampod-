/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Heart, Image as ImageIcon, PlusCircle, Trash, RefreshCw, Send, Check, Upload } from "lucide-react";
import { ForumPost, User } from "../types";
import { api } from "../lib/api";

interface ForumViewProps {
  user: User;
  onRefresh: () => void;
}

// Preset visual receipts to make it extremely easy to test or attach high-quality proofs!
const PRESET_RECEIPTS = [
  {
    name: "Moov Burkina Faso",
    url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=500&q=80",
    color: "from-blue-600 to-indigo-600",
  },
  {
    name: "MTN Bénin",
    url: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=500&q=80",
    color: "from-yellow-500 to-amber-600",
  },
  {
    name: "Orange Cameroun",
    url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=500&q=80",
    color: "from-orange-500 to-red-600",
  }
];

export default function ForumView({ user, onRefresh }: ForumViewProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submittingPost, setSubmittingPost] = useState<boolean>(false);
  
  // Post Creator State
  const [content, setContent] = useState<string>("");
  const [uploadedScreenshots, setUploadedScreenshots] = useState<string[]>([]); // up to 2 base64 strings or URLs
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPosts = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await api.getForumPosts();
      setPosts(response.posts || []);
    } catch (error: any) {
      console.error("Error loading forum posts:", error);
      setErrorMessage("Impossible de charger les publications du forum.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Handle local file selection and convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (uploadedScreenshots.length + files.length > 2) {
      alert("Vous ne pouvez publier que 2 captures d'écran maximum.");
      return;
    }

    Array.from(files).forEach((fileObj: any) => {
      const file = fileObj as File;
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Seuls les fichiers images sont autorisés.");
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setUploadedScreenshots((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const selectPresetScreenshot = (url: string) => {
    if (uploadedScreenshots.length >= 2) {
      alert("Vous ne pouvez ajouter que 2 captures d'écran au maximum.");
      return;
    }
    setUploadedScreenshots((prev) => [...prev, url]);
  };

  const removeScreenshot = (index: number) => {
    setUploadedScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Veuillez saisir un message de description.");
      return;
    }

    if (uploadedScreenshots.length === 0) {
      alert("Veuillez ajouter au moins une capture d'écran comme preuve de votre retrait.");
      return;
    }

    setSubmittingPost(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await api.createForumPost(content.trim(), uploadedScreenshots);
      setSuccessMessage(response.message || "Publication publiée avec succès !");
      setContent("");
      setUploadedScreenshots([]);
      loadPosts();
    } catch (error: any) {
      setErrorMessage(error.message || "Erreur lors de la création de la publication.");
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const response = await api.likeForumPost(postId);
      // Update in local state for instantaneous feedback
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: response.likes, likedBy: response.likedBy }
            : post
        )
      );
    } catch (error: any) {
      console.error("Error liking post:", error);
    }
  };

  // Helper to format date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Mask phone
  const maskPhone = (phone: string) => {
    if (phone.length < 7) return phone;
    return `${phone.substring(0, 4)}****${phone.substring(phone.length - 2)}`;
  };

  return (
    <div className="space-y-6 text-slate-800 select-none pb-20">
      
      {/* Title */}
      <div className="flex items-center justify-between py-1 relative">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">Forum de Discussion</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 font-bold">Partagez vos Preuves de Retrait</p>
          </div>
        </div>

        <button
          onClick={loadPosts}
          disabled={loading}
          className="p-2 rounded-xl bg-white text-slate-700 hover:text-slate-900 border border-slate-150 transition-colors shadow-xs cursor-pointer"
        >
          <RefreshCw className={`h-4.5 w-4.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Submitter Box */}
      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs">
        <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3.5 flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Publier votre Preuve de Retrait
        </h3>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] text-red-600 mb-3 font-semibold">
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-[11px] text-green-600 mb-3 animate-fade-in font-semibold">
            ✅ {successMessage}
          </div>
        )}

        <form onSubmit={handleCreatePost} className="space-y-4 font-semibold">
          {/* Content field */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Légende / Message descriptif :</label>
            <textarea
              required
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ex: Mon retrait de 50 000 F bien reçu ! Dreampod est le meilleur !"
              className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-500/50 focus:bg-white"
            />
          </div>

          {/* Preset attachment quick selectors */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Pièces Jointes (Max 2 captures) :</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 bg-blue-50 border border-blue-100 px-2 py-1 rounded cursor-pointer"
              >
                <Upload className="h-3 w-3" />
                Téléverser Image
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="hidden"
            />

            {/* Quick Presets row */}
            <div className="flex gap-2 py-1 overflow-x-auto no-scrollbar">
              {PRESET_RECEIPTS.map((rec) => (
                <button
                  key={rec.name}
                  type="button"
                  onClick={() => selectPresetScreenshot(rec.url)}
                  className="shrink-0 bg-slate-50 border border-slate-150 hover:border-emerald-500 px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold text-left text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${rec.color}`} />
                  <span>+ {rec.name}</span>
                </button>
              ))}
            </div>

            {/* Selected Screenshots preview row */}
            {uploadedScreenshots.length > 0 && (
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                {uploadedScreenshots.map((scr, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-900 group shadow-md">
                    <img
                      src={scr}
                      alt={`screenshot-${idx}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeScreenshot(idx)}
                        className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-500 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Trash className="h-4.5 w-4.5" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 right-1 text-[8px] font-black bg-emerald-900 text-emerald-100 px-1.5 py-0.5 rounded border border-emerald-500/35 uppercase">
                      Screenshot {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submittingPost}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/10 cursor-pointer"
          >
            {submittingPost ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Publication en cours...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Publier ma preuve (Forum)</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4 pt-1">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Publications Récentes</h3>

        {loading && posts.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-xs font-bold">Chargement du flux forum...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-slate-100 p-8 rounded-3xl text-center text-slate-400 font-bold text-xs">
            Aucune publication sur le forum pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const isLiked = post.likedBy?.includes(user.id);
              return (
                <div key={post.id} className="p-4 bg-white border border-slate-100 rounded-3xl space-y-3 shadow-xs">
                  
                  {/* Post header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black text-slate-800 block">{post.userName}</span>
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5 font-bold">📞 {maskPhone(post.userPhone)}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  {/* Post message */}
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    {post.content}
                  </p>

                  {/* Screenshots (Grid collé side-by-side!) */}
                  {post.screenshots && post.screenshots.length > 0 && (
                    <div className={`grid ${post.screenshots.length > 1 ? "grid-cols-2 gap-2" : "grid-cols-1"} bg-slate-50 p-1.5 border border-slate-100 rounded-2xl overflow-hidden`}>
                      {post.screenshots.map((url, i) => (
                        <div key={i} className="relative aspect-square sm:aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                          <img
                            src={url}
                            alt={`proof-${post.id}-${i}`}
                            className="w-full h-full object-cover select-none"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Post footer / Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-all duration-300 px-3 py-1.5 rounded-lg cursor-pointer ${
                        isLiked
                          ? "text-red-600 bg-red-50 border border-red-100"
                          : "text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-100"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-current text-red-600 animate-pulse" : ""}`} />
                      <span>{post.likes || 0} J'aime</span>
                    </button>

                    <div className="text-[9.5px] text-emerald-600 font-extrabold flex items-center gap-1 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Retrait Validé</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
