import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Calendar, Clock, Users, AlertCircle, Plus,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { getDriverTrips } from '../../api/trips.api';
import { formatPrice, formatDatePretty, formatTime } from '../../utils/formatPrice';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function TripHistory() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await getDriverTrips();
        if (!alive) return;
        setTrips(data);
      } catch (err) {
        if (!alive) return;
        setError(err?.response?.data?.message || 'Failed to load trips');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const visible = useMemo(() => {
    if (tab === 'all') return trips;
    return trips.filter((t) => t.status === tab);
  }, [trips, tab]);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main className="pt-20 px-grid-3 max-w-5xl mx-auto pb-grid-6">
        <div className="mt-grid-3 flex items-center justify-between gap-grid-2 flex-wrap">
          <h1 className="text-h1">Trip history</h1>
          <Link to="/driver/trips/create">
            <Button variant="primary"><Plus size={16} /> Create Trip</Button>
          </Link>
        </div>

        <div className="mt-grid-3 flex items-center gap-grid-1 border-b border-border mb-grid-3 overflow-x-auto">
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
              {tab === 'all' ? 'Create your first trip to see it here.' : 'Try another tab.'}
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-[2px] overflow-hidden">
            {/* Header (desktop) */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-grid-2 px-grid-3 py-grid-2 border-b border-border text-small text-text-secondary uppercase tracking-wider">
              <span>Route</span>
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
              const seatsTotal = Number(t.total_seats);
              return (
                <div
                  key={t.trip_id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-grid-2 px-grid-3 py-grid-2 border-b border-border last:border-b-0 items-center"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-grid-1">
                      <span className="text-body font-semibold">{t.departure_city}</span>
                      <ArrowRight size={14} className="text-text-secondary" />
                      <span className="text-body font-semibold">{t.destination_city}</span>
                    </div>
                    <span className="text-small text-text-secondary">
                      {formatPrice(t.price_per_seat)}
                    </span>
                  </div>

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
                    {seatsTaken}/{seatsTotal}
                  </span>

                  <span><Badge status={t.status}>{t.status}</Badge></span>

                  <div className="flex items-center justify-end gap-grid-1">
                    <Link to={`/trips/${t.trip_id}`}>
                      <Button size="sm" variant="ghost">View</Button>
                    </Link>
                    {t.status === 'active' && (
                      <Link to={`/driver/trips/${t.trip_id}/edit`}>
                        <Button size="sm" variant="secondary">Edit</Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
