import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Car, User } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const PHONE_RE = /^\+?\d{8,15}$/;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.full_name || form.full_name.trim().length < 2)
      e.full_name = 'Full name required (min 2 chars)';
    if (!form.email) e.email = 'Email required';
    else if (!EMAIL_RE.test(form.email)) e.email = 'Invalid email';
    if (!form.phone) e.phone = 'Phone required';
    else if (!PHONE_RE.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Invalid phone (8–15 digits, optional +)';
    if (!form.password) e.password = 'Password required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    if (form.confirm_password !== form.password)
      e.confirm_password = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (role) => {
    if (!role) {
      toast.error('Please select a role');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.replace(/\s/g, ''),
        password: form.password,
        role,
      });
      toast.success('Account created. Please log in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-grid-3 py-grid-5">
      <div className="w-full max-w-xl bg-surface border border-border rounded-[2px] p-grid-4">
        <Link to="/" className="block text-center mb-grid-3">
          <span className="text-h1 font-extrabold tracking-tight">HOP IN</span>
        </Link>

        <div className="flex items-center gap-grid-1 justify-center mb-grid-4">
          <span className={`h-1 w-12 rounded-[2px] ${step >= 1 ? 'bg-white' : 'bg-border'}`} />
          <span className={`h-1 w-12 rounded-[2px] ${step >= 2 ? 'bg-white' : 'bg-border'}`} />
        </div>

        {step === 1 && (
          <>
            <h1 className="text-h2 mb-grid-1">Create your account</h1>
            <p className="text-text-secondary text-body mb-grid-3">
              Step 1 of 2 — your details.
            </p>
            <form onSubmit={handleNext} className="flex flex-col gap-grid-2" noValidate>
              <Input
                label="Full name"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                error={errors.full_name}
                placeholder="Name Surname"
                autoComplete="name"
              />
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
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="Phone Number"
                autoComplete="tel"
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              <Input
                label="Confirm password"
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                error={errors.confirm_password}
                placeholder="Confirm Password"
                autoComplete="new-password"
              />
              <Button type="submit" variant="primary" size="lg" className="mt-grid-2 w-full">
                Continue
              </Button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-h2 mb-grid-1">How will you use Hop In?</h1>
            <p className="text-text-secondary text-body mb-grid-3">
              Step 2 of 2 — pick your role.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-grid-2">
              {[
                { value: 'driver', Icon: Car, title: "I'm a Driver", desc: 'Offer rides and earn.' },
                { value: 'passenger', Icon: User, title: "I'm a Passenger", desc: 'Find affordable rides.' },
              ].map(({ value, Icon, title, desc }) => {
                const active = form.role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={loading}
                    onClick={() => setForm((f) => ({ ...f, role: value }))}
                    className={`text-left p-grid-3 border rounded-[2px] transition-colors flex flex-col gap-grid-1 ${active
                        ? 'border-white bg-surface-elevated'
                        : 'border-border bg-surface hover:bg-surface-elevated'
                      }`}
                  >
                    <Icon size={28} color="#FFFFFF" strokeWidth={1.5} />
                    <div className="text-h3 mt-grid-1">{title}</div>
                    <div className="text-small text-text-secondary">{desc}</div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-grid-2 mt-grid-4">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="flex-1"
                loading={loading}
                onClick={() => handleSubmit(form.role)}
                disabled={!form.role}
              >
                Create account
              </Button>
            </div>
          </>
        )}

        <p className="text-small text-text-secondary text-center mt-grid-3">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
