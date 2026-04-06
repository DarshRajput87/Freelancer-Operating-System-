import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { Button, Input } from '../components/ui';

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-display tracking-tight">FreelanceOS</div>
            <div className="text-xs text-gray-600">Freelancer Operating System</div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white font-display">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your FreelanceOS account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
          placeholder="you@example.com" required autoComplete="email" />
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
              className="w-full px-3 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" loading={isLoading} className="w-full mt-2">Sign In</Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-5">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">Create account</Link>
      </p>
    </AuthLayout>
  );
}

export function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    try {
      await register(form);
      toast.success('Account created! Welcome to FreelanceOS.');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start managing your freelance business with AI">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" value={form.name} onChange={(e) => set('name', e.target.value)}
          placeholder="Alex Johnson" required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
          placeholder="you@example.com" required autoComplete="email" />
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)}
              placeholder="At least 8 characters" required autoComplete="new-password"
              className="w-full px-3 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" loading={isLoading} className="w-full mt-2">Create Account</Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
