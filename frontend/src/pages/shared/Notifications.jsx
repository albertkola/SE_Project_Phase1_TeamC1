import { useEffect, useState } from 'react';
import { Bell, AlertCircle, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import {
  getMyNotifications, markAllRead, markRead,
} from '../../api/notifications.api';
import { useNotifications } from '../../context/NotificationContext';

function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleString();
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const { refresh } = useNotifications();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyNotifications();
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
      setItems(sorted);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const handleMarkAll = async () => {
    if (busy || unreadCount === 0) return;
    setBusy(true);
    try {
      await markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      refresh();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    } finally {
      setBusy(false);
    }
  };

  const handleMarkOne = async (n) => {
    if (n.is_read) return;
    try {
      await markRead(n.id ?? n.notification_id);
      setItems((prev) =>
        prev.map((x) =>
          (x.id ?? x.notification_id) === (n.id ?? n.notification_id)
            ? { ...x, is_read: true }
            : x
        )
      );
      refresh();
    } catch {
      // best effort
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main className="pt-20 px-grid-3 max-w-3xl mx-auto pb-grid-6">
        <div className="mt-grid-3 flex items-center justify-between gap-grid-2 flex-wrap">
          <div className="flex items-center gap-grid-2">
            <h1 className="text-h1">Notifications</h1>
            {unreadCount > 0 && (
              <span
                className="inline-flex items-center px-grid-1 py-[2px] text-small font-semibold rounded-[2px]"
                style={{ backgroundColor: '#FF3B30', color: '#FFF' }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>
          <Button
            variant="secondary"
            disabled={unreadCount === 0}
            loading={busy}
            onClick={handleMarkAll}
          >
            <CheckCheck size={14} /> Mark all as read
          </Button>
        </div>

        {error && (
          <div className="mt-grid-3 bg-surface border border-error rounded-[2px] p-grid-2 flex items-center gap-grid-2 text-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-grid-5"><Spinner size="lg" /></div>
        ) : items.length === 0 ? (
          <div className="mt-grid-3 bg-surface border border-border rounded-[2px] p-grid-5 text-center">
            <Bell size={40} className="mx-auto text-text-muted mb-grid-2" />
            <p className="text-h3 mb-grid-1">No notifications yet</p>
            <p className="text-body text-text-secondary">
              We'll let you know when there's something new.
            </p>
          </div>
        ) : (
          <section className="mt-grid-3 bg-surface border border-border rounded-[2px] overflow-hidden">
            {items.map((n) => {
              const id = n.id ?? n.notification_id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleMarkOne(n)}
                  className={`w-full text-left flex items-start gap-grid-2 px-grid-3 py-grid-2 border-b border-border last:border-b-0 transition-colors ${
                    n.is_read
                      ? 'bg-surface hover:bg-surface-elevated'
                      : 'bg-surface-elevated hover:bg-[#1F1F1F]'
                  }`}
                >
                  <span
                    className={`mt-2 w-2 h-2 rounded-full shrink-0 ${
                      n.is_read ? 'bg-transparent' : 'bg-white'
                    }`}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-text-primary">
                      {n.message || n.title || 'Notification'}
                    </p>
                    <p className="text-small text-text-secondary mt-1">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                </button>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
