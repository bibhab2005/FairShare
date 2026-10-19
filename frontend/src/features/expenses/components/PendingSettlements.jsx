import { ArrowRight, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const PendingSettlements = ({ debts, currentUser, currentUserAvatar, members = [], user, onSettle }) => {
  const [selectedUpiDebt, setSelectedUpiDebt] = useState(null);
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
                {!isCurrentUserOwed && (
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
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Security Warning Modal */}
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
                className="relative w-full max-w-sm apple-glass-card rounded-[2rem] shadow-apple-lg p-6 sm:p-7 z-10 border border-white/80 flex flex-col items-center text-center"
              >
                <div className="w-13 h-13 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mb-4 p-3 shadow-apple-xs">
                  <AlertTriangle size={26} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Security Warning</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  FairShare does not verify UPI IDs. When your UPI app opens, please manually verify that the registered receiver name matches <strong className="text-slate-900">{selectedUpiDebt.finalDisplayTo}</strong>.
                </p>
                
                <div className="flex flex-col w-full gap-2.5 mt-1">
                  <a 
                    href={`upi://pay?pa=${selectedUpiDebt.toUpiId}&pn=${encodeURIComponent(selectedUpiDebt.finalDisplayTo)}&am=${selectedUpiDebt.amount.toFixed(2)}&cu=INR`}
                    onClick={() => setSelectedUpiDebt(null)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-full font-semibold shadow-apple-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Pay
                  </a>
                  <button 
                    onClick={() => setSelectedUpiDebt(null)}
                    className="w-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 py-3 rounded-full font-semibold active:scale-95 transition-all"
                  >
                    Cancel
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
