import { useState, useEffect } from 'react';
import { updateProfile } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, IndianRupee } from 'lucide-react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

const ProfileSettingsModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

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
      setUpiId(user.upiId || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await updateProfile({ name, upiId: upiId.trim() === '' ? undefined : upiId.trim() });
      setUser(res.data.user);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
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
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    UPI ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-200"
                    placeholder="name@bank"
                  />
                  <p className="text-xs text-slate-500 mt-2 ml-1">
                    Adding your UPI ID lets group members settle debts directly via UPI apps (GPay, PhonePe, etc).
                  </p>
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
