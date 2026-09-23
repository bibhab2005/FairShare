import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Redirect if already has username
  useEffect(() => {
    if (user?.username) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-sm p-8 sm:p-10 border border-neutral-100">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 text-xl font-bold mx-auto">
          @
        </div>
        
        <h1 className="text-2xl font-bold text-center text-neutral-900 mb-2">Choose your username</h1>
        <p className="text-center text-neutral-500 mb-8">
          This is how your friends will find you and add you to groups.
        </p>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 text-sm mb-6">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                placeholder="username"
                className={`w-full bg-neutral-50 border rounded-2xl py-4 pl-8 pr-12 text-lg outline-none transition-all placeholder:text-neutral-300
                  ${available === false ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' : 
                    available === true ? 'border-emerald-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100' : 
                    'border-neutral-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 focus:bg-white'}
                `}
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
              <p className="text-sm text-neutral-500 mt-2 ml-1">Must be at least 3 characters</p>
            )}
            {available === false && (
              <p className="text-sm text-red-500 mt-2 ml-1">This username is already taken</p>
            )}
            {available === true && (
              <p className="text-sm text-emerald-600 mt-2 ml-1">Username available!</p>
            )}
          </div>

          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">₹</span>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="UPI ID (optional)"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 pl-8 pr-4 text-lg outline-none transition-all placeholder:text-neutral-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 focus:bg-white"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-2 ml-1 leading-relaxed">
              Adding a UPI ID makes it easy to receive payments from friends. You can add any valid UPI ID.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || available !== true}
            className="w-full bg-emerald-500 text-white rounded-full py-4 px-6 font-medium text-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
