import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Users } from 'lucide-react';
import Avatar from '../common/Avatar';
import StarRating from '../common/StarRating';
import Button from '../common/Button';
import { formatPrice, formatDatePretty, formatTime } from '../../utils/formatPrice';

export default function TripCard({ trip, onClick }) {
  const navigate = useNavigate();
  if (!trip) return null;

  const handleView = () => {
    if (onClick) onClick(trip);
    else navigate(`/trips/${trip.trip_id}`);
  };

  const seatsLeft = Number(trip.available_seats ?? 0);
  const seatsTone = seatsLeft <= 0
    ? 'text-error border-error'
    : seatsLeft <= 2
      ? 'text-warning border-warning'
      : 'text-success border-success';

  return (
    <div
      onClick={handleView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleView();
        }
      }}
      className="group bg-surface border border-border border-l-2 border-l-white rounded-[2px] p-grid-3 cursor-pointer transition-transform duration-150 hover:bg-surface-elevated hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-grid-2 text-text-primary">
        <span className="text-h2 font-semibold truncate">{trip.departure_city}</span>
        <ArrowRight size={20} className="text-text-secondary shrink-0" />
        <span className="text-h2 font-semibold truncate">{trip.destination_city}</span>
      </div>

      <div className="mt-grid-1 flex items-center gap-grid-3 text-small text-text-secondary">
        <span className="inline-flex items-center gap-grid-1">
          <Calendar size={14} />
          {formatDatePretty(trip.departure_date)}
        </span>
        <span className="inline-flex items-center gap-grid-1">
          <Clock size={14} />
          {formatTime(trip.departure_time)}
        </span>
      </div>

      <div className="mt-grid-2 flex items-center gap-grid-2">
        <Avatar
          user={{ full_name: trip.driver_name, profile_picture: trip.driver_avatar }}
          size="sm"
        />
        <div className="flex flex-col min-w-0">
          <span className="text-body text-text-primary truncate">
            {trip.driver_name || 'Driver'}
          </span>
          <StarRating value={Number(trip.driver_rating || 0)} size="sm" />
        </div>
      </div>

      <div className="mt-grid-3 pt-grid-2 border-t border-border flex items-center justify-between gap-grid-2">
        <div className="flex items-center gap-grid-2">
          <span className="text-h2 font-bold text-text-primary">
            {formatPrice(trip.price_per_seat)}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-grid-1 py-[2px] text-small font-semibold uppercase tracking-wider rounded-[2px] border bg-transparent ${seatsTone}`}
          >
            <Users size={12} />
            {seatsLeft} {seatsLeft === 1 ? 'seat' : 'seats'} left
          </span>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={(e) => {
            e.stopPropagation();
            handleView();
          }}
          className="opacity-90 group-hover:opacity-100"
        >
          View Trip
        </Button>
      </div>
    </div>
  );
}
