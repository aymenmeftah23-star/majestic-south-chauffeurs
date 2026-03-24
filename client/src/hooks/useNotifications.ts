import { useState, useEffect, useCallback } from "react";

export interface AppNotification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export function useNotifications(userId?: number) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let es: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      es = new EventSource(`/api/notifications/stream?userId=${userId}`);

      es.onopen = () => {
        setConnected(true);
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Ignorer l'événement de connexion initial
          if (data.type === "connected") return;

          const notification: AppNotification = data;
          setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Max 50 notifications
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
      };

      es.onerror = () => {
        setConnected(false);
        es?.close();
        // Reconnexion automatique après 5 secondes
        retryTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      es?.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [userId]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
