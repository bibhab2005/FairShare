import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', isDestructive = true, isLoading = false }) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm sm:max-w-md bg-white rounded-[2rem] shadow-xl overflow-hidden p-6 sm:p-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">{title}</h3>
              <p className="text-slate-500 mb-8">{message}</p>
              <div className="flex w-full gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3.5 rounded-full font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 flex items-center justify-center px-6 py-3.5 rounded-full font-medium text-white transition-colors disabled:opacity-50 shadow-sm ${
                    isDestructive ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                  }`}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
