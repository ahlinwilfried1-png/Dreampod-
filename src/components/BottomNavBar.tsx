/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, Trophy, User, Wallet } from "lucide-react";

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
}

export default function BottomNavBar({ activeTab, setActiveTab, isAdmin }: BottomNavBarProps) {
  const tabs = [
    { id: "dashboard", label: "Accueil", icon: LayoutDashboard },
    { id: "products", label: "Produit", icon: Wallet },
    { id: "team", label: "Équipe", icon: Trophy },
    { id: "profile", label: "Mon compte", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-slate-200/80 backdrop-blur-xl px-2 py-2 sm:py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              id={`nav-tab-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center transition-all duration-300 relative cursor-pointer space-y-0.5 py-1 px-3.5 rounded-xl ${
                isActive
                  ? "text-[#00a3e0] bg-blue-50/50 font-black scale-105" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {/* Top active bar indicator */}
              {isActive && (
                <span className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#00a3e0] rounded-full" />
              )}
              
              <IconComponent className={`h-5.5 w-5.5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[11px] font-black tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
