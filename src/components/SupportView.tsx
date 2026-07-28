/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Headphones,
  Send,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  CheckCheck,
  Paperclip,
  Trash2,
  ImageIcon
} from "lucide-react";
import {
  getConversationForUser,
  addSupportMessage,
  markAsRead,
  clearConversationForUser,
  subscribeChatUpdates
} from "../lib/chatStore";
import { getCurrencySymbol } from "../lib/currency";

interface SupportViewProps {
  onBack: () => void;
  userPhone?: string;
  initialMode?: "chat" | "channels";
}

const AUTO_REPLIES: { keywords: string[]; response: string }[] = [
  {
    keywords: ["dépôt", "depot", "recharge", "payer", "crédit", "argent"],
    response: "Pour vérifier votre dépôt, veuillez nous transmettre la référence de transaction SMS (ex: Mobile Money / T-Money / Airtel / Moov) ainsi que le montant. L'administrateur va valider votre compte !"
  },
  {
    keywords: ["retrait", "retirer", "virement", "moyen de retrait", "délai"],
    response: "Les retraits sont traités par nos agents financiers dans un délai garanti de 1 à 2 heures d'horloge. Assurez-vous d'avoir bien renseigné votre numéro Mobile Money dans votre profil."
  },
  {
    keywords: ["vip", "plan", "investir", "produit", "rendement", "gain"],
    response: "Chaque plan VIP vous rapporte un gain quotidien fixe cumulé automatiquement toutes les 24h. Vous pouvez cumuler vos bénéfices et demander un retrait dès que votre solde atteint le seuil minimum."
  },
  {
    keywords: ["parrainage", "inviter", "filleul", "niveau", "commission", "code"],
    response: "Notre programme de parrainage vous accorde 15% sur les achats de vos filleuls directs (N1), 2% au Niveau 2, et 1% au Niveau 3. Partagez votre lien depuis l'onglet Équipe !"
  },
  {
    keywords: ["bonjour", "salut", "hello", "bonsoir", "coucou"],
    response: "Bonjour ! Ravi de vous lire. Quel est l'objet de votre demande auprès de l'administration ?"
  }
];

