import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Filter, AlertCircle } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import TripCard from '../../components/trips/TripCard';
import { ALBANIAN_CITIES } from '../../utils/constants';
import useTrips from '../../hooks/useTrips';

const TODAY = (() => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
})();

function selectClasses(hasError = false) {
  return `h-11 w-full bg-surface border ${hasError ? 'border-error' : 'border-border'} rounded-[2px] px-grid-2 text-body text-text-primary focus:outline-none focus:border-white transition-colors appearance-none`;
}

function CityDropdown({ label, value, onChange, exclude }) {
  return (
    <div className="flex flex-col gap-grid-1 w-full">
      <label className="text-small text-text-secondary uppercase tracking-wider">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={selectClasses()}
      >
        <option value="">Any city</option>
        {ALBANIAN_CITIES.filter((c) => c !== exclude).map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border border-l-2 border-l-[#333333] rounded-[2px] p-grid-3 animate-pulse">
      <div className="h-6 w-2/3 bg-surface-elevated rounded-[2px] mb-grid-2" />
      <div className="h-4 w-1/3 bg-surface-elevated rounded-[2px] mb-grid-2" />
      <div className="h-4 w-1/2 bg-surface-elevated rounded-[2px] mb-grid-3" />
      <div className="flex justify-between">
        <div className="h-8 w-24 bg-surface-elevated rounded-[2px]" />
        <div className="h-8 w-24 bg-surface-elevated rounded-[2px]" />
      </div>
    </div>
  );
}

export default function SearchTrips() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [origin, setOrigin] = useState(searchParams.get('origin') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [seats, setSeats] = useState(searchParams.get('seats') || '');
  const [pickup, setPickup] = useState(searchParams.get('pickup') || '');

  const queryParams = useMemo(
    () => ({ origin, destination, date, maxPrice, seats, pickup }),
    [origin, destination, date, maxPrice, seats, pickup]
  );

  const { results, loading, error, setParams } = useTrips(queryParams);

  useEffect(() => {
    setParams(queryParams);
    const next = new URLSearchParams();
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v) next.set(k, v);
    });
    setSearchParams(next, { replace: true });
  }, [queryParams, setParams, setSearchParams]);

  const clearFilters = () => {
    setMaxPrice('');
    setSeats('');
    setPickup('');
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="pt-20 px-grid-3 pb-grid-6 max-w-7xl mx-auto">
        {/* Top search bar */}
        <section className="bg-surface border border-border rounded-[2px] p-grid-3 mt-grid-3">
          <div className="flex items-center gap-grid-2 mb-grid-2">
            <Search size={18} className="text-text-secondary" />
            <h1 className="text-h2">Find a Ride</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-grid-2">
            <CityDropdown
              label="From"
              value={origin}
              onChange={setOrigin}
              exclude={destination}
            />
            <CityDropdown
              label="To"
              value={destination}
              onChange={setDestination}
              exclude={origin}
            />
            <div className="flex flex-col gap-grid-1 w-full">
              <label className="text-small text-text-secondary uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={date}
                min={TODAY}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 w-full bg-surface border border-border rounded-[2px] px-grid-2 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white transition-colors"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        </section>

        {/* Two-column layout */}
        <section className="mt-grid-3 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-grid-3">
          {/* Filter sidebar */}
          <aside className="bg-surface border border-border rounded-[2px] p-grid-3 h-fit lg:sticky lg:top-20">
            <div className="flex items-center justify-between mb-grid-2">
              <div className="flex items-center gap-grid-1">
                <Filter size={16} className="text-text-secondary" />
                <h2 className="text-h3">Filters</h2>
              </div>
              {(maxPrice || seats || pickup) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-small text-text-secondary hover:text-text-primary transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-col gap-grid-3">
              <div>
                <label className="text-small text-text-secondary uppercase tracking-wider">
                  Max Price (ALL)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Any"
                  className="mt-grid-1 h-10 w-full bg-surface border border-border rounded-[2px] px-grid-2 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white transition-colors"
                />
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={maxPrice || 0}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="mt-grid-1 w-full accent-white"
                />
                <div className="flex justify-between text-small text-text-muted">
                  <span>0</span>
                  <span>5,000</span>
                </div>
              </div>

              <div>
                <label className="text-small text-text-secondary uppercase tracking-wider">
                  Min Seats
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  placeholder="Any"
                  className="mt-grid-1 h-10 w-full bg-surface border border-border rounded-[2px] px-grid-2 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="text-small text-text-secondary uppercase tracking-wider">
                  Pickup Point
                </label>
                <div className="relative mt-grid-1">
                  <MapPin
                    size={14}
                    className="absolute left-grid-2 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    type="text"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="e.g. Bus Terminal"
                    className="h-10 w-full bg-surface border border-border rounded-[2px] pl-grid-5 pr-grid-2 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex flex-col gap-grid-2">
            <div className="flex items-center justify-between">
              <h2 className="text-h3">
                {loading ? 'Searching…' : `${results.length} ${results.length === 1 ? 'trip' : 'trips'} found`}
              </h2>
            </div>

            {error && (
              <div className="bg-surface border border-error rounded-[2px] p-grid-2 flex items-center gap-grid-2 text-error text-body">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col gap-grid-2">
                {[0, 1, 2].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="bg-surface border border-border rounded-[2px] p-grid-5 text-center">
                <Search size={48} className="mx-auto text-text-muted mb-grid-2" />
                <p className="text-h3 text-text-primary mb-grid-1">No trips found for this route</p>
                <p className="text-body text-text-secondary">
                  Try a different city, date, or relax your filters.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-grid-2">
                {results.map((trip) => (
                  <TripCard key={trip.trip_id} trip={trip} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
