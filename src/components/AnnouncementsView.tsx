import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, Bell, RefreshCw, Megaphone } from "lucide-react";
import { GlobalNotification } from "../types";
import { api } from "../lib/api";

interface AnnouncementsViewProps {
  onBack: () => void;
  userPhone?: string;
}

export default function AnnouncementsView({ onBack, userPhone }: AnnouncementsViewProps) {
  const [announcements, setAnnouncements] = useState<GlobalNotification[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<GlobalNotification | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const storageKey = userPhone ? `nutrien_read_notif_ids_${userPhone}` : "nutrien_read_notif_ids";

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setReadIds(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Erreur lecture read_ids:", e);
    }
  }, [storageKey]);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.getNotifications();
      const list = res.notifications || [];
      // Sort newest first
      const sorted = [...list].sort((a, b) => {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        return timeB - timeA;
      });
      setAnnouncements(sorted);
    } catch (err) {
      console.warn("Erreur chargement annonces:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    const handleRealtimeUpdate = () => {
      fetchAnnouncements();
    };

    window.addEventListener("nutrien_realtime_update", handleRealtimeUpdate);
    return () => window.removeEventListener("nutrien_realtime_update", handleRealtimeUpdate);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const handleSelectAnnouncement = (notif: GlobalNotification) => {
    // Mark as read
    if (!readIds.includes(notif.id)) {
      const updated = [...readIds, notif.id];
      setReadIds(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.warn("Erreur sauvegarde read_ids:", e);
      }
    }
    setSelectedNotif(notif);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "2026-08-02 08:33:32";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const seconds = String(d.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Detail View Mode
  if (selectedNotif) {
    const paragraphs = selectedNotif.content
      ? selectedNotif.content.split(/\n\s*\n/).filter(p => p.trim().length > 0)
      : [];

    return (
      <div id="announcement-detail-view" className="space-y-6 max-w-xl mx-auto pb-16 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between py-2">
          <button
            id="announcement-detail-back-btn"
            onClick={() => setSelectedNotif(null)}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-200/50 text-slate-900 transition-all cursor-pointer flex items-center gap-1 font-bold text-xs"
          >
            <ChevronLeft className="h-6 w-6 text-slate-900" />
          </button>
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Détail</h1>
          <div className="w-8" />
        </div>

        {/* Content Flow directly on background - No card boxes, no borders, no shadows */}
        <div className="space-y-5">
          {selectedNotif.image && (
            <div className="overflow-hidden rounded-2xl mb-4">
              <img
                src={selectedNotif.image}
                alt={selectedNotif.title}
                className="w-full h-auto max-h-80 object-cover rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Title & Date */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {selectedNotif.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{formatDate(selectedNotif.date)}</span>
            </div>
          </div>

          {/* Body Paragraphs naturally sitting on background */}
          <div className="space-y-5 text-sm sm:text-base text-slate-900 font-medium leading-relaxed pt-2">
            {paragraphs.length > 0 ? (
              paragraphs.map((para, idx) => (
                <p key={idx} className="whitespace-pre-line text-slate-900">
                  {para.trim()}
                </p>
              ))
            ) : (
              <p className="whitespace-pre-line text-slate-900">{selectedNotif.content}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List View Mode
  return (
    <div id="announcements-list-view" className="space-y-4 max-w-xl mx-auto pb-16 text-slate-900">
      {/* Top Header matching reference image */}
      <div className="flex items-center justify-between py-2">
        <button
          id="announcements-back-btn"
          onClick={onBack}
          className="p-1 -ml-1 rounded-full hover:bg-slate-200/50 text-slate-900 transition-all cursor-pointer"
          title="Retour"
        >
          <ChevronLeft className="h-7 w-7 text-slate-900" />
        </button>
        <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Message</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1.5 rounded-full text-slate-600 hover:bg-slate-200/50 transition-all cursor-pointer"
          title="Actualiser"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
        </button>
      </div>

      {/* Main Container - Borderless & Frameless */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Chargement des messages...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Aucun message pour le moment</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Les annonces et messages diffusés par l'administration s'afficheront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-1 pt-1">
          {announcements.map((notif) => {
            const isUnread = !readIds.includes(notif.id);

            return (
              <div
                key={notif.id}
                id={`announcement-item-${notif.id}`}
                onClick={() => handleSelectAnnouncement(notif)}
                className="group flex items-center justify-between py-3.5 px-3 hover:bg-slate-200/40 rounded-2xl transition-all cursor-pointer"
              >
                <div className="space-y-1 pr-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shrink-0 inline-block" />
                    )}
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate">
                      {notif.title}
                    </h3>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono pl-0.5">
                    {formatDate(notif.date)}
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
