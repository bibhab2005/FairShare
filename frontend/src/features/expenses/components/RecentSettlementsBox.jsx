import { motion } from 'framer-motion';
import { formatPaise } from '../../../core/utils/formatCurrency';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const RecentSettlementsBox = ({ expenses, currentUserId }) => {
  // Filter for settlements where the current user is the receiver
  const myRecentSettlements = expenses.filter(expense => {
    if (!expense.isSettlement) return false;
    
    // Check if current user is the receiver (in splits)
    const isReceiver = expense.splits.some(split => 
      (split.user?._id || split.user) === currentUserId
    );
    
    // Check if someone else paid (not the current user)
    const payerId = expense.paidBy?._id || expense.paidBy;
    const isSomeoneElse = payerId !== currentUserId;
    
    return isReceiver && isSomeoneElse;
  });

  if (myRecentSettlements.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-medium tracking-tight text-slate-900 mb-6">Recent Settlements</h2>
      <div className="space-y-3">
        {myRecentSettlements.map((settlement, idx) => {
          const date = new Date(settlement.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          const payerName = settlement.paidBy?.name || 'Someone';
          const payerAvatar = settlement.paidBy?.avatar || null;
          
          return (
            <motion.div
              key={settlement._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full blur-2xl -mr-10 -mt-10 opacity-60"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  {payerAvatar ? (
                    <img 
                      src={payerAvatar} 
                      alt={payerName} 
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover shadow-sm border border-emerald-100" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-sm font-medium text-emerald-600 shadow-sm">
                      {payerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">{payerName}</span>
                      <span className="text-sm text-slate-500">paid you</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">{date}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold text-emerald-600">
                    +{formatPaise(settlement.amountPaise)}
                  </span>
                  <div className="flex items-center gap-1 mt-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-medium text-emerald-700 uppercase tracking-wider">Settled</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentSettlementsBox;
