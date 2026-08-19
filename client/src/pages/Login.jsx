import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4 selection:bg-brand-600 selection:text-white select-none relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow bg-brand-600/15 top-1/4 left-1/4" />
      <div className="ambient-glow bg-accent-purple/15 bottom-1/4 right-1/4" />
      <div className="absolute inset-0 bg-subtle-grid opacity-50 pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/25 border border-white/20 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">DevSync</span>
          </Link>
          <h2 className="text-xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-dark-400">Sign in to your collaborative engineering workspace</p>
        </div>

        {/* Form Box */}
        <div className="glass-panel rounded-3xl p-7 shadow-glass-lg space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-dark-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="developer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-900 border border-white/[0.08] focus:border-brand-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none placeholder:text-dark-600 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-dark-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-900 border border-white/[0.08] focus:border-brand-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none placeholder:text-dark-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-dark-400">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-semibold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
