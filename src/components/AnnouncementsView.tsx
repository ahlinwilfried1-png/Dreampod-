import { useState, useEffect } from "react";
import { ArrowLeft, Megaphone, Bell, RefreshCw, CheckCircle2 } from "lucide-react";
import { GlobalNotification } from "../types";
import { api } from "../lib/api";

interface AnnouncementsViewProps {
  onBack: () => void;
}

export default function AnnouncementsView({ onBack }: AnnouncementsViewProps) {
  const [announcements, setAnnouncements] = useState<GlobalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.getNotifications();
      setAnnouncements(res.notifications || []);
    } catch (err) {
      console.warn("Erreur chargement annonces:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("nutrien_notif_read", "true");
    fetchAnnouncements();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  return (
    <div className="space-y-4 text-slate-800 pb-20 max-w-2xl mx-auto animate-fade-in">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xs border border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            title="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-blue-600" />
              Annonces & Messages
            </h2>
            <p className="text-[10px] text-slate-500 font-semibold">
              Informations officielles de Nutrien Ag Solutions
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all cursor-pointer"
          title="Actualiser"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-3xl p-8 text-center space-y-3 shadow-xs">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-extrabold text-slate-600">Chargement des annonces...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mx-auto">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-black text-slate-800">Aucune annonce pour le moment</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Toutes les nouveautés, promotions et mises à jour importantes de la plateforme seront publiées ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((notif, index) => (
            <div
              key={notif.id || index}
              className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100 space-y-3 relative overflow-hidden transition-all hover:shadow-md"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Megaphone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                      {notif.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {notif.date ? new Date(notif.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "Annonce Officielle"}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  Officiel
                </span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-line border border-slate-100">
                {notif.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
