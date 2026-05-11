import { useEffect, useMemo, useState } from 'react';
import {
  Search, AlertCircle, UserCheck, UserX, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Spinner from '../../components/common/Spinner';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import {
  getAllUsers, setUserActive, deleteUser as apiDeleteUser,
} from '../../api/admin.api';
import { formatDatePretty } from '../../utils/formatPrice';

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'passenger', label: 'Passenger' },
  { value: 'driver', label: 'Driver' },
  { value: 'admin', label: 'Admin' },
];

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { users: list } = await getAllUsers({ role, search, limit: 200 });
      setUsers(list);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // initial + role changes (debounced for search)
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, role]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => users, [users]);

  const handleToggleActive = async (u) => {
    if (busyId) return;
    setBusyId(u.user_id);
    try {
      await setUserActive(u.user_id, !u.is_active);
      toast.success(u.is_active ? 'User deactivated' : 'User reactivated');
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete || deleting) return;
    setDeleting(true);
    try {
      await apiDeleteUser(confirmDelete.user_id);
      toast.success('User deleted');
      setConfirmDelete(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main className="pt-20 px-grid-3 max-w-7xl mx-auto pb-grid-6">
        <h1 className="text-h1 mt-grid-3 mb-grid-3">Manage users</h1>

        {/* Filters */}
        <section className="bg-surface border border-border rounded-[2px] p-grid-3 grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-grid-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-grid-2 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="h-11 w-full bg-surface border border-border rounded-[2px] pl-grid-5 pr-grid-2 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white transition-colors"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-11 w-full bg-surface border border-border rounded-[2px] px-grid-2 text-body text-text-primary focus:outline-none focus:border-white transition-colors"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </section>

        {error && (
          <div className="mt-grid-3 bg-surface border border-error rounded-[2px] p-grid-2 flex items-center gap-grid-2 text-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <section className="mt-grid-3 bg-surface border border-border rounded-[2px] overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_auto] gap-grid-2 px-grid-3 py-grid-2 border-b border-border text-small text-text-secondary uppercase tracking-wider">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Joined</span>
            <span>Rating</span>
            <span className="text-right">Actions</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-grid-5"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="px-grid-3 py-grid-5 text-center text-text-secondary">
              No users found
            </div>
          ) : (
            filtered.map((u) => (
              <div
                key={u.user_id}
                className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_auto] gap-grid-2 px-grid-3 py-grid-2 border-b border-border last:border-b-0 items-center"
              >
                <div className="flex items-center gap-grid-2 min-w-0">
                  <Avatar user={u} size="sm" />
                  <span className="text-body truncate">{u.full_name}</span>
                </div>
                <span className="text-body text-text-secondary truncate">{u.email}</span>
                <span className="text-body capitalize">{u.role}</span>
                <span
                  className={`text-small font-semibold uppercase tracking-wider ${
                    u.is_active ? 'text-success' : 'text-error'
                  }`}
                >
                  {u.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-small text-text-secondary">
                  {formatDatePretty(u.created_at)}
                </span>
                <span>
                  {Number(u.average_rating) > 0 ? (
                    <StarRating value={Number(u.average_rating)} size="sm" />
                  ) : (
                    <span className="text-small text-text-muted">—</span>
                  )}
                </span>
                <div className="flex items-center justify-end gap-grid-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={busyId === u.user_id}
                    onClick={() => handleToggleActive(u)}
                  >
                    {u.is_active ? (
                      <><UserX size={14} /> Deactivate</>
                    ) : (
                      <><UserCheck size={14} /> Reactivate</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setConfirmDelete(u)}
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      <Modal
        open={!!confirmDelete}
        onClose={() => !deleting && setConfirmDelete(null)}
        title="Delete user?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Delete user
            </Button>
          </>
        }
      >
        {confirmDelete && (
          <p className="text-body text-text-secondary">
            Permanently delete{' '}
            <span className="text-text-primary">{confirmDelete.full_name}</span> (
            {confirmDelete.email})? This will cascade-delete their trips, bookings, and ratings.
            This cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  );
}
