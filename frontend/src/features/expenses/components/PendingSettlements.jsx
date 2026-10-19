import { ArrowRight, AlertTriangle, X, Copy, Check, QrCode, ExternalLink, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';

const PendingSettlements = ({ debts, currentUser, currentUserAvatar, members = [], user, onSettle }) => {
  const [selectedUpiDebt, setSelectedUpiDebt] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const handleRemind = (debtorName, amount) => {
    const text = `Hey ${debtorName}, you have a pending settlement of ₹${amount.toFixed(2)} on FairShare for our group expenses. You can check and settle it here: ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  const getAvatar = (name, debtObj) => {
    // 1. Check if the debt object itself contains an avatar/picture property
    if (debtObj && typeof debtObj === 'object') {
      const directImg = debtObj.avatar || debtObj.picture || debtObj.profilePicture || debtObj.imageUrl || debtObj.photo || debtObj.image;
      if (directImg) return directImg;
    }

    // 2. Check if it's the current user via explicit 'You' or user ID
    const currentUserPic = currentUserAvatar || currentUser?.avatar || currentUser?.picture || user?.avatar || user?.picture;
    const debtId = typeof debtObj === 'object' ? (debtObj?._id || debtObj?.id) : debtObj;

    if (name === 'You' || (debtId && user?._id && debtId === user._id)) {
      if (currentUserPic) return currentUserPic;
    }

    // 3. Search inside the group members array by ID first
    let matchedMember = null;
    if (debtId) {
      matchedMember = members.find(m => {
        if (!m) return false;
        const mId = m._id || m.id || (m.user && (m.user._id || m.user.id));
        return mId === debtId;
      });
    }

    // 4. Fallback check by name only if ID matching failed
    if (!matchedMember) {
      matchedMember = members.find(m => {
        if (!m) return false;
        if (typeof m === 'string') return m === name;
        const mName = m.name || m.username || (m.user && (m.user.name || m.user.username));
        return mName === name;
      });
    }

    if (matchedMember) {
      const target = typeof matchedMember === 'object' && matchedMember.user ? matchedMember.user : matchedMember;
      return target.avatar || target.picture || target.profilePicture || target.imageUrl || target.photo || target.image;
    }

    return null;
  };

  return (
    <div className="apple-card-surface rounded-[2rem] p-5 sm:p-6 border border-black/[0.06]">
      <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-4 uppercase">
        Your Settlements
      </h3>
      
      <div className="flex flex-col gap-3">
        {debts.map((debt, index) => {
          const toObj = typeof debt.to === 'object' ? debt.to : null;
          const fromObj = typeof debt.from === 'object' ? debt.from : null;
          
          const toName = toObj ? (toObj.name || toObj.username) : debt.to;
          const fromName = fromObj ? (fromObj.name || fromObj.username) : debt.from;
          
          const fromId = debt.originalDebt?.from || fromObj?._id;
          const toId = debt.originalDebt?.to || toObj?._id;
          const currentUserId = user?._id;
          const currentUserNameStr = typeof currentUser === 'string' ? currentUser : (currentUser?.name || user?.name);

          const finalDisplayFrom = fromName === 'You' ? 'You' : ((currentUserId && fromId) ? (fromId === currentUserId ? 'You' : fromName) : (fromName === currentUserNameStr ? 'You' : fromName));
          const finalDisplayTo = toName === 'You' ? 'You' : ((currentUserId && toId) ? (toId === currentUserId ? 'You' : toName) : (toName === currentUserNameStr ? 'You' : toName));
          
          // Absolute foolproof check based on BalanceSummary's formatting
          const isCurrentUserOwed = debt.to === 'You' || finalDisplayTo === 'You';
          
          const textColor = isCurrentUserOwed ? 'text-emerald-600' : 'text-rose-600';
          
          const fromAvatarUrl = getAvatar(fromName, debt.originalDebt ? debt.originalDebt.from : debt.from);
          const toAvatarUrl = getAvatar(toName, debt.originalDebt ? debt.originalDebt.to : debt.to);

          return (
            <div key={index} className="flex flex-col gap-3.5 bg-black/[0.02] border border-black/[0.04] rounded-2xl p-4">
              <div className="flex items-center gap-3">
                {finalDisplayFrom === 'You' ? (
                  <span className="text-sm font-semibold text-neutral-900">You</span>
                ) : (
                  <div className="flex items-center gap-2">
                    {fromAvatarUrl ? (
                      <img 
                        src={fromAvatarUrl} 
                        alt={finalDisplayFrom} 
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover shadow-apple-xs border border-neutral-200" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shadow-apple-xs">
                        {finalDisplayFrom?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-neutral-900">{finalDisplayFrom}</span>
                  </div>
                )}
                
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                
                {finalDisplayTo === 'You' ? (
                  <span className="text-sm font-semibold text-neutral-900">You</span>
                ) : (
                  <div className="flex items-center gap-2">
                    {toAvatarUrl ? (
                      <img 
                        src={toAvatarUrl} 
                        alt={finalDisplayTo} 
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover shadow-apple-xs border border-neutral-200" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shadow-apple-xs">
                        {finalDisplayTo?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-neutral-900">{finalDisplayTo}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pl-1 flex-nowrap gap-2 pt-1 border-t border-black/[0.04]">
                <div className={`text-base sm:text-lg font-bold ${textColor} whitespace-nowrap`}>
                  ₹{debt.amount.toFixed(2)}
                </div>
                {!isCurrentUserOwed ? (
                  <div className="flex items-center gap-2 shrink-0">
                    {debt.toUpiId && (
                      <button 
                        onClick={() => setSelectedUpiDebt({ ...debt, finalDisplayTo })}
                        className="bg-[#118A45] hover:bg-[#0c6b35] text-white active:scale-95 shadow-apple-xs px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.9842 16.273H10.1245V7.71714H12.9842C15.1167 7.71714 16.5936 8.78453 16.5936 11.9951C16.5936 15.2056 15.1167 16.273 12.9842 16.273ZM12.7214 9.94086H12.2858V14.0493H12.7214C13.6896 14.0493 14.2811 13.5658 14.2811 11.9951C14.2811 10.4243 13.6896 9.94086 12.7214 9.94086Z" fill="currentColor"/>
                          <path d="M7.74798 16.273H5.16335V11.2339C5.16335 9.7719 5.86756 9.0716 6.87702 9.0716C7.30829 9.0716 7.64098 9.17647 7.82088 9.29654V11.3932C7.62534 11.2315 7.37894 11.1399 7.08779 11.1399C6.41725 11.1399 6.0792 11.6033 6.0792 12.5937V16.273H7.74798Z" fill="currentColor"/>
                          <path d="M18.8266 16.273H21.4112V7.71714H18.8266V16.273Z" fill="currentColor"/>
                        </svg>
                        Pay UPI
                      </button>
                    )}
                    <button 
                      onClick={() => onSettle && onSettle(debt)}
                      className="bg-slate-900 hover:bg-slate-800 text-white active:scale-95 shadow-apple-xs px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap"
                    >
                      Settle
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => handleRemind(finalDisplayFrom, debt.amount)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-500/20 active:scale-95 shadow-apple-xs px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
                      title="Send WhatsApp settlement reminder"
                    >
                      <MessageCircle size={14} className="text-emerald-600" />
                      Remind
                    </button>
                    <button 
                      onClick={() => onSettle && onSettle(debt)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 shadow-apple-xs px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
                      title="Mark balance as received"
                    >
                      Mark Received
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Dynamic UPI QR Code & Settlement Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedUpiDebt && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-md"
                onClick={() => setSelectedUpiDebt(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 12 }}
                transition={{ type: 'spring', damping: 25, stiffness: 320 }}
                className="relative w-full max-w-sm apple-glass-card rounded-[2.25rem] shadow-apple-lg p-6 sm:p-7 z-10 border border-white/80 flex flex-col items-center text-center"
              >
                <button
                  onClick={() => setSelectedUpiDebt(null)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-black/[0.04] active:scale-90 rounded-full transition-all"
                  title="Close"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    UPI Instant Pay
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-2 mb-0.5">
                  Pay {selectedUpiDebt.finalDisplayTo}
                </h3>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                  ₹{selectedUpiDebt.amount.toFixed(2)}
                </div>

                {/* QR Code Canvas */}
                <div className="p-3.5 bg-white rounded-2xl shadow-apple-sm border border-black/[0.06] mb-3">
                  <QRCodeSVG 
                    value={`upi://pay?pa=${selectedUpiDebt.toUpiId}&pn=${encodeURIComponent(selectedUpiDebt.finalDisplayTo)}&am=${selectedUpiDebt.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('FairShare Settlement')}`} 
                    size={170} 
                    level="M" 
                    includeMargin={false} 
                    className="w-40 h-40 rounded-lg"
                  />
                </div>

                <p className="text-xs text-slate-400 font-medium mb-3">
                  Scan using Google Pay, PhonePe, or Paytm
                </p>

                {/* Copy UPI ID Pill */}
                <div className="flex items-center justify-center gap-2 bg-slate-100/80 rounded-full px-3.5 py-1.5 mb-5 border border-black/[0.05] w-full max-w-[260px]">
                  <span className="text-xs font-mono font-medium text-slate-700 truncate select-all">
                    {selectedUpiDebt.toUpiId}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedUpiDebt.toUpiId);
                      setCopiedUpi(true);
                      setTimeout(() => setCopiedUpi(false), 2000);
                    }}
                    className="text-slate-500 hover:text-slate-900 active:scale-90 transition-transform p-0.5 rounded-full shrink-0"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="flex flex-col w-full gap-2.5">
                  <a 
                    href={`upi://pay?pa=${selectedUpiDebt.toUpiId}&pn=${encodeURIComponent(selectedUpiDebt.finalDisplayTo)}&am=${selectedUpiDebt.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('FairShare Settlement')}`}
                    className="w-full bg-[#118A45] hover:bg-[#0c6b35] text-white py-3 rounded-full font-semibold shadow-apple-xs active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <ExternalLink size={16} />
                    Open in UPI App
                  </a>
                  <button 
                    onClick={() => {
                      const debtToSettle = selectedUpiDebt;
                      setSelectedUpiDebt(null);
                      if (onSettle) onSettle(debtToSettle);
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-full font-semibold shadow-apple-xs active:scale-95 transition-all text-sm"
                  >
                    Mark as Settled
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default PendingSettlements;
