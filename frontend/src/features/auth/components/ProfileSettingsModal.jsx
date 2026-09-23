import { useState, useEffect } from 'react';
import { updateProfile } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, IndianRupee, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../../core/api/axiosInstance';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

const ProfileSettingsModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [checkingUpi, setCheckingUpi] = useState(false);
  const [availableUpi, setAvailableUpi] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setUpiId(user.upiId || '');
    }
  }, [user]);

  // Debounced username check
  useEffect(() => {
    if (username.length < 3 || username === user?.username) {
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
  }, [username, user?.username]);

  // Debounced UPI ID check
  useEffect(() => {
    const formattedUpi = upiId.trim();
    if (!formattedUpi || formattedUpi === user?.upiId) {
      setAvailableUpi(null);
      return;
    }

    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(formattedUpi)) {
      setAvailableUpi(null); // Let HTML5 validation handle format errors
      return;
    }

    const checkUpi = async () => {
      setCheckingUpi(true);
      try {
        const { data } = await api.get(`/auth/check-upi?upiId=${formattedUpi}`);
        setAvailableUpi(data.available);
      } catch (err) {
        setAvailableUpi(null);
      } finally {
        setCheckingUpi(false);
      }
    };

    const timeoutId = setTimeout(checkUpi, 500);
    return () => clearTimeout(timeoutId);
  }, [upiId, user?.upiId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.length >= 3 && available === false && username !== user?.username) return;
    if (availableUpi === false && upiId.trim() !== user?.upiId) return;

    setLoading(true);
    setError('');

    try {
      const res = await updateProfile({ 
        name, 
        username: username.trim() === '' ? undefined : username.trim(),
        upiId: upiId.trim() === '' ? undefined : upiId.trim() 
      });
      setUser(res.data.user);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl p-6 sm:p-8 my-auto z-10 border border-slate-100"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Profile Settings</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 text-sm mb-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-200"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1 flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">@</span>
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                      className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all duration-200 placeholder:text-neutral-300 pr-12
                        ${available === false && username !== user?.username ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100 bg-white' : 
                          available === true ? 'border-emerald-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 bg-white' : 
                          'border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'}
                      `}
                      placeholder="Choose a unique username"
                      required
                      minLength={3}
                      pattern="[a-zA-Z0-9_.-]+"
                      title="Username can only contain letters, numbers, underscores, dashes, and periods"
                    />
                    
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      {checking ? (
                        <Loader2 className="animate-spin h-5 w-5 text-neutral-400" />
                      ) : available === true ? (
                        <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                      ) : available === false && username.length >= 3 && username !== user?.username ? (
                        <AlertCircle className="text-red-500 w-5 h-5" />
                      ) : null}
                    </div>
                  </div>
                  {username.length > 0 && username.length < 3 && (
                    <p className="text-sm text-neutral-500 mt-2 ml-1">Must be at least 3 characters</p>
                  )}
                  {available === false && username !== user?.username && (
                    <p className="text-sm text-red-500 mt-2 ml-1">This username is already taken</p>
                  )}
                  {available === true && (
                    <p className="text-sm text-emerald-600 mt-2 ml-1">Username available!</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    UPI ID (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all duration-200 placeholder:text-neutral-300 pr-12
                        ${availableUpi === false && upiId.trim() !== user?.upiId ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100 bg-white' : 
                          availableUpi === true ? 'border-emerald-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 bg-white' : 
                          'border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'}
                      `}
                      placeholder="name@bank"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      {checkingUpi ? (
                        <Loader2 className="animate-spin h-5 w-5 text-neutral-400" />
                      ) : availableUpi === true ? (
                        <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                      ) : availableUpi === false && upiId.trim() !== user?.upiId ? (
                        <AlertCircle className="text-red-500 w-5 h-5" />
                      ) : null}
                    </div>
                  </div>
                  {availableUpi === false && upiId.trim() !== user?.upiId ? (
                    <p className="text-sm text-red-500 mt-2 ml-1">This UPI ID is already registered to another user</p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-2 ml-1">
                      Adding your UPI ID lets group members settle debts directly via UPI apps (GPay, PhonePe, etc).
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ProfileSettingsModal;
