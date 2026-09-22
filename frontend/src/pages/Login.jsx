import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { loginUser } from '../features/auth/api/authService';
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = import.meta.env.DEV ? 'http://localhost:5000/api/auth/google' : '/api/auth/google';
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data } = await loginUser({ email, password });
      login(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header - Mimicking Airbnb Top Nav for context */}
      <header className="border-b border-neutral-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">FairShare</span>
        </Link>
        <Link to="/register" className="text-base sm:text-lg font-medium text-neutral-700 hover:text-emerald-600 transition-colors">
          Sign up
        </Link>
      </header>

      {/* Main Content - Centered Modal */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Subtle background blurs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 text-sm mb-6 w-full max-w-[560px]">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="w-full max-w-[560px] bg-white/80 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] p-6 sm:p-10 md:p-12 border border-white">
          <h1 className="text-3xl font-medium tracking-tighter text-neutral-900 mb-2">Welcome back</h1>
          <p className="text-neutral-500 text-lg mb-10">Sign in to manage your shared expenses.</p>

          {/* 1. Primary Auth: Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-neutral-200 text-neutral-900 rounded-full py-4 px-6 flex items-center justify-center gap-3 hover:bg-neutral-50 hover:border-emerald-200 hover:shadow-sm hover:text-emerald-600 transition-all duration-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.58c2.1-1.92 3.31-4.74 3.31-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium text-base">Continue with Google</span>
          </button>

          {/* Separator */}
          <div className="relative flex items-center justify-center my-8">
            <div className="border-t border-neutral-200 w-full"></div>
            <span className="bg-neutral-50 px-4 text-xs font-medium text-neutral-400 absolute tracking-wider">OR</span>
          </div>

          {/* 2. Secondary Auth: Manual Form */}
          <form onSubmit={handleManualLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2 pl-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-neutral-50/50 border border-neutral-200 rounded-full py-4 px-6 text-base outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all placeholder:text-neutral-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2 pl-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-50/50 border border-neutral-200 rounded-full py-4 px-6 text-base outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all placeholder:text-neutral-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full py-4 px-6 font-medium text-base hover:opacity-90 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 mt-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-10 pt-8 border-t border-neutral-100 text-center">
            <p className="text-neutral-600 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-600 font-medium hover:text-teal-600 hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Basic Footer */}
      <footer className="px-6 py-6 border-t border-neutral-100 text-center text-xs text-neutral-400 mt-auto">
        © 2026 FairShare Inc. All rights reserved.
      </footer>
    </div>
  );
}
