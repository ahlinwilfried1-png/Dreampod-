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
    <div className="space-y-6 pb-28 text-white select-none">
      
      {/* Intro Header */}
      <div className="text-center py-2 relative">
        <h2 className="text-lg font-bold tracking-tight text-white flex items-center justify-center gap-2">
          <Trophy className="text-blue-400 h-5 w-5" />
          Filleuls & Récompenses d'Équipe
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Gagnez des commissions instantanées sur 3 niveaux d’affiliation à chaque fois que vos filleuls rechargent leur compte et investissent.
        </p>
      </div>

      {/* Referrals Total Summary Box */}
      <div className="glass bg-[#050B18]/65 border border-white/8 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-blue-400">
            <Users className="h-6 w-6 stroke-[1.8]" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Filleuls Invités</p>
            <h3 id="referrals-total-count" className="text-lg font-bold mt-0.5 text-white">{user.referralsCount} invités</h3>
          </div>
        </div>

        <div className="text-right border-l border-white/5 pl-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Commissions</p>
          <h3 className="text-base font-bold mt-0.5 text-green-400">{user.commissionEarned.toLocaleString()} <span className="text-xs">F</span></h3>
        </div>
      </div>

      {/* Invite Code, Link Card & Sharing Buttons */}
      <div className="glass bg-[#050B18]/65 border border-white/8 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
        
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Award className="h-4 w-4 text-blue-400 animate-pulse" />
          Votre lien d'invitation exclusif
        </h3>

        <div className="flex bg-white/5 border border-white/10 rounded-xl p-2.5 items-center justify-between gap-2">
          <span className="text-[11px] font-mono select-all text-slate-300 break-all truncate">{inviteLink}</span>
          
          <button
            id="btn-copy-invite-link"
            onClick={handleCopyLink}
            className={`cursor-pointer min-w-[76px] py-1.5 px-3 rounded-lg text-[10px] font-extrabold tracking-wide uppercase transition-all duration-300 flex items-center justify-center space-x-1.5 shrink-0 ${
              copied 
                ? "bg-green-600 text-white" 
                : "btn-gradient text-white"
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
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
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
      <h3 className="text-xs font-extrabold tracking-widest text-slate-400 uppercase mt-2 px-1">Structure de l'Équipe</h3>
      <div className="grid grid-cols-3 gap-3">
        
        {/* L1 */}
        <div className="glass bg-[#050B18]/65 border border-white/8 p-3 px-2 rounded-2xl text-center shadow-lg relative">
          <div className="absolute top-1 right-1 px-1 py-0.5 bg-blue-500/10 border border-blue-500/20 text-[8px] font-bold text-blue-400 rounded-sm">
            N1 (20%)
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-2">Niveau 1</span>
          <span className="text-lg font-bold text-white mt-1.5 block">{user.referralsN1}</span>
          <span className="text-[8.5px] text-slate-400 mt-1 block">Filleuls directs</span>
        </div>

        {/* L2 */}
        <div className="glass bg-[#050B18]/65 border border-white/8 p-3 px-2 rounded-2xl text-center shadow-lg relative">
          <div className="absolute top-1 right-1 px-1 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-bold text-cyan-400 rounded-sm">
            N2 (2%)
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-2">Niveau 2</span>
          <span className="text-lg font-bold text-white mt-1.5 block">{user.referralsN2}</span>
          <span className="text-[8.5px] text-slate-400 mt-1 block">Filleuls de N1</span>
        </div>

        {/* L3 */}
        <div className="glass bg-[#050B18]/65 border border-white/8 p-3 px-2 rounded-2xl text-center shadow-lg relative">
          <div className="absolute top-1 right-1 px-1 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[8px] font-bold text-amber-400 rounded-sm">
            N3 (1%)
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-2">Niveau 3</span>
          <span className="text-lg font-bold text-white mt-1.5 block">{user.referralsN3}</span>
          <span className="text-[8.5px] text-slate-400 mt-1 block">Filleuls de N2</span>
        </div>

      </div>

      {/* Guide explaining affiliation program */}
      <div className="glass bg-[#050B18]/30 border border-white/5 p-4 rounded-xl flex items-start space-x-3 text-xs leading-relaxed">
        <HelpCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-200">Comment fonctionnent les commissions ?</p>
          <p className="text-slate-400 text-[11px]">
            Chaque fois qu'un utilisateur s'inscrit via votre lien, il rejoint votre équipe. S'il investit dans une machine :
          </p>
          <ul className="list-disc pl-4 text-slate-400 text-[10.5px] space-y-0.5 leading-relaxed">
            <li>S'il s'agit de votre <span className="text-blue-300 font-bold">N1 direct</span>, vous recevez instantanément <span className="text-green-400 font-extrabold">20%</span> du prix de son plan.</li>
            <li>S'il s'agit d'un filleul <span className="text-cyan-300 font-bold">N2 d'équipe</span>, vous recevez instantanément <span className="text-green-400 font-extrabold">2%</span>.</li>
            <li>S'il s'agit d'un filleul <span className="text-amber-300 font-bold">N3 d'équipe</span>, vous recevez instantanément <span className="text-green-400 font-extrabold">1%</span>.</li>
          </ul>
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold tracking-widest text-slate-400 uppercase">Membres de votre équipe ({team.length})</h3>
          
          {/* Level Filters */}
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 text-[9px] font-extrabold uppercase">
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
          <div className="p-6 glass bg-[#050B18]/30 border border-white/5 rounded-xl text-center text-xs text-slate-500">
            {selectedLevel === "all" 
              ? "Aucun membre inscrit sous votre lien pour le moment." 
              : `Aucun membre enregistré au Niveau ${selectedLevel} pour le moment.`}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTeam.map((member) => (
              <div key={member.id} className="p-3.5 glass bg-[#050B18]/50 border border-white/8 rounded-2xl flex justify-between items-center transition-all duration-300 hover:border-white/15">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-wider shrink-0 ${
                    member.level === 1 
                      ? "bg-blue-500/10 border border-blue-500/20 text-blue-400" 
                      : member.level === 2 
                        ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400" 
                        : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                  }`}>
                    N{member.level}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-white truncate max-w-[120px]">{member.name}</p>
                      <span className="text-[10px] text-slate-500 font-mono">({obfuscatePhone(member.phone)})</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Inscrit le {new Date(member.registeredAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-black ${member.totalInvested > 0 ? "text-green-400" : "text-slate-400"}`}>
                    {member.totalInvested.toLocaleString()} F
                  </span>
                  <p className="text-[8.5px] uppercase font-bold tracking-widest text-slate-500 mt-0.5">Montant Investi</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referral Commission history log */}
      <h3 className="text-xs font-extrabold tracking-widest text-slate-400 uppercase mt-4 px-1">Historique des commissions</h3>
      
      {commissionLogs.length === 0 ? (
        <div className="p-6 glass bg-[#050B18]/30 border border-white/5 rounded-xl text-center text-xs text-slate-500">
          Aucune commission parrainage reçue pour le moment.
        </div>
      ) : (
        <div className="space-y-2.5">
          {commissionLogs.map((log) => (
            <div key={log.id} className="p-3.5 glass bg-[#050B18]/50 border-white/5 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-white">{log.method || "Commission d'affiliation"}</p>
                <p className="text-[10px] text-slate-500 mt-1">{new Date(log.date).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-green-400">+{log.amount.toLocaleString()} F</span>
                <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">FIL_REWARD</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
