'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { NotificationPanel } from './notification-panel';
import { Sheet } from './sheet';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [panelKey, setPanelKey] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchUnreadCount() {
    try {
      const res = await fetch('/api/v1/notifications?unread=true');
      if (res.ok) {
        const { meta } = await res.json();
        setUnreadCount(meta.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }

  function handleNotificationRead() {
    fetchUnreadCount();
    // Force refresh panel
    setPanelKey(prev => prev + 1);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel key={panelKey} onNotificationRead={handleNotificationRead} />
    </Sheet>
  );
}
