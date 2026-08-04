import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createSettlement } from '../api/expenseApi';
import { formatPaise } from '../utils/formatCurrency';
import { ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedEmptyState from './AnimatedEmptyState';
import emptyStateAnim from '../../public/assets/empty-box.json';
import PendingSettlements from './PendingSettlements';

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
      <div className={`rounded-3xl p-6 border ${
        netBalance > 0 
          ? 'bg-emerald-50 border-emerald-100 shadow-sm' 
          : netBalance < 0 
            ? 'bg-red-50 border-red-100 shadow-sm'
            : 'bg-neutral-50 border-neutral-100'
      }`}>
        <h3 className={`text-sm font-semibold tracking-wide uppercase mb-4 ${
          netBalance > 0 ? 'text-emerald-700' : netBalance < 0 ? 'text-red-700' : 'text-neutral-500'
        }`}>Your Overall Balance</h3>
        {myBalance ? (
          <div className="flex items-center gap-3">
            {netBalance > 0 ? (
              <>
                <span className="text-3xl font-medium tracking-tight text-green-600">
                  +{formatPaise(netBalance)}
                </span>
                <span className="text-sm font-medium text-neutral-500">gets back</span>
              </>
            ) : netBalance < 0 ? (
              <>
                <span className="text-3xl font-medium tracking-tight text-red-600">
                  {formatPaise(Math.abs(netBalance))}
                </span>
                <span className="text-sm font-medium text-neutral-500">you owe</span>
              </>
            ) : (
              <span className="text-3xl font-medium tracking-tight text-neutral-950">Settled up</span>
            )}
          </div>
        ) : (
          <p className="text-neutral-500 font-medium">Not involved in any expenses yet.</p>
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
        <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6">
          <h3 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase mb-4">All Group Debts</h3>
          <div className="space-y-3">
            {simplifiedDebts.map((debt, idx) => {
              if (debt.from === user?._id || debt.to === user?._id) return null;
              const fromUser = findUser(debt.from);
              const toUser = findUser(debt.to);
              return (
                <div key={`all-debt-${idx}`} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white transition-colors duration-200">
                  <div className="flex items-center gap-2 text-neutral-600 text-sm">
                    <span className="font-medium text-neutral-950">{fromUser?.name}</span>
                    <ArrowRight size={14} className="text-neutral-300" />
                    <span className="font-medium text-neutral-950">{toUser?.name}</span>
                  </div>
                  <span className="font-medium text-neutral-500">{formatPaise(debt.amountPaise)}</span>
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
