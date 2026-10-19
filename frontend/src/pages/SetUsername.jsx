import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../core/api/axiosInstance';

export default function SetUsername() {
  const [username, setUsername] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [error, setError] = useState('');
  
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already has username
  useEffect(() => {
    if (user?.username) {
      const params = new URLSearchParams(location.search);
      const returnUrl = params.get('returnUrl') || '/dashboard';
      navigate(returnUrl);
    }
  }, [user, navigate, location.search]);

  // Debounced username check
  useEffect(() => {
    if (username.length < 3) {
      setAvailable(null);
      return;
    }

    const checkUsername = async () => {
      setChecking(true);
      try {
        const { data } = await api.get(`/auth/check-username?username=${username}`);
        setAvailable(data.available);
      } catch (err) {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.length < 3 || available === false) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await api.put('/auth/username', { username, upiId });
      // Update auth context user
      login(data.user);
      
      const params = new URLSearchParams(location.search);
      const returnUrl = params.get('returnUrl') || '/dashboard';
      navigate(returnUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md apple-glass-card rounded-[2.25rem] shadow-apple-lg p-8 sm:p-10 border border-white/80">
        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold mx-auto shadow-apple-xs">
          @
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 tracking-tight mb-2">Choose your username</h1>
        <p className="text-center text-slate-500 text-sm mb-8 font-medium">
          This is how your friends will find you and add you to groups.
        </p>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600 text-sm mb-6">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                placeholder="username"
                className="w-full apple-input rounded-full py-3.5 pl-9 pr-12 text-base font-medium placeholder:text-slate-400"
                required
                minLength={3}
              />
              
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                {checking ? (
                  <svg className="animate-spin h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : available === true ? (
                  <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                ) : available === false && username.length >= 3 ? (
                  <AlertCircle className="text-red-500 w-5 h-5" />
                ) : null}
              </div>
            </div>
            
            {username.length > 0 && username.length < 3 && (
              <p className="text-xs text-slate-400 mt-2 ml-2 font-medium">Must be at least 3 characters</p>
            )}
            {available === false && (
              <p className="text-xs text-rose-500 mt-2 ml-2 font-semibold">This username is already taken</p>
            )}
            {available === true && (
              <p className="text-xs text-emerald-600 mt-2 ml-2 font-semibold">Username available!</p>
            )}
          </div>

          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="UPI ID (optional)"
                className="w-full apple-input rounded-full py-3.5 pl-9 pr-4 text-base font-medium placeholder:text-slate-400"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 ml-2 leading-relaxed">
              Adding a UPI ID makes it easy to receive payments from friends. You can add any valid UPI ID.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || available !== true}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full py-3.5 px-6 font-semibold shadow-apple-xs hover:shadow-apple active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
