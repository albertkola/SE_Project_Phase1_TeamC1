import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ROLE_REDIRECT = {
  driver: '/driver/dashboard',
  passenger: '/search',
  admin: '/admin',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      const payload = data.data || data;
      const token = payload.token || payload.accessToken;
      const user = payload.user || payload;
      if (!token || !user) throw new Error('Invalid response');
      login(token, user);
      toast.success(`Welcome back, ${user.full_name?.split(' ')[0] || 'rider'}!`);
      const from = location.state?.from?.pathname;
      navigate(from || ROLE_REDIRECT[user.role] || '/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-grid-3 py-grid-5">
      <div className="w-full max-w-md bg-surface border border-border rounded-[2px] p-grid-4">
        <Link to="/" className="block text-center mb-grid-4">
          <span className="text-h1 font-extrabold tracking-tight">HOP IN</span>
        </Link>
        <h1 className="text-h2 mb-grid-1">Log in</h1>
        <p className="text-text-secondary text-body mb-grid-4">
          Welcome back. Enter your details to continue.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-grid-2" noValidate>
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Email"
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <Button type="submit" variant="primary" size="lg" loading={loading} className="mt-grid-2 w-full">
            Log in
          </Button>
        </form>

        <p className="text-small text-text-secondary text-center mt-grid-3">
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
