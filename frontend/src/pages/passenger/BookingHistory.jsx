import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Calendar, Clock, MapPin, AlertCircle, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import RatingModal from '../../components/ratings/RatingModal';
import { getMyBookings, cancelBooking } from '../../api/bookings.api';
import { formatPrice, formatDatePretty, formatTime } from '../../utils/formatPrice';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
];

function isUpcoming(b) {
  if (!b?.departure_date) return false;
  const dateStr = `${String(b.departure_date).slice(0, 10)}T${(b.departure_time || '00:00').slice(0, 5)}:00`;
  const dep = new Date(dateStr);
  return dep.getTime() >= Date.now();
}

function canCancel(b) {
  return ['pending', 'confirmed'].includes(b.status) && isUpcoming(b);
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');

  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const [ratingFor, setRatingFor] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyBookings();
      const sorted = [...data].sort((a, b) => {
        const da = new Date(`${String(a.departure_date).slice(0, 10)}T${(a.departure_time || '00:00').slice(0, 5)}:00`).getTime();
        const db = new Date(`${String(b.departure_date).slice(0, 10)}T${(b.departure_time || '00:00').slice(0, 5)}:00`).getTime();
        return db - da;
      });
      setBookings(sorted);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    if (tab === 'upcoming') return bookings.filter((b) => isUpcoming(b) && b.status !== 'cancelled' && b.status !== 'rejected');
    if (tab === 'past') return bookings.filter((b) => !isUpcoming(b) || b.status === 'cancelled' || b.status === 'rejected');
    return bookings;
  }, [bookings, tab]);

  const handleCancel = async () => {
    if (!confirmCancelId || cancelling) return;
    setCancelling(true);
    try {
      await cancelBooking(confirmCancelId);
      toast.success('Booking cancelled');
      setConfirmCancelId(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  };

  const cancelTarget = bookings.find((b) => b.booking_id === confirmCancelId);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main className="pt-20 px-grid-3 max-w-4xl mx-auto pb-grid-6">
        <h1 className="text-h1 mt-grid-3 mb-grid-3">My Bookings</h1>

        {/* Tabs */}
        <div className="flex items-center gap-grid-1 border-b border-border mb-grid-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-grid-2 py-grid-2 text-body border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-white text-white'
                  : 'border-transparent text-text-secondary hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-surface border border-error rounded-[2px] p-grid-2 flex items-center gap-grid-2 text-error mb-grid-3">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-grid-5"><Spinner size="lg" /></div>
        ) : visible.length === 0 ? (
          <div className="bg-surface border border-border rounded-[2px] p-grid-5 text-center">
            <p className="text-h3 mb-grid-1">No bookings here yet</p>
            <p className="text-body text-text-secondary mb-grid-2">
              Find your next ride across Albania.
            </p>
            <Link to="/search">
              <Button variant="primary">Search trips</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-grid-2">
            {visible.map((b) => {
              const showRate = b.status === 'confirmed' && b.trip_status === 'completed';
              return (
                <div
                  key={b.booking_id}
                  className="bg-surface border border-border border-l-2 border-l-white rounded-[2px] p-grid-3"
                >
                  <div className="flex items-center justify-between gap-grid-2 flex-wrap">
                    <div className="flex items-center gap-grid-2 flex-wrap">
                      <span className="text-h3 font-semibold">{b.departure_city}</span>
                      <ArrowRight size={18} className="text-text-secondary" />
                      <span className="text-h3 font-semibold">{b.destination_city}</span>
                    </div>
                    <Badge status={b.status}>{b.status}</Badge>
                  </div>

                  <div className="mt-grid-2 grid grid-cols-1 sm:grid-cols-3 gap-grid-2 text-small text-text-secondary">
                    <span className="inline-flex items-center gap-grid-1">
                      <Calendar size={14} /> {formatDatePretty(b.departure_date)}
                    </span>
                    <span className="inline-flex items-center gap-grid-1">
                      <Clock size={14} /> {formatTime(b.departure_time)}
                    </span>
                    <span className="inline-flex items-center gap-grid-1 truncate">
                      <MapPin size={14} /> {b.pickup_location}
                    </span>
                  </div>

                  <div className="mt-grid-2 pt-grid-2 border-t border-border flex items-center justify-between gap-grid-2 flex-wrap">
                    <div className="text-small text-text-secondary">
                      Driver: <span className="text-text-primary">{b.driver_name}</span>
                    </div>
                    <div className="flex items-center gap-grid-2">
                      <span className="text-body font-bold">{formatPrice(b.price_per_seat)}</span>
                      <Link to={`/trips/${b.trip_id}`}>
                        <Button size="sm" variant="ghost">Trip</Button>
                      </Link>
                      {showRate && (
                        <Button size="sm" variant="secondary" onClick={() => setRatingFor(b)}>
                          <Star size={14} /> Rate
                        </Button>
                      )}
                      {canCancel(b) && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setConfirmCancelId(b.booking_id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Modal
        open={!!confirmCancelId}
        onClose={() => !cancelling && setConfirmCancelId(null)}
        title="Cancel booking?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmCancelId(null)} disabled={cancelling}>
              Keep booking
            </Button>
            <Button variant="danger" onClick={handleCancel} loading={cancelling}>
              Yes, cancel
            </Button>
          </>
        }
      >
        {cancelTarget && (
          <p className="text-body text-text-secondary">
            Cancel your booking for{' '}
            <span className="text-text-primary">
              {cancelTarget.departure_city} → {cancelTarget.destination_city}
            </span>{' '}
            on {formatDatePretty(cancelTarget.departure_date)}? This cannot be undone.
          </p>
        )}
      </Modal>

      <RatingModal
        open={!!ratingFor}
        onClose={() => setRatingFor(null)}
        trip={ratingFor && {
          trip_id: ratingFor.trip_id,
          departure_city: ratingFor.departure_city,
          destination_city: ratingFor.destination_city,
          departure_date: ratingFor.departure_date,
          driver_name: ratingFor.driver_name,
        }}
        onSubmitted={() => {
          setRatingFor(null);
          toast.success('Thanks for rating!');
        }}
      />
    </div>
  );
}
