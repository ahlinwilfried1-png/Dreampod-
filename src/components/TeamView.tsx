/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Copy, 
  Check, 
  Users, 
  Trophy, 
  Award, 
  HelpCircle, 
  Facebook, 
  Instagram, 
  Twitter, 
  Send, 
  MessageCircle,
  Share2
} from "lucide-react";
import { User, Transaction, TeamMember } from "../types";
import { getCurrencySymbol } from "../lib/currency";

interface TeamViewProps {
  user: User;
  transactions: Transaction[];
  team: TeamMember[];
}

export default function TeamView({ user, transactions = [], team = [] }: TeamViewProps) {
  const [copied, setCopied] = useState(false);
  const [instaCopied, setInstaCopied] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<"all" | 1 | 2 | 3>("all");

  // Compute invite link safely
  const inviteLink = `${window?.location?.origin || ""}?ref=${user?.referralCode || ""}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Pre-formatted promotional text
  const shareText = `Gagnez de l'argent quotidiennement avec Nutrien ! 🚀 Machines VIP performantes, retraits ultra-rapides et fiables. Rejoignez mon équipe maintenant : ${inviteLink}`;
  const shareTextEncoded = encodeURIComponent(shareText);
  const inviteLinkEncoded = encodeURIComponent(inviteLink);

  const shareUrls = {
    whatsapp: `https://api.whatsapp.com/send?text=${shareTextEncoded}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareTextEncoded}`,
    telegram: `https://t.me/share/url?url=${inviteLinkEncoded}&text=${shareTextEncoded}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${inviteLinkEncoded}`,
  };

  const handleInstagramShare = () => {
    navigator.clipboard.writeText(shareText);
    setInstaCopied(true);
    setTimeout(() => setInstaCopied(false), 3000);
  };

  // Helper to safely display obscured phones
  const obfuscatePhone = (phone: string) => {
    if (!phone) return "";
    const cleanPhone = phone.trim();
    if (cleanPhone.length <= 5) return cleanPhone;
    return `${cleanPhone.substring(0, 3)}•••${cleanPhone.substring(cleanPhone.length - 2)}`;
  };

  // Extract commission transactions safely
  const commissionLogs = (transactions || []).filter(t => t && t.type === "commission");

  // Filter team members by level safely
  const filteredTeam = (team || []).filter(member => {
    if (!member) return false;
    if (selectedLevel === "all") return true;
    return member.level === selectedLevel;
  });

  return (
    <div className="space-y-6 text-slate-800 select-none pb-4">
      
      {/* Intro Header */}
      <div className="py-2 border-b border-slate-200/60 pb-4">
        <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
          <Trophy className="text-blue-600 h-5 w-5" />
          Réseau & Commissions d'Affiliation
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed font-medium">
          Percevez des commissions directes sur 3 niveaux d’affiliation à chaque rechargement et souscription de votre réseau.
        </p>
      </div>

      {/* Referrals Total Summary - Direct Stats Row */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200/60">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-blue-100/60 text-blue-600">
            <Users className="h-5 w-5 stroke-[1.8]" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Membres Parrainés</p>
            <h3 id="referrals-total-count" className="text-base font-black text-slate-900">{user?.referralsCount || 0} membres</h3>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Commissions Cumulées</p>
          <h3 className="text-base font-black text-emerald-600">{(user?.commissionEarned || 0).toLocaleString()} <span className="text-xs">{getCurrencySymbol(user?.phone)}</span></h3>
        </div>
      </div>

      {/* Invite Code & Link Section */}
      <div className="space-y-3 py-2 border-b border-slate-200/60">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
          <Award className="h-4 w-4 text-blue-600" />
          Lien de parrainage officiel
        </h3>

        <div className="flex bg-slate-100/80 rounded-xl p-2 items-center justify-between gap-2 border border-slate-200/60">
          <span className="text-[11px] font-mono select-all text-slate-700 break-all truncate pl-1">{inviteLink}</span>
          
          <button
            id="btn-copy-invite-link"
            onClick={handleCopyLink}
            className={`cursor-pointer min-w-[76px] py-1.5 px-3 rounded-lg text-[10px] font-extrabold tracking-wide uppercase transition-all duration-300 flex items-center justify-center space-x-1.5 shrink-0 ${
              copied 
                ? "bg-emerald-600 text-white" 
                : "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copié</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>

        {/* Brand Sharing Buttons */}
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">Partager directement :</p>
        <div className="grid grid-cols-5 gap-2">
          {/* WhatsApp */}
          <a
            href={shareUrls.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] active:scale-95 transition-all duration-200"
          >
            <MessageCircle className="h-4.5 w-4.5 fill-white" />
            <span className="text-[9px] font-extrabold mt-1">WhatsApp</span>
          </a>

          {/* Twitter / X */}
          <a
            href={shareUrls.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#1DA1F2] text-white hover:bg-[#1a91da] active:scale-95 transition-all duration-200"
          >
            <Twitter className="h-4.5 w-4.5 fill-white" />
            <span className="text-[9px] font-extrabold mt-1">Twitter</span>
          </a>

          {/* Telegram */}
          <a
            href={shareUrls.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#0088cc] text-white hover:bg-[#0077b3] active:scale-95 transition-all duration-200"
          >
            <Send className="h-4.5 w-4.5" />
            <span className="text-[9px] font-extrabold mt-1">Telegram</span>
          </a>

          {/* Facebook */}
          <a
            href={shareUrls.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#1877F2] text-white hover:bg-[#166fe5] active:scale-95 transition-all duration-200"
          >
            <Facebook className="h-4.5 w-4.5 fill-white" />
            <span className="text-[9px] font-extrabold mt-1">Facebook</span>
          </a>

          {/* Instagram */}
          <button
            onClick={handleInstagramShare}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Instagram className="h-4.5 w-4.5" />
            <span className="text-[9px] font-extrabold mt-1 truncate max-w-full">{instaCopied ? "Copié" : "Instagram"}</span>
          </button>
        </div>
      </div>

      {/* Three Commission Levels */}
      <div className="py-2 border-b border-slate-200/60 space-y-2">
        <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase">Structure de l'Équipe</h3>
        <div className="grid grid-cols-3 gap-2 text-center py-1">
          {/* L1 */}
          <div className="py-2 px-1">
            <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded uppercase border border-emerald-200/50">Niveau 1 (20%)</span>
            <span className="text-xl font-black text-slate-900 mt-1.5 block">{user?.referralsN1 || 0}</span>
            <span className="text-[9px] text-slate-500 font-semibold block">Filleuls directs</span>
          </div>

          {/* L2 */}
          <div className="py-2 px-1 border-x border-slate-200/60">
            <span className="text-[10px] text-cyan-600 font-extrabold bg-cyan-50 px-2 py-0.5 rounded uppercase">Niveau 2 (2%)</span>
            <span className="text-xl font-black text-slate-900 mt-1.5 block">{user?.referralsN2 || 0}</span>
            <span className="text-[9px] text-slate-500 font-semibold block">Filleuls de N1</span>
          </div>

          {/* L3 */}
          <div className="py-2 px-1">
            <span className="text-[10px] text-amber-600 font-extrabold bg-amber-50 px-2 py-0.5 rounded uppercase">Niveau 3 (1%)</span>
            <span className="text-xl font-black text-slate-900 mt-1.5 block">{user?.referralsN3 || 0}</span>
            <span className="text-[9px] text-slate-500 font-semibold block">Filleuls de N2</span>
          </div>
        </div>
      </div>

      {/* Guide explaining affiliation program */}
      <div className="py-2 border-b border-slate-200/60 flex items-start space-x-3 text-xs leading-relaxed">
        <HelpCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-black text-slate-900">Comment fonctionnent les commissions ?</p>
          <p className="text-slate-600 text-[11px]">
            Chaque fois qu'un utilisateur s'inscrit via votre lien, il rejoint votre équipe. S'il investit dans une machine :
          </p>
          <ul className="list-disc pl-4 text-slate-600 text-[10.5px] space-y-0.5 leading-relaxed font-semibold">
            <li>S'il s'agit de votre <span className="text-blue-600 font-bold">N1 direct</span>, vous recevez instantanément <span className="text-emerald-600 font-extrabold">20%</span> du prix de son plan.</li>
            <li>S'il s'agit d'un filleul <span className="text-cyan-600 font-bold">N2 d'équipe</span>, vous recevez instantanément <span className="text-emerald-600 font-extrabold">2%</span>.</li>
            <li>S'il s'agit d'un filleul <span className="text-amber-600 font-bold">N3 d'équipe</span>, vous recevez instantanément <span className="text-emerald-600 font-extrabold">1%</span>.</li>
          </ul>
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-3 py-2 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase">Membres de votre équipe ({team.length})</h3>
          
          {/* Level Filters */}
          <div className="flex bg-slate-200/70 rounded-lg p-0.5 text-[9px] font-extrabold uppercase">
            <button
              onClick={() => setSelectedLevel("all")}
              className={`px-2 py-0.5 rounded-md transition-all duration-200 cursor-pointer ${selectedLevel === "all" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedLevel(1)}
              className={`px-2 py-0.5 rounded-md transition-all duration-200 cursor-pointer ${selectedLevel === 1 ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
            >
              N1
            </button>
            <button
              onClick={() => setSelectedLevel(2)}
              className={`px-2 py-0.5 rounded-md transition-all duration-200 cursor-pointer ${selectedLevel === 2 ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
            >
              N2
            </button>
            <button
              onClick={() => setSelectedLevel(3)}
              className={`px-2 py-0.5 rounded-md transition-all duration-200 cursor-pointer ${selectedLevel === 3 ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
            >
              N3
            </button>
          </div>
        </div>

        {filteredTeam.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400 font-bold">
            {selectedLevel === "all" 
              ? "Aucun membre inscrit sous votre lien pour le moment." 
              : `Aucun membre enregistré au Niveau ${selectedLevel} pour le moment.`}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTeam.map((member) => (
              <div key={member.id} className="py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-wider shrink-0 ${
                    member.level === 1 
                      ? "bg-blue-100 text-blue-700" 
                      : member.level === 2 
                        ? "bg-cyan-100 text-cyan-700" 
                        : "bg-amber-100 text-amber-700"
                  }`}>
                    N{member.level || 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[130px]">{member.name || "Utilisateur"}</p>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">({obfuscatePhone(member.phone || "")})</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                      Inscrit le {member.registeredAt ? new Date(member.registeredAt).toLocaleDateString() : "Date inconnue"}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-black ${(member.totalInvested || 0) > 0 ? "text-emerald-600" : "text-slate-500"}`}>
                    {(member.totalInvested || 0).toLocaleString()} F
                  </span>
                  <p className="text-[8.5px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">Montant Investi</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referral Commission history log */}
      <div className="space-y-3 py-2">
        <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase">Historique des commissions</h3>
        
        {commissionLogs.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400 font-bold">
            Aucune commission parrainage reçue pour le moment.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {commissionLogs.map((log) => (
              <div key={log.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-800">{log.method || "Commission d'affiliation"}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                    {log.date ? new Date(log.date).toLocaleString() : ""}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600">+{(log.amount || 0).toLocaleString()} F</span>
                  <p className="text-[9.5px] text-slate-400 font-mono font-bold mt-0.5">FIL_REWARD</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
