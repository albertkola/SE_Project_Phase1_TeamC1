import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Calendar, Clock, Users, Plus, Star, AlertCircle, Inbox, MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import BookingRequest from '../../components/bookings/BookingRequest';
import { useAuth } from '../../context/AuthContext';
import { getDriverTrips, cancelTrip } from '../../api/trips.api';
import {
  getTripBookings, approveBooking, rejectBooking,
} from '../../api/bookings.api';
import { formatDatePretty, formatTime, formatPrice } from '../../utils/formatPrice';

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-surface border border-border rounded-[2px] p-grid-3 flex items-center gap-grid-2">
      <div className="w-10 h-10 flex items-center justify-center bg-surface-elevated rounded-[2px] text-text-primary">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-small text-text-secondary uppercase tracking-wider">{label}</span>
        <span className="text-h2 font-bold">{value}</span>
      </div>
    </div>
  );
}

export default function DriverDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]); // pending across active trips
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [confirmCancelTripId, setConfirmCancelTripId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const driverTrips = await getDriverTrips();
      setTrips(driverTrips);

      const active = driverTrips.filter((t) => t.status === 'active');
      const allBookingsRes = await Promise.all(
        active.map((t) =>
          getTripBookings(t.trip_id)
            .then((bs) => bs.map((b) => ({ ...b, trip: t })))
            .catch(() => [])
        )
      );
      const pending = allBookingsRes
        .flat()
        .filter((b) => b.status === 'pending')
        .sort((a, b) => new Date(b.booked_at) - new Date(a.booked_at));
      setBookings(pending);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const activeTrips = useMemo(
    () => trips.filter((t) => t.status === 'active'),
    [trips]
  );

  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const totalBookings = trips.reduce(
      (sum, t) => sum + Math.max(0, Number(t.total_seats) - Number(t.available_seats)),
      0
    );
    const avg = Number(user?.average_rating || 0);
    return { totalTrips, totalBookings, avgRating: avg };
  }, [trips, user]);

  const handleApprove = async (b) => {
    try {
      await approveBooking(b.booking_id);
      toast.success('Booking approved');
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Approve failed');
    }
  };

  const handleReject = async (b) => {
    try {
      await rejectBooking(b.booking_id);
      toast.success('Booking rejected');
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reject failed');
    }
  };

  const handleCancelTrip = async () => {
    if (!confirmCancelTripId || cancelling) return;
    setCancelling(true);
    try {
      await cancelTrip(confirmCancelTripId);
      toast.success('Trip cancelled');
      setConfirmCancelTripId(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  };

  const cancelTarget = trips.find((t) => t.trip_id === confirmCancelTripId);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main className="pt-20 px-grid-3 max-w-7xl mx-auto pb-grid-6">
        <div className="mt-grid-3 flex items-center justify-between gap-grid-2 flex-wrap">
          <h1 className="text-h1">Driver Dashboard</h1>
          <Button variant="primary" onClick={() => navigate('/driver/trips/create')}>
            <Plus size={16} /> Create Trip
          </Button>
        </div>

        {/* Stats */}
        <section className="mt-grid-3 grid grid-cols-1 sm:grid-cols-3 gap-grid-2">
          <StatCard
            label="Total Trips"
            value={stats.totalTrips}
            icon={<Calendar size={20} />}
          />
          <StatCard
            label="Total Bookings"
            value={stats.totalBookings}
            icon={<Users size={20} />}
          />
          <StatCard
            label="Avg Rating"
            value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}
            icon={<Star size={20} />}
          />
        </section>

        {error && (
          <div className="mt-grid-3 bg-surface border border-error rounded-[2px] p-grid-2 flex items-center gap-grid-2 text-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-grid-5"><Spinner size="lg" /></div>
        ) : (
          <section className="mt-grid-3 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-grid-3">
            {/* Active trips */}
            <div>
              <div className="flex items-center justify-between mb-grid-2">
                <h2 className="text-h2">Active Trips</h2>
                <Link
                  to="/driver/history"
                  className="text-small text-text-secondary hover:text-text-primary transition-colors"
                >
                  View all history
                </Link>
              </div>

              {activeTrips.length === 0 ? (
                <div className="bg-surface border border-border rounded-[2px] p-grid-5 text-center">
                  <Calendar size={40} className="mx-auto text-text-muted mb-grid-2" />
                  <p className="text-h3 mb-grid-1">No active trips</p>
                  <p className="text-body text-text-secondary mb-grid-3">
                    Create your first trip to start accepting passengers.
                  </p>
                  <Button onClick={() => navigate('/driver/trips/create')}>
                    <Plus size={16} /> Create Trip
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-grid-2">
                  {activeTrips.map((t) => {
                    const seatsLeft = Number(t.available_seats);
                    const seatsTotal = Number(t.total_seats);
                    return (
                      <div
                        key={t.trip_id}
                        className="bg-surface border border-border border-l-2 border-l-white rounded-[2px] p-grid-3"
                      >
                        <div className="flex items-center justify-between gap-grid-2 flex-wrap">
                          <div className="flex items-center gap-grid-2 flex-wrap">
                            <span className="text-h3 font-semibold">{t.departure_city}</span>
                            <ArrowRight size={18} className="text-text-secondary" />
                            <span className="text-h3 font-semibold">{t.destination_city}</span>
                          </div>
                          <Badge status={t.status}>{t.status}</Badge>
                        </div>

                        <div className="mt-grid-2 grid grid-cols-1 sm:grid-cols-3 gap-grid-2 text-small text-text-secondary">
                          <span className="inline-flex items-center gap-grid-1">
                            <Calendar size={14} /> {formatDatePretty(t.departure_date)}
                          </span>
                          <span className="inline-flex items-center gap-grid-1">
                            <Clock size={14} /> {formatTime(t.departure_time)}
                          </span>
                          <span className="inline-flex items-center gap-grid-1">
                            <Users size={14} /> {seatsLeft}/{seatsTotal} seats left
                          </span>
                        </div>

                        <div className="mt-grid-2 pt-grid-2 border-t border-border flex items-center justify-between gap-grid-2 flex-wrap">
                          <span className="text-body font-bold">{formatPrice(t.price_per_seat)}</span>
                          <div className="flex items-center gap-grid-1">
                            <Link to={`/trips/${t.trip_id}`}>
                              <Button size="sm" variant="ghost">View</Button>
                            </Link>
                            <Link to={`/driver/trips/${t.trip_id}/edit`}>
                              <Button size="sm" variant="secondary">Edit</Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setConfirmCancelTripId(t.trip_id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending requests */}
            <aside>
              <div className="flex items-center justify-between mb-grid-2">
                <h2 className="text-h2">Requests</h2>
                {bookings.length > 0 && (
                  <Badge status="pending">{bookings.length} pending</Badge>
                )}
              </div>

              {bookings.length === 0 ? (
                <div className="bg-surface border border-border rounded-[2px] p-grid-3 text-center">
                  <Inbox size={32} className="mx-auto text-text-muted mb-grid-2" />
                  <p className="text-body text-text-primary">No pending requests</p>
                  <p className="text-small text-text-secondary mt-grid-1">
                    New booking requests will appear here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-grid-2">
                  {bookings.map((b) => (
                    <div key={b.booking_id} className="flex flex-col gap-grid-1">
                      <div className="text-small text-text-secondary inline-flex items-center gap-grid-1">
                        <MapPin size={12} />
                        {b.trip?.departure_city} → {b.trip?.destination_city}
                        {b.trip?.departure_date && (
                          <> · {formatDatePretty(b.trip.departure_date)}</>
                        )}
                      </div>
                      <BookingRequest
                        booking={b}
                        onApprove={() => handleApprove(b)}
                        onReject={() => handleReject(b)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </section>
        )}
      </main>

      <Modal
        open={!!confirmCancelTripId}
        onClose={() => !cancelling && setConfirmCancelTripId(null)}
        title="Cancel trip?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmCancelTripId(null)} disabled={cancelling}>
              Keep trip
            </Button>
            <Button variant="danger" onClick={handleCancelTrip} loading={cancelling}>
              Yes, cancel
            </Button>
          </>
        }
      >
        {cancelTarget && (
          <p className="text-body text-text-secondary">
            Cancel{' '}
            <span className="text-text-primary">
              {cancelTarget.departure_city} → {cancelTarget.destination_city}
            </span>{' '}
            on {formatDatePretty(cancelTarget.departure_date)}? Confirmed passengers will be
            notified and any pending requests will be rejected.
          </p>
        )}
      </Modal>
    </div>
  );
}
