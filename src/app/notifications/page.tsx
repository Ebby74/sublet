'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/v1/notifications');
        const data = await res.json();
        setNotifications(data.data || []);
        setUnreadCount(data.meta?.unreadCount || 0);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/v1/notifications/${id}`, { method: 'PATCH' });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/v1/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment_due':
        return '💰';
      case 'payment_overdue':
        return '⚠️';
      case 'lease_expiry':
        return '📅';
      case 'lease_expired':
        return '🔑';
      default:
        return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="container py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Reminders
          </h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-accent rounded-lg transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Notifications</h3>
          <p className="text-muted-foreground">
            You'll see reminders for rent due, lease expiry, and more here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-xl border transition-colors ${
                notification.read ? 'bg-card' : 'bg-primary/5 border-primary/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{notification.title}</h3>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleDateString('en-MY', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}