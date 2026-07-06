/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, Shield, Trophy, User, Wallet, MessageSquare, Megaphone } from "lucide-react";

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
}

export default function BottomNavBar({ activeTab, setActiveTab, isAdmin }: BottomNavBarProps) {
  const tabs = [
    { id: "dashboard", label: "Accueil", icon: LayoutDashboard },
    { id: "products", label: "Investir", icon: Wallet },
    { id: "forum", label: "Forum", icon: MessageSquare },
    { id: "team", label: "Équipe", icon: Trophy },
    { id: "profile", label: "Moi", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-slate-200/80 backdrop-blur-xl px-2 py-2 sm:py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          const isForum = tab.id === "forum";
          
          return (
            <button
              id={`nav-tab-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center transition-all duration-300 relative cursor-pointer ${
                isForum
                  ? "-translate-y-7 bg-gradient-to-tr from-[#00a3e0] to-blue-600 text-white rounded-full p-3.5 shadow-xl shadow-blue-500/30 border-4 border-white scale-110"
                  : `space-y-0.5 py-1 ${isAdmin ? "px-1.5" : "px-2.5"} rounded-xl`
              } ${
                isActive && !isForum
                  ? "text-[#00a3e0] bg-blue-50/50 font-black scale-105" 
                  : isForum
                    ? isActive
                      ? "ring-4 ring-blue-100 scale-115"
                      : "hover:scale-110"
                    : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {/* Top active bar indicator */}
              {isActive && !isForum && (
                <span className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#00a3e0] rounded-full" />
              )}
              
              <IconComponent className={`${isForum ? "h-6 w-6 text-white" : "h-5 w-5"} ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className={`${isForum ? "text-[9px] font-black text-blue-100 mt-0.5" : "text-[10px] font-black tracking-tight"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
