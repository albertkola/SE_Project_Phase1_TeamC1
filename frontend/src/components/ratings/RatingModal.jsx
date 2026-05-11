import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import StarRating from '../common/StarRating';
import Button from '../common/Button';
import { submitRating } from '../../api/ratings.api';
import { formatDatePretty } from '../../utils/formatPrice';

export default function RatingModal({
  open,
  onClose,
  trip,
  revieweeId,
  onSubmitted,
}) {
  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStars(0);
      setReviewText('');
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!trip?.trip_id) return;
    if (stars < 1) {
      toast.error('Pick a star rating first');
      return;
    }
    setSubmitting(true);
    try {
      const rating = await submitRating({
        trip_id: trip.trip_id,
        reviewee_id: revieweeId,
        stars,
        review_text: reviewText,
      });
      onSubmitted?.(rating);
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors?.[0]?.message
        || 'Failed to submit rating';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !submitting && onClose?.()}
      title="Rate this trip"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            Submit rating
          </Button>
        </>
      }
    >
      {trip && (
        <div className="mb-grid-3">
          <div className="text-h3 text-text-primary">
            {trip.departure_city} → {trip.destination_city}
          </div>
          <div className="text-small text-text-secondary mt-1">
            {formatDatePretty(trip.departure_date)}
            {trip.driver_name && <> · with {trip.driver_name}</>}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-grid-3">
        <div>
          <label className="text-small text-text-secondary uppercase tracking-wider block mb-grid-1">
            Your rating
          </label>
          <StarRating
            value={stars}
            onChange={setStars}
            interactive
            size="lg"
          />
        </div>

        <div>
          <label className="text-small text-text-secondary uppercase tracking-wider block mb-grid-1">
            Review (optional)
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Share what your trip was like…"
            className="w-full bg-surface border border-border rounded-[2px] px-grid-2 py-grid-2 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white transition-colors resize-none"
          />
          <div className="text-small text-text-muted text-right mt-1">
            {reviewText.length}/1000
          </div>
        </div>
      </div>
    </Modal>
  );
}
