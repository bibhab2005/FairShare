import { useState, useEffect } from 'react';
import { X, Receipt, AlertCircle, ChevronDown, Equal, Sliders, Loader2 } from 'lucide-react';
import { createExpense } from '../api/expenseApi';
import { useAuth } from '../context/AuthContext';
import { formatPaise, rupeeToRoundedPaise } from '../utils/formatCurrency';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white border border-neutral-200 shadow-2xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Receipt size={18} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-neutral-950">Add Expense</h2>
              <p className="text-sm text-neutral-500">{group.name}</p>
            </div>
          </div>
          <button
            id="expense-modal-close"
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <form id="add-expense-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-950 mb-2" htmlFor="expense-description">Description</label>
            <input
              id="expense-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dinner at restaurant"
              className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-950 mb-2" htmlFor="expense-amount">Total Amount (₹)</label>
            <input
              id="expense-amount"
              type="number"
              value={amountRupees}
              onChange={(e) => setAmountRupees(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-950 mb-2" htmlFor="expense-paidby">Paid by</label>
            <div className="relative">
              <select
                id="expense-paidby"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-950 appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
              >
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} {m._id === user?._id ? '(you)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-950 mb-2">Split type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="split-equal-btn"
                onClick={() => setSplitType('equal')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  splitType === 'equal'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <Equal size={16} />
                Equal split
              </button>
              <button
                type="button"
                id="split-custom-btn"
                onClick={() => setSplitType('custom')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  splitType === 'custom'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <Sliders size={16} />
                Custom split
              </button>
            </div>
          </div>

          {splitType === 'equal' && amountPaise > 0 && members.length > 0 && (
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Split preview</p>
              <div className="space-y-3">
                {members.map((m, i) => {
                  const base = Math.floor(amountPaise / members.length);
                  const share = i === 0 ? base + (amountPaise - base * members.length) : base;
                  return (
                    <div key={m._id} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-neutral-700">{m.name}</span>
                      <span className="text-neutral-950 font-semibold">{formatPaise(share)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {splitType === 'custom' && (
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Custom amounts (₹)</p>
                <span
                  className={`text-xs font-semibold ${
                    splitDifference === 0
                      ? 'text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md'
                      : splitDifference > 0
                      ? 'text-amber-600 bg-amber-50 px-2 py-1 rounded-md'
                      : 'text-rose-600 bg-rose-50 px-2 py-1 rounded-md'
                  }`}
                >
                  {splitDifference === 0
                    ? '✓ Balanced'
                    : splitDifference > 0
                    ? `${formatPaise(splitDifference)} remaining`
                    : `${formatPaise(-splitDifference)} over`}
                </span>
              </div>
              <div className="space-y-3">
                {customSplits.map((s) => (
                  <div key={s.user} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-neutral-700 w-28 truncate">{s.name}</span>
                    <input
                      id={`split-amount-${s.user}`}
                      type="number"
                      value={s.amountRupees}
                      onChange={(e) => handleCustomSplitChange(s.user, e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 flex-1 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 mt-6 border-t border-neutral-100">
            <button
              type="button"
              id="cancel-expense-btn"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-full font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-expense-btn"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-full font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
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
