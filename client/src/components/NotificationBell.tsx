import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";

const GOLD = "#C9A84C";

export interface AppNotification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

function useNotifications(userId?: number) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let es: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      es = new EventSource(`/api/notifications/stream?userId=${userId}`);
      es.onopen = () => setConnected(true);
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "connected") return;
          setNotifications((prev) => [data, ...prev].slice(0, 50));
        } catch {}
      };
      es.onerror = () => {
        setConnected(false);
        es?.close();
        retryTimeout = setTimeout(connect, 5000);
      };
    };

    connect();
    return () => {
      es?.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [userId]);

  const markAsRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const clearAll = () => setNotifications([]);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    connected,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}

function typeIcon(type: AppNotification["type"]) {
  const cls = "h-4 w-4 flex-shrink-0";
  switch (type) {
    case "success": return <CheckCircle className={cls + " text-green-400"} />;
    case "warning": return <AlertTriangle className={cls + " text-amber-400"} />;
    case "error":   return <XCircle className={cls + " text-red-400"} />;
    default:        return <Info className={cls + " text-blue-400"} />;
  }
}

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return "A l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

interface Props {
  userId?: number;
}

export default function NotificationBell({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, connected, markAsRead, markAllAsRead, clearAll } =
    useNotifications(userId);

  // Fermer le panneau si clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bouton cloche */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white bg-gray-100 dark:bg-white/10 rounded-lg transition-all"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-bold"
            style={{ background: "#ef4444" }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {/* Indicateur de connexion SSE */}
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-[#1a1a2e]"
          style={{ background: connected ? "#22c55e" : "#6b7280" }}
          title={connected ? "Connecte en temps reel" : "Deconnecte"}
        />
      </button>

      {/* Panneau de notifications */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* En-tête */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
                  style={{ background: GOLD }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition-colors"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                  title="Tout effacer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-400">Aucune notification</p>
                <p className="text-xs text-gray-400 mt-1">
                  {connected ? "En attente d'evenements..." : "Connexion en cours..."}
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 border-b border-gray-50 dark:border-white/5 last:border-0 cursor-pointer transition-colors ${
                    n.read
                      ? "bg-transparent hover:bg-gray-50 dark:hover:bg-white/5"
                      : "bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  }`}
                  onClick={() => {
                    markAsRead(n.id);
                    if (n.link) setOpen(false);
                  }}
                >
                  <div className="mt-0.5">{typeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-semibold truncate ${n.read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: GOLD }} />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pied */}
          <div className="px-4 py-2 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            <Link href="/alerts">
              <button
                onClick={() => setOpen(false)}
                className="w-full text-xs font-medium text-center transition-colors"
                style={{ color: GOLD }}
              >
                Voir toutes les alertes
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
