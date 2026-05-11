import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString();
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount } = useNotifications();
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const recent = notifications.slice(0, 5);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-grid-1 text-text-primary hover:bg-surface-elevated rounded-[2px] transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full"
            style={{ backgroundColor: '#FF3B30' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-grid-1 w-80 bg-surface border border-border rounded-[2px] z-50">
          <div className="px-grid-2 py-grid-2 border-b border-border flex items-center justify-between">
            <span className="text-body font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-small text-text-secondary">{unreadCount} unread</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {recent.length === 0 ? (
              <div className="px-grid-2 py-grid-3 text-small text-text-secondary text-center">
                No notifications yet
              </div>
            ) : (
              recent.map((n) => (
                <div
                  key={n.id}
                  className={`px-grid-2 py-grid-2 border-b border-border last:border-b-0 ${!n.is_read ? 'bg-surface-elevated' : ''}`}
                >
                  <div className="text-body text-text-primary">{n.message || n.title}</div>
                  <div className="text-small text-text-secondary mt-1">
                    {formatTime(n.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block px-grid-2 py-grid-2 border-t border-border text-center text-small text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
