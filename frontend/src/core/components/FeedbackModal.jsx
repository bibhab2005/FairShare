import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Copy, Check, ExternalLink, Github, MessageSquareHeart, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const email = 'bibhabtalukdar2005@gmail.com';

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

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success('Email copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error('Failed to copy email');
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl p-6 sm:p-8 my-auto z-10 border border-slate-100"
          >
            {/* Header info with integrated close button */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                  <MessageSquareHeart size={22} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                    Feedback & Ideas
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700 whitespace-nowrap">
                      <Sparkles size={11} /> Dev Direct
                    </span>
                    <span className="text-xs text-slate-500 hidden sm:inline">•</span>
                    <span className="text-xs text-slate-500 hidden sm:inline">Always listening</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 -mr-1 -mt-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Message Body */}
            <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-100 mb-6">
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                Hey! I'm <strong className="text-slate-900 font-semibold">Bibhab</strong>, the creator of FairShare. 👋
              </p>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Found a bug, want a new feature, or have a suggestion to make expense splitting better? Please reach out directly — I read and appreciate every message!
              </p>
            </div>

            {/* Email Contact Box */}
            <div className="border border-slate-200 rounded-2xl p-4 mb-6 bg-white">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                Developer Email
              </span>
              <p className="text-slate-900 font-medium text-sm sm:text-base select-all break-all mb-3">
                {email}
              </p>

              <div className="flex gap-2">
                <a
                  href={`mailto:${email}?subject=FairShare%20Feedback%20%26%20Suggestions`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm hover:opacity-90 transition-opacity"
                >
                  <Mail size={16} />
                  Send Email
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Other Channels / Links */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Connect with me:</span>
              <div className="flex items-center gap-4">
                <a
                  href="https://portfolio-bi-bhab-personal.vercel.app/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 transition-colors flex items-center gap-1 font-medium"
                >
                  Portfolio <ExternalLink size={12} />
                </a>
                <a
                  href="https://github.com/bibhab2005/FairShare"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 transition-colors flex items-center gap-1 font-medium"
                >
                  <Github size={13} /> GitHub
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default FeedbackModal;
