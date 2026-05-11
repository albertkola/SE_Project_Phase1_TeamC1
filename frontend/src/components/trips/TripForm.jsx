import { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Clock } from 'lucide-react';
import Button from '../common/Button';
import { ALBANIAN_CITIES } from '../../utils/constants';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const TODAY = (() => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
})();

function selectClass(error) {
  return `h-11 w-full bg-surface border ${error ? 'border-error' : 'border-border'} rounded-[2px] px-grid-2 text-body text-text-primary focus:outline-none focus:border-white transition-colors`;
}

function inputClass(error) {
  return `h-11 w-full bg-surface border ${error ? 'border-error' : 'border-border'} rounded-[2px] px-grid-2 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white transition-colors`;
}

function emptyForm() {
  return {
    departure_city: '',
    destination_city: '',
    departure_date: '',
    departure_time: '',
    total_seats: 4,
    price_per_seat: '',
    pickup_points: [{ location_name: '', pickup_time: '' }],
  };
}

function normalize(initial) {
  if (!initial) return emptyForm();
  return {
    departure_city: initial.departure_city || '',
    destination_city: initial.destination_city || '',
    departure_date: initial.departure_date
      ? String(initial.departure_date).slice(0, 10)
      : '',
    departure_time: initial.departure_time
      ? String(initial.departure_time).slice(0, 5)
      : '',
    total_seats: Number(initial.total_seats) || 4,
    price_per_seat:
      initial.price_per_seat != null && initial.price_per_seat !== ''
        ? String(initial.price_per_seat)
        : '',
    pickup_points:
      Array.isArray(initial.pickup_points) && initial.pickup_points.length > 0
        ? initial.pickup_points.map((p) => ({
          location_name: p.location_name || '',
          pickup_time: p.pickup_time ? String(p.pickup_time).slice(0, 5) : '',
        }))
        : [{ location_name: '', pickup_time: '' }],
  };
}

function validate(form) {
  const errors = {};
  if (!form.departure_city) errors.departure_city = 'Required';
  if (!form.destination_city) errors.destination_city = 'Required';
  if (
    form.departure_city &&
    form.destination_city &&
    form.departure_city.toLowerCase() === form.destination_city.toLowerCase()
  ) {
    errors.destination_city = 'Must be different from origin';
  }
  if (!form.departure_date) errors.departure_date = 'Required';
  else if (form.departure_date < TODAY) errors.departure_date = 'Must be today or later';
  if (!form.departure_time) errors.departure_time = 'Required';
  else if (!TIME_REGEX.test(form.departure_time)) errors.departure_time = 'Use HH:MM';

  const seats = Number(form.total_seats);
  if (!Number.isInteger(seats) || seats < 1 || seats > 8)
    errors.total_seats = 'Between 1 and 8';

  const price = Number(form.price_per_seat);
  if (!Number.isFinite(price) || price < 50 || price > 5000) {
    errors.price_per_seat = 'Between 50 and 5000';
  } else if (price % 10 !== 0) {
    const lower = Math.floor(price / 10) * 10;
    const upper = Math.ceil(price / 10) * 10;
    errors.price_per_seat = `Did you mean ${lower} or ${upper}?`;
  }

  const pickupErrors = [];
  let hasPickupError = false;
  form.pickup_points.forEach((p, i) => {
    const e = {};
    if (!p.location_name?.trim()) {
      e.location_name = 'Required';
      hasPickupError = true;
    }
    if (!p.pickup_time) {
      e.pickup_time = 'Required';
      hasPickupError = true;
    } else if (!TIME_REGEX.test(p.pickup_time)) {
      e.pickup_time = 'Use HH:MM';
      hasPickupError = true;
    }
    pickupErrors[i] = e;
  });
  if (hasPickupError) errors.pickup_points = pickupErrors;
  if (form.pickup_points.length === 0) errors.pickup_points = 'At least one pickup point';

  return errors;
}

