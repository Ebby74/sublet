'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationPanelProps {
  onNotificationRead?: () => void;
}

export function NotificationPanel({ onNotificationRead }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/notifications');
      if (res.ok) {
        const { data } = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    await fetch(`/api/v1/notifications/${id}`, { method: 'PATCH' });
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    onNotificationRead?.();
  }

  async function markAllAsRead() {
    await fetch('/api/v1/notifications/read-all', { method: 'POST' });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onNotificationRead?.();
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Sheet header with custom styling */}
      <div className="flex items-center justify-between border-b px-4 py-4">
        <span className="font-semibold text-lg">Notifications</span>
        <button
          onClick={() => {/* parent handles close */}}
          className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          {/* Close handled by parent Sheet */}
        </button>
      </div>

      {/* Notification Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold">Notifications</h2>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
            <Bell className="h-8 w-8 mb-2 opacity-50" />
            No notifications yet
          </div>
        ) : (
          <ul className="divide-y">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`px-4 py-3 hover:bg-accent/50 transition-colors ${
                  !notification.read ? 'bg-accent/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
