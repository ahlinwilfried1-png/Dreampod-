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

interface TeamViewProps {
  user: User;
  transactions: Transaction[];
  team: TeamMember[];
}

export default function TeamView({ user, transactions, team = [] }: TeamViewProps) {
  const [copied, setCopied] = useState(false);
  const [instaCopied, setInstaCopied] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<"all" | 1 | 2 | 3>("all");

  // Compute invite link
  const inviteLink = `${window.location.origin}?ref=${user.referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Pre-formatted promotional text
  const shareText = `Gagnez de l'argent quotidiennement avec Dreampod ! 🚀 Machines VIP performantes, retraits ultra-rapides et fiables. Rejoignez mon équipe maintenant : ${inviteLink}`;
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
    if (phone.length <= 5) return phone;
    return `${phone.substring(0, 3)}•••${phone.substring(phone.length - 2)}`;
  };

  // Extract commission transactions
  const commissionLogs = transactions.filter(t => t.type === "commission");

  // Filter team members by level
  const filteredTeam = team.filter(member => {
    if (selectedLevel === "all") return true;
    return member.level === selectedLevel;
  });

  return (
    <div className="space-y-6 pb-28 text-slate-800 select-none">
      
      {/* Intro Header */}
      <div className="text-center py-2 relative">
        <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center justify-center gap-2">
          <Trophy className="text-blue-600 h-5 w-5" />
          Filleuls & Récompenses d'Équipe
        </h2>
        <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Gagnez des commissions instantanées sur 3 niveaux d’affiliation à chaque fois que vos filleuls rechargent leur compte et investissent.
        </p>
      </div>

      {/* Referrals Total Summary Box */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
            <Users className="h-6 w-6 stroke-[1.8]" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Filleuls Invités</p>
            <h3 id="referrals-total-count" className="text-base font-black mt-0.5 text-slate-900">{user.referralsCount} invités</h3>
          </div>
        </div>

        <div className="text-right border-l border-slate-100 pl-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Commissions</p>
          <h3 className="text-base font-black mt-0.5 text-green-600">{user.commissionEarned.toLocaleString()} <span className="text-xs">F</span></h3>
        </div>
      </div>

      {/* Invite Code, Link Card & Sharing Buttons */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 relative overflow-hidden shadow-xs">
        <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
        
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Award className="h-4 w-4 text-blue-600 animate-pulse" />
          Votre lien d'invitation exclusif
        </h3>

        <div className="flex bg-slate-50 border border-slate-100 rounded-xl p-2.5 items-center justify-between gap-2">
          <span className="text-[11px] font-mono select-all text-slate-600 break-all truncate">{inviteLink}</span>
          
          <button
            id="btn-copy-invite-link"
            onClick={handleCopyLink}
            className={`cursor-pointer min-w-[76px] py-1.5 px-3 rounded-lg text-[10px] font-extrabold tracking-wide uppercase transition-all duration-300 flex items-center justify-center space-x-1.5 shrink-0 ${
              copied 
                ? "bg-green-600 text-white" 
                : "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copié !</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>

        {/* Brand Sharing Row */}
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-2">Partager automatiquement :</p>
        <div className="grid grid-cols-5 gap-2">
          {/* WhatsApp */}
          <a
            href={shareUrls.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/20 transition-all duration-300"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-[8.5px] font-bold mt-1">WhatsApp</span>
          </a>

          {/* Twitter / X */}
          <a
            href={shareUrls.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 hover:bg-slate-100 transition-all duration-300"
          >
            <Twitter className="h-5 w-5" />
            <span className="text-[8.5px] font-bold mt-1">Twitter</span>
          </a>

          {/* Telegram */}
          <a
            href={shareUrls.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20 text-[#0088cc] hover:bg-[#0088cc]/20 transition-all duration-300"
          >
            <Send className="h-5 w-5 animate-pulse" />
            <span className="text-[8.5px] font-bold mt-1">Telegram</span>
          </a>

          {/* Facebook */}
          <a
            href={shareUrls.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 text-[#1877F2] hover:bg-[#1877F2]/20 transition-all duration-300"
          >
            <Facebook className="h-5 w-5" />
            <span className="text-[8.5px] font-bold mt-1">Facebook</span>
          </a>

          {/* Instagram */}
          <button
            onClick={handleInstagramShare}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gradient-to-tr from-[#f9ce34]/10 via-[#ee2a7b]/10 to-[#6228d7]/10 border border-[#ee2a7b]/20 text-[#ee2a7b] hover:from-[#f9ce34]/20 hover:via-[#ee2a7b]/20 hover:to-[#6228d7]/20 transition-all duration-300 cursor-pointer"
          >
            <Instagram className="h-5 w-5" />
            <span className="text-[8.5px] font-bold mt-1 truncate max-w-full">{instaCopied ? "Copié !" : "Instagram"}</span>
          </button>
        </div>
      </div>

      {/* Three Commission Levels Visual Layout */}
      <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase mt-2 px-1">Structure de l'Équipe</h3>
      <div className="grid grid-cols-3 gap-3">
        
        {/* L1 */}
        <div className="bg-white border border-slate-100 p-3 px-2 rounded-2xl text-center shadow-xs relative">
          <div className="absolute top-1 right-1 px-1 py-0.5 bg-blue-500/10 border border-blue-500/20 text-[8px] font-bold text-blue-600 rounded-sm">
            N1 (20%)
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-2 font-bold">Niveau 1</span>
          <span className="text-lg font-black text-slate-900 mt-1.5 block">{user.referralsN1}</span>
          <span className="text-[8.5px] text-slate-500 mt-1 block">Filleuls directs</span>
        </div>

        {/* L2 */}
        <div className="bg-white border border-slate-100 p-3 px-2 rounded-2xl text-center shadow-xs relative">
          <div className="absolute top-1 right-1 px-1 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-bold text-cyan-600 rounded-sm">
            N2 (2%)
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-2 font-bold">Niveau 2</span>
          <span className="text-lg font-black text-slate-900 mt-1.5 block">{user.referralsN2}</span>
          <span className="text-[8.5px] text-slate-500 mt-1 block">Filleuls de N1</span>
        </div>

        {/* L3 */}
        <div className="bg-white border border-slate-100 p-3 px-2 rounded-2xl text-center shadow-xs relative">
          <div className="absolute top-1 right-1 px-1 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[8px] font-bold text-amber-600 rounded-sm">
            N3 (1%)
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-2 font-bold">Niveau 3</span>
          <span className="text-lg font-black text-slate-900 mt-1.5 block">{user.referralsN3}</span>
          <span className="text-[8.5px] text-slate-500 mt-1 block">Filleuls de N2</span>
        </div>

      </div>

      {/* Guide explaining affiliation program */}
      <div className="bg-blue-50/50 border border-blue-100/60 p-4 rounded-3xl flex items-start space-x-3 text-xs leading-relaxed">
        <HelpCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-black text-slate-900">Comment fonctionnent les commissions ?</p>
          <p className="text-slate-600 text-[11px]">
            Chaque fois qu'un utilisateur s'inscrit via votre lien, il rejoint votre équipe. S'il investit dans une machine :
          </p>
          <ul className="list-disc pl-4 text-slate-600 text-[10.5px] space-y-0.5 leading-relaxed font-semibold">
            <li>S'il s'agit de votre <span className="text-blue-600 font-bold">N1 direct</span>, vous recevez instantanément <span className="text-green-600 font-extrabold">20%</span> du prix de son plan.</li>
            <li>S'il s'agit d'un filleul <span className="text-cyan-600 font-bold">N2 d'équipe</span>, vous recevez instantanément <span className="text-green-600 font-extrabold">2%</span>.</li>
            <li>S'il s'agit d'un filleul <span className="text-amber-600 font-bold">N3 d'équipe</span>, vous recevez instantanément <span className="text-green-600 font-extrabold">1%</span>.</li>
          </ul>
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase">Membres de votre équipe ({team.length})</h3>
          
          {/* Level Filters */}
          <div className="flex bg-slate-100 border border-slate-200/80 rounded-xl p-0.5 text-[9px] font-extrabold uppercase">
            <button
              onClick={() => setSelectedLevel("all")}
              className={`px-2 py-1 rounded-md transition-all duration-200 cursor-pointer ${selectedLevel === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedLevel(1)}
              className={`px-2 py-1 rounded-md transition-all duration-200 cursor-pointer ${selectedLevel === 1 ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              N1
            </button>
            <button
              onClick={() => setSelectedLevel(2)}
              className={`px-2 py-1 rounded-md transition-all duration-200 cursor-pointer ${selectedLevel === 2 ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              N2
            </button>
            <button
              onClick={() => setSelectedLevel(3)}
              className={`px-2 py-1 rounded-md transition-all duration-200 cursor-pointer ${selectedLevel === 3 ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              N3
            </button>
          </div>
        </div>

        {filteredTeam.length === 0 ? (
          <div className="p-6 bg-white border border-slate-100 rounded-2xl text-center text-xs text-slate-400 font-bold">
            {selectedLevel === "all" 
              ? "Aucun membre inscrit sous votre lien pour le moment." 
              : `Aucun membre enregistré au Niveau ${selectedLevel} pour le moment.`}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTeam.map((member) => (
              <div key={member.id} className="p-3.5 bg-white border border-slate-100 rounded-3xl flex justify-between items-center transition-all duration-300 hover:border-slate-200 shadow-xs">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-wider shrink-0 ${
                    member.level === 1 
                      ? "bg-blue-50 border border-blue-100 text-blue-600" 
                      : member.level === 2 
                        ? "bg-cyan-50 border border-cyan-100 text-cyan-600" 
                        : "bg-amber-50 border border-amber-100 text-amber-600"
                  }`}>
                    N{member.level}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{member.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">({obfuscatePhone(member.phone)})</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Inscrit le {new Date(member.registeredAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-black ${member.totalInvested > 0 ? "text-green-600" : "text-slate-500"}`}>
                    {member.totalInvested.toLocaleString()} F
                  </span>
                  <p className="text-[8.5px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">Montant Investi</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referral Commission history log */}
      <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase mt-4 px-1">Historique des commissions</h3>
      
      {commissionLogs.length === 0 ? (
        <div className="p-6 bg-white border border-slate-100 rounded-2xl text-center text-xs text-slate-400 font-bold">
          Aucune commission parrainage reçue pour le moment.
        </div>
      ) : (
        <div className="space-y-2.5">
          {commissionLogs.map((log) => (
            <div key={log.id} className="p-3.5 bg-white border border-slate-100 rounded-3xl flex justify-between items-center shadow-xs">
              <div>
                <p className="text-xs font-bold text-slate-800">{log.method || "Commission d'affiliation"}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">{new Date(log.date).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-green-600">+{log.amount.toLocaleString()} F</span>
                <p className="text-[9.5px] text-slate-400 font-mono font-bold mt-0.5">FIL_REWARD</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
