import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
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

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/35 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-sm sm:max-w-md apple-glass-card rounded-[2rem] shadow-apple-lg p-6 sm:p-8 my-auto z-10 border border-white/80"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shrink-0 shadow-apple-xs ${isDestructive ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                <AlertCircle size={28} className="sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">{title}</h3>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">{message}</p>
              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-5 py-3 sm:py-3.5 rounded-full font-medium text-sm sm:text-base text-slate-700 bg-slate-100 hover:bg-slate-200/80 active:scale-95 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 flex items-center justify-center px-5 py-3 sm:py-3.5 rounded-full font-medium text-sm sm:text-base text-white active:scale-95 transition-all disabled:opacity-50 shadow-apple-xs ${
                    isDestructive ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/25'
                  }`}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmModal;
