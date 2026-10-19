import { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { createSettlement } from '../../expenses/api/settlementService';
import { formatPaise } from '../../../core/utils/formatCurrency';
import { ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedEmptyState from '../../../core/components/AnimatedEmptyState';
import emptyStateAnim from '../../../../public/assets/empty-box.json';
import PendingSettlements from '../../expenses/components/PendingSettlements';

const BalanceSummary = ({ balances, simplifiedDebts, groupId, onSettled }) => {
  const { user } = useAuth();
  const [settling, setSettling] = useState(null);

  const handleSettle = async (debt) => {
    setSettling(`${debt.from}-${debt.to}`);
    try {
      await createSettlement({
        groupId,
        payerId: debt.from,
        receiverId: debt.to,
        amountPaise: debt.amountPaise,
      });
      await onSettled();
      toast.success('Debt settled successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to settle debt.');
    } finally {
      setSettling(null);
    }
  };

  if (!balances?.length) {
    return (
      <AnimatedEmptyState 
        animationData={emptyStateAnim}
        title="No balances yet"
        description="Expenses will calculate automatically."
      />
    );
  }

  const myBalance = balances.find((b) => b.userId === user?._id);
  const myOwed = simplifiedDebts.filter((d) => d.to === user?._id);
  const myDebts = simplifiedDebts.filter((d) => d.from === user?._id);

  const netBalance = myOwed.reduce((sum, debt) => sum + debt.amountPaise, 0) - myDebts.reduce((sum, debt) => sum + debt.amountPaise, 0);

  const findUser = (id) => balances.find((b) => b.userId === id)?.user;

  const formattedDebts = [
    ...myDebts.map(d => {
      const toUser = findUser(d.to);
      return {
        from: 'You',
        to: toUser?.name || 'Unknown',
        toAvatar: toUser?.avatar || toUser?.picture,
        toUpiId: toUser?.upiId,
        amount: d.amountPaise / 100,
        originalDebt: d
      };
    }),
    ...myOwed.map(d => {
      const fromUser = findUser(d.from);
      return {
        from: fromUser?.name || 'Unknown',
        to: 'You',
        fromAvatar: fromUser?.avatar || fromUser?.picture,
        amount: d.amountPaise / 100,
        originalDebt: d
      };
    })
  ];

  return (
    <div className="space-y-6">
      <div className={`rounded-[2rem] p-6 border transition-all ${
        netBalance > 0 
          ? 'bg-emerald-500/[0.08] border-emerald-500/20 shadow-apple-xs' 
          : netBalance < 0 
            ? 'bg-rose-500/[0.08] border-rose-500/20 shadow-apple-xs' 
            : 'apple-card-surface border border-black/[0.06]'
      }`}>
        <h3 className={`text-xs font-bold tracking-wider uppercase mb-3 ${
          netBalance > 0 ? 'text-emerald-700' : netBalance < 0 ? 'text-rose-700' : 'text-slate-500'
        }`}>Your Overall Balance</h3>
        {myBalance ? (
          <div className="flex items-center gap-3">
            {netBalance > 0 ? (
              <>
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-emerald-600">
                  +{formatPaise(netBalance)}
                </span>
                <span className="text-sm font-semibold text-emerald-700/80">gets back</span>
              </>
            ) : netBalance < 0 ? (
              <>
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-rose-600">
                  {formatPaise(Math.abs(netBalance))}
                </span>
                <span className="text-sm font-semibold text-rose-700/80">you owe</span>
              </>
            ) : (
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Settled up</span>
            )}
          </div>
        ) : (
          <p className="text-slate-500 font-medium">Not involved in any expenses yet.</p>
        )}
      </div>

      {(formattedDebts.length > 0) && (
        <PendingSettlements 
          debts={formattedDebts} 
          currentUser={user?.name}
          currentUserAvatar={user?.avatar || user?.picture}
          members={balances.map(b => b.user)}
          user={user}
          onSettle={(debtItem) => handleSettle(debtItem.originalDebt)} 
        />
      )}

      {simplifiedDebts.length > 0 && (
        <div className="apple-card-surface rounded-[2rem] p-6 border border-black/[0.06]">
          <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-4">All Group Debts</h3>
          <div className="space-y-2">
            {simplifiedDebts.map((debt, idx) => {
              const fromUser = findUser(debt.from);
              const toUser = findUser(debt.to);
              const fromName = debt.from === user?._id ? 'You' : (fromUser?.name || 'Unknown');
              const toName = debt.to === user?._id ? 'You' : (toUser?.name || 'Unknown');
              return (
                <div key={`all-debt-${idx}`} className="flex items-center justify-between p-3 rounded-2xl hover:bg-black/[0.03] transition-colors duration-150">
                  <div className="flex items-center gap-2 text-neutral-600 text-sm">
                    <span className="font-semibold text-slate-900">{fromName}</span>
                    <ArrowRight size={14} className="text-slate-400" />
                    <span className="font-semibold text-slate-900">{toName}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatPaise(debt.amountPaise)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceSummary;
