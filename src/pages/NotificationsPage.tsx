import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, type Notification } from '@/lib/api';
import PageHeader from '@/components/PageHeader';

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
}

export default function NotificationsPage() {
  const { user, refreshUnreadCount } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = user?.id || 0;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchNotifications(50, 1);
      setNotifications(res.items || []);
    } catch (err: any) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const isRead = (n: Notification) => n.is_read || (userId && n.user_id_read?.includes(userId));

  const handleMarkRead = useCallback(async (n: Notification) => {
    if (isRead(n)) return;
    try {
      await markNotificationRead(n.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, is_read: true, user_id_read: [...(item.user_id_read || []), userId] } : item
        )
      );
      refreshUnreadCount();
    } catch {
      // silent fail
    }
  }, [userId, refreshUnreadCount]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true, user_id_read: [...(item.user_id_read || []), userId] }))
      );
      refreshUnreadCount();
    } catch {
      // silent fail
    }
  }, [userId, refreshUnreadCount]);

  const hasUnread = notifications.some((n) => !isRead(n));

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Notifications" />
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-brand-pink)] hover:bg-[var(--color-brand-pink-light)] transition"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse h-20" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]">
          <Inbox size={48} className="mb-3 opacity-40" />
          <p className="text-sm font-medium">No notifications yet</p>
          <p className="text-xs mt-1">We'll let you know when something comes up.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const read = isRead(n);
            return (
              <button
                key={n.id}
                onClick={() => handleMarkRead(n)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  read
                    ? 'bg-white border-[var(--color-border-light)]'
                    : 'bg-[var(--color-brand-pink-light)] border-[var(--color-card-border)] shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 ${read ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-brand-pink)]'}`}>
                    <Bell size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm ${read ? 'font-normal text-[var(--color-text-secondary)]' : 'font-semibold text-[var(--color-text-primary)]'}`}>
                        {n.title}
                      </h3>
                      <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2">
                      {n.body || n.message}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
