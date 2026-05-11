import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import TripForm from '../../components/trips/TripForm';
import { createTrip } from '../../api/trips.api';

export default function CreateTrip() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await createTrip(payload);
      toast.success('Trip created');
      navigate('/driver/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors?.[0]?.message
        || 'Failed to create trip';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

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

        <h1 className="text-h1 mt-grid-2 mb-grid-3">Create a trip</h1>

        <TripForm
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Create Trip"
        />
      </main>
    </div>
  );
}
