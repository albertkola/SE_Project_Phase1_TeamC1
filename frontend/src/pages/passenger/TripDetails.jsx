import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight, Calendar, Clock, MapPin, Users, AlertCircle, ArrowLeft,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { getTripById } from '../../api/trips.api';
import { getMyBookings } from '../../api/bookings.api';
import { getRatingsForUser } from '../../api/ratings.api';
import { formatPrice, formatDatePretty, formatTime } from '../../utils/formatPrice';

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [existingBooking, setExistingBooking] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const t = await getTripById(id);
        if (!alive) return;
        setTrip(t);
        if (t?.pickup_points?.length) setSelectedPickup(t.pickup_points[0].pickup_id);

        if (t?.driver_id) {
          try {
            const r = await getRatingsForUser(t.driver_id);
            if (!alive) return;
            setReviews(r?.ratings || []);
            setReviewCount(r?.review_count ?? (r?.ratings?.length || 0));
          } catch {
            // best effort
          }
        }

        if (role === 'passenger') {
          try {
            const myBookings = await getMyBookings();
            if (!alive) return;
            const found = myBookings.find(
              (b) => b.trip_id === Number(id) && ['pending', 'confirmed'].includes(b.status)
            );
            if (found) setExistingBooking(found);
          } catch {
            // best effort
          }
        }
      } catch (err) {
        if (!alive) return;
        const msg = err?.response?.data?.message || 'Failed to load trip';
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, role]);

  const isOwnTrip = trip && user && trip.driver_id === user.user_id;
  const noSeats = trip && Number(trip.available_seats) <= 0;
  const tripNotActive = trip && trip.status !== 'active';

  let blockedMessage = null;
  if (isOwnTrip) blockedMessage = 'This is your own trip.';
  else if (existingBooking) {
    blockedMessage = `You already have a ${existingBooking.status} booking for this trip.`;
  } else if (tripNotActive) blockedMessage = `This trip is ${trip.status}.`;
  else if (noSeats) blockedMessage = 'No seats available for this trip.';

  const canBook = role === 'passenger' && !blockedMessage && !!selectedPickup;

  const handleBook = () => {
    if (!canBook) return;
    navigate('/booking/confirm', {
      state: { tripId: trip.trip_id, pickupId: selectedPickup },
    });
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
        <main className="pt-24 px-grid-3 max-w-3xl mx-auto">
          <div className="bg-surface border border-error rounded-[2px] p-grid-3 flex items-center gap-grid-2 text-error">
            <AlertCircle size={18} />
            <span>{error || 'Trip not found'}</span>
          </div>
          <Button variant="secondary" className="mt-grid-3" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-32">
      <Navbar />

      <main className="pt-20 px-grid-3 max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-grid-3 inline-flex items-center gap-grid-1 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Route + meta */}
        <section className="mt-grid-2 bg-surface border border-border border-l-2 border-l-white rounded-[2px] p-grid-3">
          <div className="flex items-center gap-grid-2 flex-wrap">
            <span className="text-h1 font-bold">{trip.departure_city}</span>
            <ArrowRight size={28} className="text-text-secondary" />
            <span className="text-h1 font-bold">{trip.destination_city}</span>
            <Badge status={trip.status} className="ml-auto">{trip.status}</Badge>
          </div>
          <div className="mt-grid-2 flex items-center gap-grid-3 text-body text-text-secondary flex-wrap">
            <span className="inline-flex items-center gap-grid-1">
              <Calendar size={16} /> {formatDatePretty(trip.departure_date)}
            </span>
            <span className="inline-flex items-center gap-grid-1">
              <Clock size={16} /> {formatTime(trip.departure_time)}
            </span>
            <span className="inline-flex items-center gap-grid-1">
              <Users size={16} />
              {trip.available_seats} of {trip.total_seats} seats left
            </span>
          </div>
          <div className="mt-grid-3 pt-grid-2 border-t border-border flex items-center justify-between">
            <span className="text-small text-text-secondary uppercase tracking-wider">Price per seat</span>
            <span className="text-h1 font-bold">{formatPrice(trip.price_per_seat)}</span>
          </div>
        </section>

        {/* Driver card */}
        <section className="mt-grid-3 bg-surface border border-border rounded-[2px] p-grid-3">
          <h2 className="text-h3 mb-grid-2">Driver</h2>
          <div className="flex items-center gap-grid-2">
            <Avatar
              user={{ full_name: trip.driver_name, profile_picture: trip.driver_avatar }}
              size="lg"
            />
            <div className="flex flex-col">
              <span className="text-h3">{trip.driver_name}</span>
              <div className="flex items-center gap-grid-2">
                <StarRating value={Number(trip.driver_rating || 0)} size="sm" />
                <span className="text-small text-text-secondary">
                  {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="mt-grid-3 pt-grid-2 border-t border-border flex flex-col gap-grid-2">
              {reviews.slice(0, 3).map((r) => (
                <div key={r.rating_id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-grid-2">
                    <StarRating value={r.stars} size="sm" />
                    <span className="text-small text-text-secondary">
                      {r.reviewer_name || 'Anonymous'}
                    </span>
                  </div>
                  {r.review_text && (
                    <p className="text-body text-text-secondary">{r.review_text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pickup points */}
        <section className="mt-grid-3 bg-surface border border-border rounded-[2px] p-grid-3">
          <h2 className="text-h3 mb-grid-2">Pickup point</h2>
          <p className="text-small text-text-secondary mb-grid-2">
            Select where the driver will pick you up.
          </p>
          <div className="flex flex-col gap-grid-1">
            {(trip.pickup_points || []).map((p) => {
              const checked = selectedPickup === p.pickup_id;
              return (
                <label
                  key={p.pickup_id}
                  className={`flex items-center gap-grid-2 p-grid-2 border rounded-[2px] cursor-pointer transition-colors ${
                    checked
                      ? 'border-white bg-surface-elevated'
                      : 'border-border hover:bg-surface-elevated'
                  }`}
                >
                  <input
                    type="radio"
                    name="pickup"
                    value={p.pickup_id}
                    checked={checked}
                    onChange={() => setSelectedPickup(p.pickup_id)}
                    className="accent-white"
                  />
                  <MapPin size={16} className="text-text-secondary" />
                  <span className="flex-1 text-body">{p.location_name}</span>
                  <span className="text-small text-text-secondary inline-flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(p.pickup_time)}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {blockedMessage && (
          <div className="mt-grid-3 bg-surface border border-warning rounded-[2px] p-grid-2 flex items-center gap-grid-2 text-warning">
            <AlertCircle size={16} />
            <span className="text-body">{blockedMessage}</span>
          </div>
        )}
      </main>

      {/* Sticky CTA */}
      {role === 'passenger' && (
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-border px-grid-3 py-grid-2 z-30">
          <div className="max-w-3xl mx-auto">
            <Button
              size="lg"
              className="w-full"
              disabled={!canBook}
              onClick={handleBook}
            >
              {existingBooking ? 'Already booked' : noSeats ? 'No seats available' : 'Book This Seat'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
