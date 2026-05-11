import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Calendar, Clock, Users, AlertCircle, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { searchTrips } from '../../api/trips.api';
import { deleteTrip as apiDeleteTrip } from '../../api/admin.api';
import { formatDatePretty, formatTime } from '../../utils/formatPrice';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function ManageTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tab, setTab] = useState('all');

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { trips: list } = await searchTrips({ status: 'all' });
      setTrips(list);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    if (tab === 'all') return trips;
    return trips.filter((t) => t.status === tab);
  }, [trips, tab]);

  const handleDelete = async () => {
    if (!confirmDelete || deleting) return;
    setDeleting(true);
    try {
      await apiDeleteTrip(confirmDelete.trip_id);
      toast.success('Trip deleted');
      setConfirmDelete(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main className="pt-20 px-grid-3 max-w-7xl mx-auto pb-grid-6">
        <h1 className="text-h1 mt-grid-3 mb-grid-3">Manage trips</h1>

        <div className="flex items-center gap-grid-1 border-b border-border mb-grid-3 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-grid-2 py-grid-2 text-body border-b-2 transition-colors whitespace-nowrap ${
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
            <Calendar size={40} className="mx-auto text-text-muted mb-grid-2" />
            <p className="text-h3 mb-grid-1">No trips here</p>
            <p className="text-body text-text-secondary">
              Try a different status tab.
            </p>
          </div>
        ) : (
          <section className="bg-surface border border-border rounded-[2px] overflow-hidden">
            <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-grid-2 px-grid-3 py-grid-2 border-b border-border text-small text-text-secondary uppercase tracking-wider">
              <span>Route</span>
              <span>Driver</span>
              <span>Date</span>
              <span>Seats</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            {visible.map((t) => {
              const seatsTaken = Math.max(
                0,
                Number(t.total_seats) - Number(t.available_seats)
              );
              return (
                <div
                  key={t.trip_id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-grid-2 px-grid-3 py-grid-2 border-b border-border last:border-b-0 items-center"
                >
                  <div className="flex items-center gap-grid-1">
                    <Link to={`/trips/${t.trip_id}`} className="hover:underline">
                      <span className="text-body font-semibold">{t.departure_city}</span>
                      <ArrowRight size={12} className="inline mx-1 text-text-secondary" />
                      <span className="text-body font-semibold">{t.destination_city}</span>
                    </Link>
                  </div>
                  <span className="text-body text-text-secondary truncate">
                    {t.driver_name || '—'}
                  </span>
                  <div className="flex flex-col text-small text-text-secondary">
                    <span className="inline-flex items-center gap-grid-1">
                      <Calendar size={12} /> {formatDatePretty(t.departure_date)}
                    </span>
                    <span className="inline-flex items-center gap-grid-1">
                      <Clock size={12} /> {formatTime(t.departure_time)}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-grid-1 text-small">
                    <Users size={12} className="text-text-secondary" />
                    {seatsTaken}/{t.total_seats}
                  </span>
                  <span><Badge status={t.status}>{t.status}</Badge></span>
                  <div className="flex items-center justify-end gap-grid-1">
                    <Link to={`/trips/${t.trip_id}`}>
                      <Button size="sm" variant="ghost">View</Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setConfirmDelete(t)}
                    >
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>

      <Modal
        open={!!confirmDelete}
        onClose={() => !deleting && setConfirmDelete(null)}
        title="Delete trip?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Delete trip
            </Button>
          </>
        }
      >
        {confirmDelete && (
          <p className="text-body text-text-secondary">
            Permanently delete{' '}
            <span className="text-text-primary">
              {confirmDelete.departure_city} → {confirmDelete.destination_city}
            </span>{' '}
            on {formatDatePretty(confirmDelete.departure_date)}? All bookings on this trip will
            be removed. This cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  );
}
