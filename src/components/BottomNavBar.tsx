/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { LayoutDashboard, ClipboardList, MessageCircle, Trophy, User } from "lucide-react";
import { getConversationForUser, subscribeChatUpdates } from "../lib/chatStore";

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
}

export default function BottomNavBar({ activeTab, setActiveTab, isAdmin }: BottomNavBarProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateUnread = () => {
      const conv = getConversationForUser();
      setUnreadCount(conv.unreadCountForUser || 0);
    };
    updateUnread();
    const unsub = subscribeChatUpdates(updateUnread);
    return () => unsub();
  }, []);

  const tabs = [
    { id: "dashboard", label: "Accueil", icon: LayoutDashboard },
    { id: "products", label: "Commandes", icon: ClipboardList },
    { id: "support", label: "Chat", icon: MessageCircle, badge: unreadCount },
    { id: "team", label: "Équipe", icon: Trophy },
    { id: "profile", label: "Mon compte", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl px-2 py-2 sm:py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
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
                  ? "text-emerald-600 bg-emerald-50 font-black scale-105" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {/* Top active bar indicator */}
              {isActive && (
                <span className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-emerald-600 rounded-full" />
              )}
              
              <div className="relative">
                <IconComponent className={`h-6 w-6 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-xs font-black tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
