import { useEffect, useState } from 'react';
import { AlertCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Spinner from '../../components/common/Spinner';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import StarRating from '../../components/common/StarRating';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateMyProfile } from '../../api/users.api';
import { formatDatePretty } from '../../utils/formatPrice';

export default function Profile() {
  const { user, setUser, refreshUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    profile_picture: '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user?.user_id) return;
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const p = await getUserProfile(user.user_id);
        if (!alive) return;
        setProfile(p);
        setForm({
          full_name: p?.full_name || user.full_name || '',
          phone: user.phone || '',
          profile_picture: p?.profile_picture || user.profile_picture || '',
        });
      } catch (err) {
        if (!alive) return;
        setError(err?.response?.data?.message || 'Failed to load profile');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user?.user_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, profile_picture: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Name is required';
    else if (form.full_name.trim().length > 100) errs.full_name = 'Max 100 characters';
    if (form.phone && form.phone.length > 20) errs.phone = 'Max 20 characters';
    if (form.profile_picture && form.profile_picture.length > 255) {
      errs.profile_picture = 'URL too long (max 255 chars)';
    }
    return errs;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
      };
      if (form.phone?.trim()) payload.phone = form.phone.trim();
      if (form.profile_picture !== (profile?.profile_picture || '')) {
        payload.profile_picture = form.profile_picture || null;
      }

      const updated = await updateMyProfile(payload);
      setUser(updated);
      try { localStorage.setItem('hopin_user', JSON.stringify(updated)); } catch { /* ignore */ }
      await refreshUser?.();
      toast.success('Profile updated');
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors?.[0]?.message
        || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setSaving(false);
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

  if (error) {
    return (
      <div className="min-h-screen bg-background text-text-primary">
        <Navbar />
        <main className="pt-24 px-grid-3 max-w-3xl mx-auto">
          <div className="bg-surface border border-error rounded-[2px] p-grid-3 flex items-center gap-grid-2 text-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        </main>
      </div>
    );
  }

  const ratings = profile?.ratings || [];
  const avg = Number(profile?.average_rating || 0);
  const reviewCount = profile?.review_count ?? ratings.length;

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main className="pt-20 px-grid-3 max-w-4xl mx-auto pb-grid-6">
        <h1 className="text-h1 mt-grid-3 mb-grid-3">My profile</h1>

        {/* Header card */}
        <section className="bg-surface border border-border border-l-2 border-l-white rounded-[2px] p-grid-3 flex items-center gap-grid-3 flex-wrap">
          <Avatar
            user={{
              full_name: form.full_name || profile?.full_name,
              profile_picture: form.profile_picture || profile?.profile_picture,
            }}
            size="xl"
          />
          <div className="flex flex-col gap-grid-1 flex-1 min-w-0">
            <div className="flex items-center gap-grid-2 flex-wrap">
              <span className="text-h2 font-semibold truncate">
                {profile?.full_name || form.full_name || 'You'}
              </span>
              {profile?.role && <Badge status="active">{profile.role}</Badge>}
            </div>
            <div className="flex items-center gap-grid-2">
              {avg > 0 ? (
                <>
                  <StarRating value={avg} size="sm" />
                  <span className="text-small text-text-secondary">
                    {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                  </span>
                </>
              ) : (
                <span className="text-small text-text-secondary">No reviews yet</span>
              )}
            </div>
            {profile?.created_at && (
              <span className="text-small text-text-secondary">
                Joined {formatDatePretty(profile.created_at)}
              </span>
            )}
          </div>
        </section>

        {/* Edit form */}
        <section className="mt-grid-3 bg-surface border border-border rounded-[2px] p-grid-3">
          <h2 className="text-h3 mb-grid-2">Edit profile</h2>
          <form onSubmit={handleSave} className="flex flex-col gap-grid-3">
            <Input
              label="Full name"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              error={errors.full_name}
              maxLength={100}
            />

            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              error={errors.phone}
              placeholder="e.g. +355 69 123 4567"
              maxLength={20}
            />

            <div className="flex flex-col gap-grid-1">
              <label className="text-small text-text-secondary uppercase tracking-wider">
                Profile picture URL
              </label>
              <input
                type="url"
                value={form.profile_picture}
                onChange={(e) => setForm((f) => ({ ...f, profile_picture: e.target.value }))}
                placeholder="https://… or upload below"
                className={`h-11 w-full bg-surface border ${
                  errors.profile_picture ? 'border-error' : 'border-border'
                } rounded-[2px] px-grid-2 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white transition-colors`}
              />
              {errors.profile_picture && (
                <span className="text-small text-error">{errors.profile_picture}</span>
              )}
              <label className="text-small text-text-secondary mt-grid-1 cursor-pointer hover:text-text-primary transition-colors inline-block w-fit">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                Upload from device
              </label>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" loading={saving}>
                <Save size={14} /> Save changes
              </Button>
            </div>
          </form>
        </section>

        {/* Reviews received */}
        <section className="mt-grid-3 bg-surface border border-border rounded-[2px] p-grid-3">
          <h2 className="text-h3 mb-grid-2">Reviews received</h2>
          {ratings.length === 0 ? (
            <p className="text-body text-text-secondary">No reviews yet.</p>
          ) : (
            <div className="flex flex-col gap-grid-2">
              {ratings.map((r) => (
                <div
                  key={r.rating_id}
                  className="border border-border rounded-[2px] p-grid-2 flex flex-col gap-grid-1"
                >
                  <div className="flex items-center justify-between gap-grid-2 flex-wrap">
                    <div className="flex items-center gap-grid-2">
                      <Avatar
                        user={{
                          full_name: r.reviewer_name,
                          profile_picture: r.reviewer_avatar,
                        }}
                        size="sm"
                      />
                      <span className="text-body">{r.reviewer_name || 'Anonymous'}</span>
                    </div>
                    <StarRating value={r.stars} size="sm" />
                  </div>
                  {r.review_text && (
                    <p className="text-body text-text-secondary">{r.review_text}</p>
                  )}
                  {r.created_at && (
                    <span className="text-small text-text-muted">
                      {formatDatePretty(r.created_at)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
