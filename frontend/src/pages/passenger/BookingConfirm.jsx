import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Calendar, Clock, MapPin, AlertCircle, CheckCircle2, ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { getTripById } from '../../api/trips.api';
import { createBooking } from '../../api/bookings.api';
import { formatPrice, formatDatePretty, formatTime } from '../../utils/formatPrice';

export default function BookingConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripId, pickupId } = location.state || {};

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    if (!tripId || !pickupId) {
      navigate('/search', { replace: true });
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const t = await getTripById(tripId);
        if (!alive) return;
        setTrip(t);
      } catch (err) {
        if (!alive) return;
        setError(err?.response?.data?.message || 'Failed to load trip');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [tripId, pickupId, navigate]);

  const pickup = useMemo(() => {
    if (!trip) return null;
    return (trip.pickup_points || []).find((p) => p.pickup_id === pickupId) || null;
  }, [trip, pickupId]);

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const booking = await createBooking({ trip_id: tripId, pickup_id: pickupId });
      setConfirmed(booking);
      toast.success('Booking submitted — awaiting driver approval');
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors?.[0]?.message
        || 'Failed to create booking';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text-primary">
        <Navbar />
        <div className="pt-24 flex justify-center"><Spinner size="lg" /></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-background text-text-primary">
        <Navbar />
        <main className="pt-24 px-grid-3 max-w-2xl mx-auto">
          <div className="bg-surface border border-error rounded-[2px] p-grid-3 flex items-center gap-grid-2 text-error">
            <AlertCircle size={18} />
            <span>{error || 'Trip not found'}</span>
          </div>
          <Button variant="secondary" className="mt-grid-3" onClick={() => navigate('/search')}>
            <ArrowLeft size={16} /> Back to search
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main className="pt-20 px-grid-3 max-w-2xl mx-auto pb-grid-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-grid-3 inline-flex items-center gap-grid-1 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="text-h1 mt-grid-2 mb-grid-3">Confirm your booking</h1>

        {/* Trip summary card (read-only) */}
        <section className="bg-surface border border-border border-l-2 border-l-white rounded-[2px] p-grid-3">
          <div className="flex items-center gap-grid-2 flex-wrap">
            <span className="text-h2 font-semibold">{trip.departure_city}</span>
            <ArrowRight size={20} className="text-text-secondary" />
            <span className="text-h2 font-semibold">{trip.destination_city}</span>
          </div>

          <div className="mt-grid-2 grid grid-cols-1 sm:grid-cols-2 gap-grid-2 text-small text-text-secondary">
            <span className="inline-flex items-center gap-grid-1">
              <Calendar size={14} /> {formatDatePretty(trip.departure_date)}
            </span>
            <span className="inline-flex items-center gap-grid-1">
              <Clock size={14} /> {formatTime(trip.departure_time)}
            </span>
          </div>

          <div className="mt-grid-3 pt-grid-2 border-t border-border">
            <div className="text-small text-text-secondary uppercase tracking-wider mb-grid-1">
              Driver
            </div>
            <div className="text-body">{trip.driver_name}</div>
          </div>

          <div className="mt-grid-2 pt-grid-2 border-t border-border">
            <div className="text-small text-text-secondary uppercase tracking-wider mb-grid-1">
              Pickup point
            </div>
            {pickup ? (
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-grid-1 text-body">
                  <MapPin size={14} className="text-text-secondary" />
                  {pickup.location_name}
                </span>
                <span className="text-small text-text-secondary inline-flex items-center gap-1">
                  <Clock size={12} /> {formatTime(pickup.pickup_time)}
                </span>
              </div>
            ) : (
              <div className="text-text-secondary text-small">Not selected</div>
            )}
          </div>

          <div className="mt-grid-3 pt-grid-2 border-t border-border flex items-center justify-between">
            <span className="text-small text-text-secondary uppercase tracking-wider">
              Total
            </span>
            <span className="text-h1 font-bold">{formatPrice(trip.price_per_seat)}</span>
          </div>
        </section>

        {confirmed ? (
          <section
            className="mt-grid-3 bg-surface border rounded-[2px] p-grid-3"
            style={{ borderColor: '#FFB300' }}
          >
            <div className="flex items-center gap-grid-2 mb-grid-1">
              <CheckCircle2 size={20} className="text-warning" />
              <h2 className="text-h3 text-warning">Awaiting driver approval</h2>
            </div>
            <p className="text-body text-text-secondary">
              Your booking request was submitted successfully. You'll get a notification
              when the driver approves or rejects it.
            </p>
            <div className="mt-grid-3 flex items-center gap-grid-2">
              <Button variant="primary" onClick={() => navigate('/bookings')}>
                View my bookings
              </Button>
              <Button variant="secondary" onClick={() => navigate('/search')}>
                Find another ride
              </Button>
            </div>
          </section>
        ) : (
          <Button
            size="lg"
            className="w-full mt-grid-3"
            loading={submitting}
            onClick={handleConfirm}
          >
            Confirm Booking
          </Button>
        )}
      </main>
    </div>
  );
}