export default function TripForm({
  initial,
  onSubmit,
  submitting,
  submitLabel = 'Create Trip',
  disabled = false,
}) {
  const [form, setForm] = useState(() => normalize(initial));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(normalize(initial));
  }, [initial]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const updatePickup = (idx, patch) => {
    setForm((f) => ({
      ...f,
      pickup_points: f.pickup_points.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    }));
  };

  const addPickup = () =>
    setForm((f) => ({
      ...f,
      pickup_points: [...f.pickup_points, { location_name: '', pickup_time: '' }],
    }));

  const removePickup = (idx) =>
    setForm((f) => ({
      ...f,
      pickup_points: f.pickup_points.filter((_, i) => i !== idx),
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const payload = {
      departure_city: form.departure_city,
      destination_city: form.destination_city,
      departure_date: form.departure_date,
      departure_time: form.departure_time,
      total_seats: Number(form.total_seats),
      price_per_seat: Number(form.price_per_seat),
      pickup_points: form.pickup_points.map((p) => ({
        location_name: p.location_name.trim(),
        pickup_time: p.pickup_time,
      })),
    };
    onSubmit?.(payload);
  };

  const pickupErrs = Array.isArray(errors.pickup_points) ? errors.pickup_points : [];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-grid-3">
      {/* Origin / destination */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-grid-2">
        <div className="flex flex-col gap-grid-1">
          <label className="text-small text-text-secondary uppercase tracking-wider">From</label>
          <select
            value={form.departure_city}
            onChange={(e) => update({ departure_city: e.target.value })}
            disabled={disabled}
            className={selectClass(errors.departure_city)}
          >
            <option value="">Select city</option>
            {ALBANIAN_CITIES.filter((c) => c !== form.destination_city).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.departure_city && (
            <span className="text-small text-error">{errors.departure_city}</span>
          )}
        </div>

        <div className="flex flex-col gap-grid-1">
          <label className="text-small text-text-secondary uppercase tracking-wider">To</label>
          <select
            value={form.destination_city}
            onChange={(e) => update({ destination_city: e.target.value })}
            disabled={disabled}
            className={selectClass(errors.destination_city)}
          >
            <option value="">Select city</option>
            {ALBANIAN_CITIES.filter((c) => c !== form.departure_city).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.destination_city && (
            <span className="text-small text-error">{errors.destination_city}</span>
          )}
        </div>
      </div>

      {/* Date / time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-grid-2">
        <div className="flex flex-col gap-grid-1">
          <label className="text-small text-text-secondary uppercase tracking-wider">Date</label>
          <input
            type="date"
            min={TODAY}
            value={form.departure_date}
            onChange={(e) => update({ departure_date: e.target.value })}
            disabled={disabled}
            className={inputClass(errors.departure_date)}
            style={{ colorScheme: 'dark' }}
          />
          {errors.departure_date && (
            <span className="text-small text-error">{errors.departure_date}</span>
          )}
        </div>

        <div className="flex flex-col gap-grid-1">
          <label className="text-small text-text-secondary uppercase tracking-wider">
            Departure time
          </label>
          <input
            type="time"
            value={form.departure_time}
            onChange={(e) => update({ departure_time: e.target.value })}
            disabled={disabled}
            className={inputClass(errors.departure_time)}
            style={{ colorScheme: 'dark' }}
          />
          {errors.departure_time && (
            <span className="text-small text-error">{errors.departure_time}</span>
          )}
        </div>
      </div>

      {/* Seats / price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-grid-2">
        <div className="flex flex-col gap-grid-1">
          <label className="text-small text-text-secondary uppercase tracking-wider">Seats</label>
          <input
            type="number"
            min="1"
            max="8"
            step="1"
            value={form.total_seats}
            onChange={(e) => update({ total_seats: e.target.value })}
            disabled={disabled}
            className={inputClass(errors.total_seats)}
          />
          {errors.total_seats && (
            <span className="text-small text-error">{errors.total_seats}</span>
          )}
        </div>

        <div className="flex flex-col gap-grid-1">
          <label className="text-small text-text-secondary uppercase tracking-wider">
            Price per seat
          </label>
          <div className="relative">
            <input
              type="number"
              min="50"
              max="5000"
              step="10"
              value={form.price_per_seat}
              onChange={(e) => update({ price_per_seat: e.target.value })}
              placeholder="e.g. 800"
              disabled={disabled}
              className={`${inputClass(errors.price_per_seat)} pr-12`}
            />
            <span className="absolute right-grid-2 top-1/2 -translate-y-1/2 text-small text-text-secondary uppercase tracking-wider">
              ALL
            </span>
          </div>
          {errors.price_per_seat && (
            <span className="text-small text-error">{errors.price_per_seat}</span>
          )}
        </div>
      </div>

      {/* Pickup points */}
      <div className="bg-surface border border-border rounded-[2px] p-grid-3">
        <div className="flex items-center justify-between mb-grid-2">
          <div>
            <h3 className="text-h3">Pickup points</h3>
            <p className="text-small text-text-secondary">
              Where passengers can meet you along the route.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-grid-2">
          {form.pickup_points.map((p, idx) => {
            const e = pickupErrs[idx] || {};
            return (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-[1fr_140px_40px] gap-grid-2 items-start"
              >
                <div className="flex flex-col gap-grid-1">
                  <div className="relative">
                    <MapPin
                      size={14}
                      className="absolute left-grid-2 top-1/2 -translate-y-1/2 text-text-muted"
                    />
                    <input
                      type="text"
                      placeholder="e.g. Bus Terminal"
                      value={p.location_name}
                      onChange={(ev) => updatePickup(idx, { location_name: ev.target.value })}
                      disabled={disabled}
                      className={`${inputClass(e.location_name)} pl-grid-5`}
                    />
                  </div>
                  {e.location_name && (
                    <span className="text-small text-error">{e.location_name}</span>
                  )}
                </div>

                <div className="flex flex-col gap-grid-1">
                  <div className="relative">
                    <Clock
                      size={14}
                      className="absolute left-grid-2 top-1/2 -translate-y-1/2 text-text-muted z-10"
                    />
                    <input
                      type="time"
                      value={p.pickup_time}
                      onChange={(ev) => updatePickup(idx, { pickup_time: ev.target.value })}
                      disabled={disabled}
                      className={`${inputClass(e.pickup_time)} pl-grid-5`}
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                  {e.pickup_time && (
                    <span className="text-small text-error">{e.pickup_time}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removePickup(idx)}
                  disabled={disabled || form.pickup_points.length <= 1}
                  className="h-11 w-10 flex items-center justify-center rounded-[2px] border border-border text-text-secondary hover:text-error hover:border-error disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Remove pickup point"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-grid-2"
          disabled={disabled}
          onClick={addPickup}
        >
          <Plus size={14} /> Add Pickup Point
        </Button>

        {typeof errors.pickup_points === 'string' && (
          <p className="mt-grid-2 text-small text-error">{errors.pickup_points}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={submitting}
        disabled={disabled}
      >
        {submitLabel}
      </Button>
    </form>
  );
}
