import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users as UsersIcon, Calendar, Ticket, AlertCircle, ArrowRight,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import { getStats } from '../../api/admin.api';
import { searchTrips } from '../../api/trips.api';
import { formatDatePretty, formatTime, formatPrice } from '../../utils/formatPrice';

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="bg-surface border border-border rounded-[2px] p-grid-3">
      <div className="flex items-center justify-between">
        <span className="text-small text-text-secondary uppercase tracking-wider">{label}</span>
        <div
          className="w-10 h-10 flex items-center justify-center rounded-[2px]"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: accent || '#FFFFFF' }}
        >
          {icon}
        </div>
      </div>
      <div className="mt-grid-2 text-h1 font-bold">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [s, t] = await Promise.all([
          getStats(),
          searchTrips().then((r) => r.trips).catch(() => []),
        ]);
        if (!alive) return;
        setStats(s);
        const sorted = [...t].sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        setRecent(sorted.slice(0, 10));
      } catch (err) {
        if (!alive) return;
        setError(err?.response?.data?.message || 'Failed to load admin stats');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main className="pt-20 px-grid-3 max-w-7xl mx-auto pb-grid-6">
        <h1 className="text-h1 mt-grid-3 mb-grid-3">Admin Panel</h1>

        {error && (
          <div className="bg-surface border border-error rounded-[2px] p-grid-2 flex items-center gap-grid-2 text-error mb-grid-3">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-grid-5"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Stats row */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-grid-2">
              <StatCard
                label="Total Users"
                value={stats?.users?.total ?? 0}
                icon={<UsersIcon size={20} />}
              />
              <StatCard
                label="Total Trips"
                value={stats?.trips?.total ?? 0}
                icon={<Calendar size={20} />}
              />
              <StatCard
                label="Total Bookings"
                value={stats?.bookings?.total ?? 0}
                icon={<Ticket size={20} />}
              />
            </section>

            {/* Status breakdowns + quick links */}
            <section className="mt-grid-3 grid grid-cols-1 lg:grid-cols-3 gap-grid-2">
              <div className="bg-surface border border-border rounded-[2px] p-grid-3">
                <h3 className="text-h3 mb-grid-2">Users</h3>
                <ul className="flex flex-col gap-grid-1 text-body">
                  <li className="flex justify-between">
                    <span className="text-text-secondary">Drivers</span>
                    <span>{stats?.users?.drivers ?? 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-secondary">Passengers</span>
                    <span>{stats?.users?.passengers ?? 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-secondary">Admins</span>
                    <span>{stats?.users?.admins ?? 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-secondary">Deactivated</span>
                    <span>{stats?.users?.deactivated ?? 0}</span>
                  </li>
                </ul>
                <Link
                  to="/admin/users"
                  className="mt-grid-3 inline-flex items-center gap-grid-1 text-small text-text-secondary hover:text-text-primary transition-colors"
                >
                  Manage users <ArrowRight size={12} />
                </Link>
              </div>

              <div className="bg-surface border border-border rounded-[2px] p-grid-3">
                <h3 className="text-h3 mb-grid-2">Trips</h3>
                <ul className="flex flex-col gap-grid-1 text-body">
                  <li className="flex justify-between">
                    <span className="text-text-secondary">Active</span>
                    <span>{stats?.trips?.active ?? 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-secondary">Completed</span>
                    <span>{stats?.trips?.completed ?? 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-secondary">Cancelled</span>
                    <span>{stats?.trips?.cancelled ?? 0}</span>
                  </li>
                </ul>
                <Link
                  to="/admin/trips"
                  className="mt-grid-3 inline-flex items-center gap-grid-1 text-small text-text-secondary hover:text-text-primary transition-colors"
                >
                  Manage trips <ArrowRight size={12} />
                </Link>
              </div>

              <div className="bg-surface border border-border rounded-[2px] p-grid-3">
                <h3 className="text-h3 mb-grid-2">Bookings</h3>
                <ul className="flex flex-col gap-grid-1 text-body">
                  <li className="flex justify-between">
                    <span className="text-text-secondary">Pending</span>
                    <span>{stats?.bookings?.pending ?? 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-secondary">Confirmed</span>
                    <span>{stats?.bookings?.confirmed ?? 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-secondary">Rejected</span>
                    <span>{stats?.bookings?.rejected ?? 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-text-secondary">Cancelled</span>
                    <span>{stats?.bookings?.cancelled ?? 0}</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Recent activity */}
            <section className="mt-grid-3 bg-surface border border-border rounded-[2px] overflow-hidden">
              <div className="px-grid-3 py-grid-2 border-b border-border">
                <h2 className="text-h3">Recent activity</h2>
                <p className="text-small text-text-secondary mt-1">
                  Latest active trips on the platform.
                </p>
              </div>

              {recent.length === 0 ? (
                <div className="px-grid-3 py-grid-5 text-center text-text-secondary text-body">
                  No recent activity
                </div>
              ) : (
                <div>
                  <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-grid-2 px-grid-3 py-grid-2 border-b border-border text-small text-text-secondary uppercase tracking-wider">
                    <span>Route</span>
                    <span>Driver</span>
                    <span>Date</span>
                    <span>Price</span>
                    <span>Status</span>
                  </div>
                  {recent.map((t) => (
                    <div
                      key={t.trip_id}
                      className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-grid-2 px-grid-3 py-grid-2 border-b border-border last:border-b-0 items-center"
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
                      <span className="text-small text-text-secondary">
                        {formatDatePretty(t.departure_date)} {formatTime(t.departure_time)}
                      </span>
                      <span className="text-body">{formatPrice(t.price_per_seat)}</span>
                      <span><Badge status={t.status}>{t.status}</Badge></span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
