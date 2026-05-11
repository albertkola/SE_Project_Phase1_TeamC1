import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import TripForm from '../../components/trips/TripForm';
import { getTripById, editTrip } from '../../api/trips.api';
import { getTripBookings } from '../../api/bookings.api';

export default function EditTrip() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [hasBookings, setHasBookings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const t = await getTripById(id);
        if (!alive) return;
        setTrip(t);
        try {
          const bookings = await getTripBookings(id);
          if (!alive) return;
          const blocking = bookings.filter((b) =>
            ['pending', 'confirmed'].includes(b.status)
          );
          setHasBookings(blocking.length > 0);
        } catch {
          // best effort
        }
      } catch (err) {
        if (!alive) return;
        setError(err?.response?.data?.message || 'Failed to load trip');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const handleSubmit = async (payload) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await editTrip(id, payload);
      toast.success('Trip updated');
      navigate('/driver/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors?.[0]?.message
        || 'Failed to update trip';
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
        <main className="pt-24 px-grid-3 max-w-3xl mx-auto">
          <div className="bg-surface border border-error rounded-[2px] p-grid-3 flex items-center gap-grid-2 text-error">
            <AlertCircle size={18} />
            <span>{error || 'Trip not found'}</span>
          </div>
          <Button variant="secondary" className="mt-grid-3" onClick={() => navigate('/driver/dashboard')}>
            <ArrowLeft size={16} /> Back to dashboard
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main className="pt-20 px-grid-3 max-w-3xl mx-auto pb-grid-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-grid-3 inline-flex items-center gap-grid-1 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="text-h1 mt-grid-2 mb-grid-3">Edit trip</h1>

        {hasBookings && (
          <div
            className="mb-grid-3 bg-surface border rounded-[2px] p-grid-3 flex items-start gap-grid-2"
            style={{ borderColor: '#FFB300' }}
          >
            <Lock size={18} className="text-warning mt-1 shrink-0" />
            <div>
              <p className="text-body text-warning font-semibold">
                This trip has active bookings.
              </p>
              <p className="text-small text-text-secondary mt-1">
                Edits are disabled to protect passengers who already booked. Cancel the trip
                from the dashboard if changes are required.
              </p>
            </div>
          </div>
        )}

        <TripForm
          initial={trip}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Save changes"
          disabled={hasBookings}
        />
      </main>
    </div>
  );
}
