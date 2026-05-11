import { useState } from 'react';
import { MapPin, Clock, Check, X } from 'lucide-react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

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
  return d.toLocaleDateString();
}

export default function BookingRequest({ booking, onApprove, onReject }) {
  const [busy, setBusy] = useState(null); // 'approve' | 'reject' | null
  if (!booking) return null;

  const passengerName = booking.passenger_name || booking.full_name || 'Passenger';
  const pickup = booking.pickup_location || booking.pickup_name || '—';

  const handle = async (action, fn) => {
    if (busy) return;
    setBusy(action);
    try {
      await fn?.(booking);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-[2px] p-grid-3">
      <div className="flex items-center gap-grid-2">
        <Avatar
          user={{ full_name: passengerName, profile_picture: booking.passenger_avatar }}
          size="md"
        />
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <span className="text-body font-semibold truncate">{passengerName}</span>
        </div>
      </div>

      <div className="mt-grid-2 grid grid-cols-1 gap-grid-1 text-small text-text-secondary">
        <span className="inline-flex items-center gap-grid-1 truncate">
          <MapPin size={14} /> {pickup}
        </span>
        {booking.pickup_time && (
          <span className="inline-flex items-center gap-grid-1">
            <Clock size={14} /> {String(booking.pickup_time).slice(0, 5)}
          </span>
        )}
      </div>

      <div className="mt-grid-2 pt-grid-2 border-t border-border flex items-center gap-grid-1">
        <Button
          size="sm"
          variant="primary"
          className="flex-1"
          loading={busy === 'approve'}
          disabled={!!busy}
          onClick={() => handle('approve', onApprove)}
          style={{ backgroundColor: '#00C853', borderColor: '#00C853', color: '#000' }}
        >
          <Check size={14} /> Approve
        </Button>
        <Button
          size="sm"
          variant="danger"
          className="flex-1"
          loading={busy === 'reject'}
          disabled={!!busy}
          onClick={() => handle('reject', onReject)}
        >
          <X size={14} /> Reject
        </Button>
      </div>
    </div>
  );
}
