import { useState, useEffect } from 'react';
import { X, IndianRupee, AlertCircle, ChevronDown, Equal, Sliders, Loader2 } from 'lucide-react';
import { createExpense } from '../api/expenseService';
import { useAuth } from '../../auth/context/AuthContext';
import { formatPaise, rupeeToRoundedPaise } from '../../../core/utils/formatCurrency';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ExpenseModal = ({ group, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [paidBy, setPaidBy] = useState(user?._id || '');
  const [splitType, setSplitType] = useState('equal');
  const [customSplits, setCustomSplits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const members = group?.members || [];
  const amountPaise = rupeeToRoundedPaise(amountRupees);

  useEffect(() => {
    if (members.length > 0) {
      setCustomSplits(
        members.map((m) => ({ user: m._id, name: m.name, amountRupees: '' }))
      );
    }
  }, [group]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const customTotal = customSplits.reduce(
    (sum, s) => sum + rupeeToRoundedPaise(s.amountRupees),
    0
  );
  const splitDifference = amountPaise - customTotal;

  const handleCustomSplitChange = (userId, value) => {
    setCustomSplits((prev) =>
      prev.map((s) => (s.user === userId ? { ...s, amountRupees: value } : s))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) return toast.error('Please enter a description.');
    if (!amountPaise || amountPaise <= 0) return toast.error('Please enter a valid amount.');
    if (!paidBy) return toast.error('Please select who paid.');

    if (splitType === 'custom') {
      if (splitDifference !== 0) {
        return toast.error(
          `Custom splits must equal the total. Difference: ${formatPaise(Math.abs(splitDifference))} ${splitDifference > 0 ? 'remaining' : 'over'}.`
        );
      }
      if (customSplits.some((s) => rupeeToRoundedPaise(s.amountRupees) < 0)) {
        return toast.error('Split amounts cannot be negative.');
      }
    }

    try {
      setLoading(true);
      const payload = {
        groupId: group._id,
        description: description.trim(),
        amountPaise,
        paidBy,
        splitType,
        ...(splitType === 'custom' && {
          splits: customSplits
            .filter((s) => rupeeToRoundedPaise(s.amountRupees) > 0)
            .map((s) => ({ user: s.user, amountPaise: rupeeToRoundedPaise(s.amountRupees) })),
        }),
      };
      await createExpense(payload);
      toast.success('Expense added successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-md" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="relative w-full sm:max-w-lg apple-glass-card rounded-t-[2.25rem] sm:rounded-[2rem] shadow-apple-lg border border-white/80 p-6 sm:p-7 max-h-[92vh] overflow-y-auto pb-8 sm:pb-6"
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-neutral-300" />
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-apple-xs">
              <IndianRupee size={20} />
            </div>
            <div>
              <h2 className="font-bold text-xl text-slate-900 tracking-tight">Add Expense</h2>
              <p className="text-sm text-slate-500 font-medium">{group.name}</p>
            </div>
          </div>
          <button
            id="expense-modal-close"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-black/[0.05] active:scale-90 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form id="add-expense-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2" htmlFor="expense-description">Description</label>
            <input
              id="expense-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dinner at restaurant"
              className="w-full px-4 py-3.5 rounded-2xl apple-input text-slate-900 placeholder-neutral-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2" htmlFor="expense-amount">Total Amount (₹)</label>
            <input
              id="expense-amount"
              type="number"
              value={amountRupees}
              onChange={(e) => setAmountRupees(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="w-full px-4 py-3.5 rounded-2xl apple-input text-slate-900 placeholder-neutral-400 font-semibold text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2" htmlFor="expense-paidby">Paid by</label>
            <div className="relative">
              <select
                id="expense-paidby"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl apple-input text-slate-900 appearance-none pr-10 font-medium cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} {m._id === user?._id ? '(you)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Split type</label>
            <div className="grid grid-cols-2 gap-2.5 p-1 bg-black/[0.04] rounded-2xl border border-black/[0.04]">
              <button
                type="button"
                id="split-equal-btn"
                onClick={() => setSplitType('equal')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  splitType === 'equal'
                    ? 'bg-white text-emerald-700 shadow-apple-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Equal size={16} />
                Equal split
              </button>
              <button
                type="button"
                id="split-custom-btn"
                onClick={() => setSplitType('custom')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  splitType === 'custom'
                    ? 'bg-white text-emerald-700 shadow-apple-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Sliders size={16} />
                Custom split
              </button>
            </div>
          </div>

          {splitType === 'equal' && amountPaise > 0 && members.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.02] border border-black/[0.06]">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Split preview</p>
              <div className="space-y-2.5">
                {members.map((m, i) => {
                  const base = Math.floor(amountPaise / members.length);
                  const share = i === 0 ? base + (amountPaise - base * members.length) : base;
                  return (
                    <div key={m._id} className="flex justify-between items-center text-sm py-1 border-b border-black/[0.03] last:border-0">
                      <span className="font-medium text-neutral-800">{m.name}</span>
                      <span className="text-slate-900 font-bold">{formatPaise(share)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {splitType === 'custom' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custom amounts (₹)</p>
                <span
                  className={`text-xs font-semibold ${
                    splitDifference === 0
                      ? 'text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full'
                      : splitDifference > 0
                      ? 'text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full'
                      : 'text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full'
                  }`}
                >
                  {splitDifference === 0
                    ? '✓ Balanced'
                    : splitDifference > 0
                    ? `${formatPaise(splitDifference)} remaining`
                    : `${formatPaise(-splitDifference)} over`}
                </span>
              </div>
              <div className="space-y-2.5">
                {customSplits.map((s) => (
                  <div key={s.user} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-800 w-28 truncate">{s.name}</span>
                    <input
                      id={`split-amount-${s.user}`}
                      type="number"
                      value={s.amountRupees}
                      onChange={(e) => handleCustomSplitChange(s.user, e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 rounded-xl apple-input text-slate-900 placeholder-neutral-400 flex-1 text-sm font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 mt-6 border-t border-black/[0.06]">
            <button
              type="button"
              id="cancel-expense-btn"
              onClick={onClose}
              className="flex-1 py-3.5 px-5 rounded-full font-medium text-neutral-700 bg-slate-100 hover:bg-slate-200/80 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-expense-btn"
              disabled={loading}
              className="flex-1 py-3.5 px-5 rounded-full font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-apple-xs hover:shadow-apple active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Adding...
                </span>
              ) : (
                'Add Expense'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ExpenseModal;
