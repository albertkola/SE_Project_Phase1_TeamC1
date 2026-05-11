import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import Avatar from './Avatar';

const NAV_BY_ROLE = {
  passenger: [
    { to: '/search', label: 'Search' },
    { to: '/bookings', label: 'Bookings' },
    { to: '/profile', label: 'Profile' },
  ],
  driver: [
    { to: '/driver/dashboard', label: 'Dashboard' },
    { to: '/driver/trips/create', label: 'Create Trip' },
    { to: '/profile', label: 'Profile' },
  ],
  admin: [
    { to: '/admin', label: 'Admin Panel' },
  ],
};

export default function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV_BY_ROLE[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-border h-16 flex items-center justify-between px-grid-3">
      <Link to="/" className="text-h3 font-extrabold tracking-tight text-white">
        HOP IN
      </Link>

      {isAuthenticated ? (
        <div className="flex items-center gap-grid-3">
          <div className="hidden md:flex items-center gap-grid-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-body px-grid-1 py-grid-1 transition-colors ${
                    isActive ? 'text-white font-semibold' : 'text-text-secondary hover:text-white'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          <NotificationBell />

          <Link to="/profile" className="hidden sm:flex items-center gap-grid-1">
            <Avatar user={user} size="sm" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-grid-1 text-text-secondary hover:text-white transition-colors text-body"
            aria-label="Logout"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-grid-2">
          <Link to="/login" className="text-body text-text-secondary hover:text-white transition-colors">
            Log in
          </Link>
          <Link
            to="/register"
            className="bg-white text-black font-bold px-grid-2 h-9 inline-flex items-center rounded-[2px] hover:bg-[#EAEAEA] transition-colors"
          >
            Sign up
          </Link>
        </div>
      )}
    </nav>
  );
}