export default function SupportView({ onBack, userPhone, initialMode = "chat" }: SupportViewProps) {
  const currency = getCurrencySymbol(userPhone);
  const [activeTab, setActiveTab] = useState<"channels" | "chat">(initialMode);
  const [conversation, setConversation] = useState(() => getConversationForUser());
  const [input, setInput] = useState("");
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with initialMode when prop changes
  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  // Load and subscribe to live chat updates
  useEffect(() => {
    const refresh = () => {
      const updated = getConversationForUser();
      setConversation(updated);
      markAsRead(updated.id, "user");
    };

    refresh();
    const unsubscribe = subscribeChatUpdates(refresh);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages, isAdminTyping]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text && !selectedImage) return;

    // Check if user has already sent any messages in this conversation
    const userMessageCount = conversation.messages.filter((m) => m.sender === "user").length;

    // Send user message
    addSupportMessage({
      conversationId: conversation.id,
      sender: "user",
      text,
      attachment: selectedImage || undefined
    });

    if (!textToSend) setInput("");
    setSelectedImage(null);

    // Simulated Auto-Reply from Admin system
    setIsAdminTyping(true);

    setTimeout(() => {
      setIsAdminTyping(false);
      let replyText = "";

      if (userMessageCount === 0) {
        // Official welcome message on first user message
        replyText = `🚀 LANCEMENT OFFICIEL 🌱💰\n\n🌍 Pays concernés\n🇧🇫 Burkina Faso\n🇨🇲 Cameroun \n🇹🇬 Togo\n🇧🇯 Bénin \n🇨🇮 Côte d'Ivoire \n━━━━━━━━━━━━━━━\n🎁 Avantages offerts\n\n🎉 Bonus d’inscription : 200 FCFA\n🎯 Bonus de pointage quotidien : 20 XAF \n\n━━━━━━━━━━━━━━━\n💰 Conditions financières\n\n📥 Dépôt minimum : 3 000 XAF\n💸 Retrait minimum : 1 000 XAF\n📊 Frais de retrait : 14%\n🕘 Heures de retrait : De 09h à 17h00\n━━━━━━━━━━━━━━━\n👥 Programme de parrainage\n🥇 Niveau 1 : 20 %\n🥈 Niveau 2 : 3 %\n🥉 Niveau 3 : 2 %\n\n🚀 Rejoignez`;
      } else {
        replyText = "Merci pour votre message. L'Administrateur a bien reçu votre demande et vous répondra très rapidement.";

        const lowerText = text.toLowerCase();
        for (const rule of AUTO_REPLIES) {
          if (rule.keywords.some((kw) => lowerText.includes(kw))) {
            replyText = rule.response;
            break;
          }
        }
      }

      addSupportMessage({
        conversationId: conversation.id,
        sender: "admin",
        senderName: "Administrateur Nutrien",
        text: replyText
      });
    }, 1200);
  };

  const clearChat = () => {
    clearConversationForUser(conversation.id);
    setConversation(getConversationForUser());
  };

  const handleQuickTopic = (topic: string) => {
    handleSend(topic);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setSelectedImage(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="support-view-container" className="space-y-3 text-slate-800 pb-8 select-none max-w-md mx-auto">
      {/* Header Bar */}
      <div className="py-2 px-1 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            id="support-back-btn"
            onClick={onBack}
            className="p-1.5 text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8.5 h-8.5 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
                {activeTab === "chat" ? <MessageSquare className="h-4.5 w-4.5" /> : <Headphones className="h-4.5 w-4.5" />}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  {activeTab === "chat" ? "Chat Support Nutrien" : "Service Client Nutrien"}
                </h2>
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Administrateur en ligne
              </p>
            </div>
          </div>
        </div>

        {activeTab === "chat" ? (
          <button
            onClick={clearChat}
            title="Effacer l'historique"
            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setActiveTab("chat")}
            className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 px-2.5 py-1 rounded-full"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Chat Direct
          </button>
        )}
      </div>

      {/* 1. CHAT SUPPORT VIEW (Pure Chat without channels/rules taking up space) */}
      {activeTab === "chat" && (
        <div className="flex flex-col h-[520px]">
          {/* Chat Messages Scroll Container */}
          <div className="flex-1 py-2 px-1 overflow-y-auto space-y-3 scrollbar-none">
            {/* Notice / Badge */}
            <div className="flex justify-center my-1">
              <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-blue-600" />
                Discussion sécurisée avec l'administration
              </span>
            </div>

            {conversation.messages.filter(m => !m.deletedForUser).map((msg) => {
              const isAdmin = msg.sender === "admin";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAdmin ? "items-start" : "items-end"}`}
                >
                  <div className="flex items-end gap-1.5 max-w-[88%]">
                    {isAdmin && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">
                        A
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed font-medium ${
                        isAdmin
                          ? "bg-slate-100 text-slate-800 rounded-bl-xs"
                          : "bg-blue-600 text-white rounded-br-xs"
                      }`}
                    >
                      {isAdmin && (
                        <span className="block text-[9px] font-bold uppercase text-blue-600 tracking-wider mb-1">
                          Administrateur
                        </span>
                      )}
                      
                      {msg.attachment && (
                        <div className="mb-2 rounded-xl overflow-hidden max-w-[200px]">
                          <img src={msg.attachment} alt="Pièce jointe" className="w-full h-auto object-cover" />
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      
                      <div className={`mt-1 text-[9px] flex items-center justify-end gap-1 ${isAdmin ? "text-slate-400" : "text-blue-100"}`}>
                        <span>{msg.time}</span>
                        {!isAdmin && <CheckCheck className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Admin typing indicator */}
            {isAdminTyping && (
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold pl-1">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                  A
                </div>
                <div className="bg-slate-100 rounded-2xl px-3 py-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick topic buttons */}
          <div className="py-2 overflow-x-auto flex gap-1.5 scrollbar-none">
            <button
              onClick={() => handleQuickTopic(`J'ai fait un dépôt de ${currency}. Voici ma référence : `)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[10px] font-bold rounded-full transition-colors whitespace-nowrap cursor-pointer flex-shrink-0"
            >
              💳 Soumettre un reçu
            </button>
            <button
              onClick={() => handleQuickTopic("Combien de temps prend la validation de mon retrait ?")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[10px] font-bold rounded-full transition-colors whitespace-nowrap cursor-pointer flex-shrink-0"
            >
              💸 Statut du retrait
            </button>
            <button
              onClick={() => handleQuickTopic("Comment activer un nouveau plan VIP Nutrien ?")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[10px] font-bold rounded-full transition-colors whitespace-nowrap cursor-pointer flex-shrink-0"
            >
              🌾 Aide Packs VIP
            </button>
          </div>

          {/* Attachment Preview */}
          {selectedImage && (
            <div className="px-3 py-1.5 bg-blue-50 rounded-xl flex items-center justify-between my-1">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-900 truncate max-w-[200px]">Image sélectionnée</span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
              >
                Annuler
              </button>
            </div>
          )}

          {/* Input Box - Smooth pill style */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Joindre un reçu de paiement"
              className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all cursor-pointer"
            >
              <Paperclip className="h-4.5 w-4.5" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Écrivez votre message..."
              className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 placeholder:text-slate-400"
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() && !selectedImage}
              className={`p-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                input.trim() || selectedImage
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. CANAUX OFFICELS & RÈGLES TAB */}
      {activeTab === "channels" && (
        <div className="space-y-4 pt-1">
          {/* TOP CHANNELS CARD */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider text-center text-emerald-800">
              📢 Canaux Officiels Nutrien
            </h3>

            {/* Telegram */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80 last:border-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center text-white shadow-xs flex-shrink-0">
                  <Send className="h-5 w-5 -ml-0.5 mt-0.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Chaîne de télégramme
                </span>
              </div>
              <a
                id="support-telegram-btn"
                href="https://t.me/+nlAW_0vhdfI2Yzdk"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer uppercase shadow-xs flex items-center gap-1"
              >
                Rejoindre
              </a>
            </div>

            {/* WhatsApp Service */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80 last:border-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-xs flex-shrink-0">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  WhatsApp Service
                </span>
              </div>
              <a
                id="support-whatsapp-service-btn"
                href="https://wa.me/22890000000?text=Bonjour%20Service%20Client%20Nutrien!"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#ff0000] hover:bg-[#e00000] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer uppercase"
              >
                Rejoindre
              </a>
            </div>

            {/* WhatsApp Channel */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-xs flex-shrink-0">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  chaîne WhatsApp
                </span>
              </div>
              <a
                id="support-whatsapp-channel-btn"
                href="https://whatsapp.com/channel/0029Vb7WkWR6rsQuNY2r5i0A"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#ff6600] hover:bg-[#e65c00] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer uppercase"
              >
                Rejoindre
              </a>
            </div>
          </div>

          {/* RÈGLES DU CLIENT CARD */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4">
            <div className="relative flex items-center justify-center my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/70" />
              </div>
              <span className="relative bg-white px-4 text-xs font-bold text-slate-700 tracking-tight">
                Règles du client
              </span>
            </div>

            <div className="space-y-3.5 pt-1 text-slate-800 text-xs font-medium leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-sky-100 text-sky-800 text-xs font-black flex-shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  <strong className="font-bold text-slate-900">Horaires du service :</strong> de 9h30 à 21h30 tous les jours. Nous sommes là pour vous aider à tout moment.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-sky-100 text-sky-800 text-xs font-black flex-shrink-0 mt-0.5">
                  2
                </span>
                <div className="space-y-1">
                  <p>
                    Pour toute question concernant notre plateforme, veuillez contacter notre service client en ligne.
                  </p>
                  <p className="text-slate-500 font-normal text-xs">
                    Si notre service client en ligne ne répond pas immédiatement à votre message, veuillez patienter.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-sky-100 text-sky-800 text-xs font-black flex-shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  <strong className="font-bold text-slate-900">Problèmes de dépôt :</strong> si votre dépôt n'apparaît pas sur votre compte, veuillez envoyer le reçu de paiement au service client dès que possible. Quel que soit le problème, nous le résoudrons pour vous.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
