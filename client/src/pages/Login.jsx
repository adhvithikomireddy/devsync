import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login({ email, password });
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4 selection:bg-brand-600 selection:text-white select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">DevSync</span>
          </Link>
          <h2 className="text-xl font-bold text-dark-100">Welcome Back</h2>
          <p className="text-xs text-dark-400">Log in to your collaborative engineering workspace</p>
        </div>

        {/* Form Box */}
        <div className="bg-dark-850 border border-dark-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-xs text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-200">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-dark-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="developer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-200">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-dark-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Logging In...' : 'Log In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-dark-400">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
