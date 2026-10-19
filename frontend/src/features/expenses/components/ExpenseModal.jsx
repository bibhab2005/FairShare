import { useState, useEffect } from 'react';
import { X, IndianRupee, AlertCircle, ChevronDown, Equal, Sliders, Loader2, Plus, Trash2, ListOrdered, Camera, RefreshCw, Globe } from 'lucide-react';
import { createExpense } from '../api/expenseService';
import { useAuth } from '../../auth/context/AuthContext';
import { formatPaise, rupeeToRoundedPaise } from '../../../core/utils/formatCurrency';
import { enqueueOfflineExpense } from '../../../core/utils/offlineQueue';
import { parseReceiptImage } from '../../../core/utils/receiptParser';
import { CURRENCIES, convertToINR } from '../../../core/utils/currencyUtils';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const EXPENSE_CATEGORIES = [
  { id: 'general', label: 'General', icon: '📝' },
  { id: 'food', label: 'Food & Dining', icon: '🍽️' },
  { id: 'travel', label: 'Travel & Cab', icon: '🚗' },
  { id: 'groceries', label: 'Groceries', icon: '🛒' },
  { id: 'utilities', label: 'Bills & Utilities', icon: '⚡' },
  { id: 'rent', label: 'Rent & Housing', icon: '🏠' },
  { id: 'entertainment', label: 'Entertainment', icon: '🍿' },
];

const ExpenseModal = ({ group, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [category, setCategory] = useState('general');
  const [paidBy, setPaidBy] = useState(user?._id || '');
  const [splitType, setSplitType] = useState('equal');
  const [customSplits, setCustomSplits] = useState([]);
  const [itemizedList, setItemizedList] = useState([
    { id: 1, name: '', amountRupees: '', sharedWith: [] }
  ]);
  const [taxTipRupees, setTaxTipRupees] = useState('');
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const members = group?.members || [];
  const currObj = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const currencySymbol = currObj.symbol;

  const enteredAmount = parseFloat(amountRupees) || 0;
  const convertedTotalRupees = currency === 'INR' ? enteredAmount : convertToINR(enteredAmount, currency);
  const amountPaise = rupeeToRoundedPaise(convertedTotalRupees);

  useEffect(() => {
    if (members.length > 0) {
      setCustomSplits(
        members.map((m) => ({ user: m._id, name: m.name, amountRupees: '' }))
      );
      setItemizedList([
        { id: Date.now(), name: '', amountRupees: '', sharedWith: members.map(m => m._id) }
      ]);
    }
  }, [group]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const customTotal = customSplits.reduce(
    (sum, s) => sum + (parseFloat(s.amountRupees) || 0),
    0
  );
  const splitDifference = Math.round((enteredAmount - customTotal) * 100) / 100;

  const handleCustomSplitChange = (userId, value) => {
    setCustomSplits((prev) =>
      prev.map((s) => (s.user === userId ? { ...s, amountRupees: value } : s))
    );
  };

  const handleReceiptScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanningReceipt(true);
    const toastId = toast.loading('Scanning receipt with OCR...');
    try {
      const data = await parseReceiptImage(file);
      if (data.description && (!description || description.trim() === '')) {
        setDescription(data.description);
      }
      if (data.amount) {
        setAmountRupees(data.amount);
      }
      if (data.category) {
        setCategory(data.category);
      }
      toast.success('Receipt details extracted!', { id: toastId, icon: '📸' });
    } catch (err) {
      toast.error('Could not extract receipt data. Please enter manually.', { id: toastId });
    } finally {
      setIsScanningReceipt(false);
      e.target.value = '';
    }
  };

  const handleAddItem = () => {
    setItemizedList((prev) => [
      ...prev,
      { id: Date.now(), name: '', amountRupees: '', sharedWith: members.map((m) => m._id) },
    ]);
  };

  const handleRemoveItem = (itemId) => {
    if (itemizedList.length <= 1) return;
    setItemizedList((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleItemChange = (itemId, field, value) => {
    setItemizedList((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    );
  };

  const toggleItemMember = (itemId, memberId) => {
    setItemizedList((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const exists = item.sharedWith.includes(memberId);
        const newShared = exists
          ? item.sharedWith.filter((id) => id !== memberId)
          : [...item.sharedWith, memberId];
        return { ...item, sharedWith: newShared };
      })
    );
  };

  const calculateItemizedSummary = () => {
    const memberShares = {};
    members.forEach((m) => {
      memberShares[m._id] = 0;
    });

    let itemsSubtotal = 0;
    itemizedList.forEach((item) => {
      const price = parseFloat(item.amountRupees) || 0;
      itemsSubtotal += price;
      if (item.sharedWith.length > 0 && price > 0) {
        const splitAmount = price / item.sharedWith.length;
        item.sharedWith.forEach((mId) => {
          if (memberShares[mId] !== undefined) {
            memberShares[mId] += splitAmount;
          }
        });
      }
    });

    const taxTip = parseFloat(taxTipRupees) || 0;
    const finalTotal = itemsSubtotal + taxTip;

    if (taxTip > 0 && itemsSubtotal > 0) {
      members.forEach((m) => {
        const ratio = memberShares[m._id] / itemsSubtotal;
        memberShares[m._id] += taxTip * ratio;
      });
    }

    return {
      memberShares,
      itemsSubtotal,
      finalTotal,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) return toast.error('Please enter a description.');
    if (!paidBy) return toast.error('Please select who paid.');

    if (splitType === 'itemized') {
      const { memberShares, finalTotal } = calculateItemizedSummary();
      if (finalTotal <= 0) return toast.error('Please enter at least one item price.');
      if (itemizedList.some((it) => (parseFloat(it.amountRupees) || 0) > 0 && it.sharedWith.length === 0)) {
        return toast.error('Each item must be shared with at least one member.');
      }

      const inrFinalTotal = currency === 'INR' ? finalTotal : convertToINR(finalTotal, currency);
      const itemizedTotalPaise = Math.round(inrFinalTotal * 100);
      let runningSum = 0;
      const computedSplits = members.map((m, idx) => {
        if (idx === members.length - 1) {
          const share = Math.max(0, itemizedTotalPaise - runningSum);
          return { user: m._id, amountPaise: share };
        }
        const inrVal = currency === 'INR' ? (memberShares[m._id] || 0) : convertToINR(memberShares[m._id] || 0, currency);
        const share = Math.round(inrVal * 100);
        runningSum += share;
        return { user: m._id, amountPaise: share };
      }).filter((s) => s.amountPaise > 0);

      const payload = {
        groupId: group._id,
        description: description.trim(),
        amountPaise: itemizedTotalPaise,
        paidBy,
        splitType: 'custom',
        category,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : 'none',
        originalCurrency: currency,
        splits: computedSplits,
      };

      if (!navigator.onLine) {
        enqueueOfflineExpense(payload);
        toast.success('Saved offline! Will sync automatically when back online.', { icon: '📡' });
        onSuccess();
        onClose();
        return;
      }

      try {
        setLoading(true);
        await createExpense(payload);
        toast.success('Itemized expense added successfully!');
        onSuccess();
        onClose();
        return;
      } catch (err) {
        if (!err.response || err.code === 'ERR_NETWORK') {
          enqueueOfflineExpense(payload);
          toast.success('Network unavailable. Saved offline to sync later.', { icon: '📡' });
          onSuccess();
          onClose();
          return;
        }
        toast.error(err.response?.data?.message || 'Failed to create expense. Please try again.');
        setLoading(false);
        return;
      }
    }

    if (!amountPaise || amountPaise <= 0) return toast.error('Please enter a valid amount.');

    if (splitType === 'custom') {
      if (splitDifference !== 0) {
        return toast.error(
          `Custom splits must equal the total. Difference: ${currencySymbol}${Math.abs(splitDifference).toFixed(2)} ${splitDifference > 0 ? 'remaining' : 'over'}.`
        );
      }
      if (customSplits.some((s) => (parseFloat(s.amountRupees) || 0) < 0)) {
        return toast.error('Split amounts cannot be negative.');
      }
    }

    const validCustomSplits = customSplits.filter((s) => (parseFloat(s.amountRupees) || 0) > 0);
    let runningSplitSum = 0;
    const computedCustomSplits = validCustomSplits.map((s, idx) => {
      if (idx === validCustomSplits.length - 1) {
        return { user: s.user, amountPaise: Math.max(0, amountPaise - runningSplitSum) };
      }
      const inrVal = currency === 'INR' ? parseFloat(s.amountRupees) : convertToINR(s.amountRupees, currency);
      const sharePaise = rupeeToRoundedPaise(inrVal);
      runningSplitSum += sharePaise;
      return { user: s.user, amountPaise: sharePaise };
    });

    const payload = {
      groupId: group._id,
      description: description.trim(),
      amountPaise,
      paidBy,
      splitType,
      category,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : 'none',
      originalCurrency: currency,
      ...(splitType === 'custom' && {
        splits: computedCustomSplits,
      }),
    };

    if (!navigator.onLine) {
      enqueueOfflineExpense(payload);
      toast.success('Saved offline! Will sync automatically when back online.', { icon: '📡' });
      onSuccess();
      onClose();
      return;
    }

    try {
      setLoading(true);
      await createExpense(payload);
      toast.success('Expense added successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        enqueueOfflineExpense(payload);
        toast.success('Network unavailable. Saved offline to sync later.', { icon: '📡' });
        onSuccess();
        onClose();
        return;
      }
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-800" htmlFor="expense-description">Description</label>
              <label 
                htmlFor="receipt-upload-input" 
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all active:scale-95 border ${
                  isScanningReceipt 
                    ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {isScanningReceipt ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Scanning OCR...</span>
                  </>
                ) : (
                  <>
                    <Camera size={13} />
                    <span>Scan Receipt</span>
                  </>
                )}
              </label>
              <input 
                id="receipt-upload-input" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleReceiptScan} 
                disabled={isScanningReceipt}
              />
            </div>
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

          {splitType !== 'itemized' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-800" htmlFor="expense-amount">
                  Total Amount ({currencySymbol})
                </label>
                <div className="flex items-center gap-1.5 bg-black/[0.04] px-2.5 py-1 rounded-full border border-black/[0.04]">
                  <Globe size={13} className="text-slate-500" />
                  <select
                    id="expense-currency-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="text-xs font-semibold text-slate-700 bg-transparent border-none p-0 focus:outline-none cursor-pointer"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="relative">
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
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 pointer-events-none">
                  {currencySymbol}
                </div>
              </div>
              {currency !== 'INR' && amountRupees && (
                <p className="mt-1.5 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <span>≈ ₹{convertToINR(amountRupees, currency).toFixed(2)} INR</span>
                  <span className="text-slate-400 font-normal">
                    (1 {currency} = ₹{CURRENCIES.find((c) => c.code === currency)?.rateToINR})
                  </span>
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 flex items-center gap-1.5 ${
                    category === cat.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-apple-xs'
                      : 'bg-black/[0.03] text-slate-700 border-black/[0.06] hover:bg-black/[0.06]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
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
            <div className="grid grid-cols-3 gap-2 p-1 bg-black/[0.04] rounded-2xl border border-black/[0.04]">
              <button
                type="button"
                id="split-equal-btn"
                onClick={() => setSplitType('equal')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  splitType === 'equal'
                    ? 'bg-white text-emerald-700 shadow-apple-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Equal size={15} />
                <span>Equal</span>
              </button>
              <button
                type="button"
                id="split-custom-btn"
                onClick={() => setSplitType('custom')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  splitType === 'custom'
                    ? 'bg-white text-emerald-700 shadow-apple-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Sliders size={15} />
                <span>Custom</span>
              </button>
              <button
                type="button"
                id="split-itemized-btn"
                onClick={() => setSplitType('itemized')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  splitType === 'itemized'
                    ? 'bg-white text-emerald-700 shadow-apple-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <ListOrdered size={15} />
                <span>Itemized</span>
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
                      <span className="text-slate-900 font-bold">
                        {currency !== 'INR' && (
                          <span className="mr-1">{currencySymbol}{(enteredAmount / members.length).toFixed(2)}</span>
                        )}
                        <span className={currency !== 'INR' ? 'text-xs text-slate-400 font-normal' : ''}>
                          {currency !== 'INR' ? `(${formatPaise(share)})` : formatPaise(share)}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {splitType === 'custom' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custom amounts ({currencySymbol})</p>
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
                    ? `${currencySymbol}${splitDifference.toFixed(2)} remaining`
                    : `${currencySymbol}${(-splitDifference).toFixed(2)} over`}
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

          {splitType === 'itemized' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Itemized Dishes / Bills</p>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-500/20 active:scale-95 shadow-apple-xs transition-all"
                >
                  <Plus size={13} />
                  Add Item
                </button>
              </div>

              <div className="space-y-3.5">
                {itemizedList.map((item, idx) => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-apple-xs space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Item ${idx + 1} (e.g. Pasta)`}
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 text-sm rounded-xl apple-input text-slate-900 placeholder-neutral-400 font-medium"
                      />
                      <div className="relative w-28 shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          value={item.amountRupees}
                          onChange={(e) => handleItemChange(item.id, 'amountRupees', e.target.value)}
                          className="w-full pl-7 pr-3 py-2 text-sm rounded-xl apple-input text-slate-900 placeholder-neutral-400 font-semibold"
                        />
                      </div>
                      {itemizedList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 active:scale-90 rounded-full transition-all shrink-0"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Shared by:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {members.map(m => {
                          const isSelected = item.sharedWith.includes(m._id);
                          return (
                            <button
                              key={m._id}
                              type="button"
                              onClick={() => toggleItemMember(item.id, m._id)}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-apple-xs'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {m.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between gap-3">
                <label className="text-xs font-semibold text-slate-600">Tax, Tip & Service (₹)</label>
                <div className="relative w-32 shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={taxTipRupees}
                    onChange={(e) => setTaxTipRupees(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs rounded-xl apple-input text-slate-900 font-semibold"
                  />
                </div>
              </div>

              {(() => {
                const { memberShares, finalTotal } = calculateItemizedSummary();
                return (
                  <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-500/20 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-900 border-b border-emerald-500/20 pb-2">
                      <span>Total Calculated</span>
                      <span className="text-sm">₹{finalTotal.toFixed(2)}</span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {members.map(m => (
                        <div key={m._id} className="flex justify-between items-center text-xs text-emerald-800">
                          <span>{m.name}</span>
                          <span className="font-bold">₹{(memberShares[m._id] || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-black/[0.02] border border-black/[0.05]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl transition-colors ${isRecurring ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                  <RefreshCw size={16} className={isRecurring ? 'animate-spin-slow' : ''} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-800">Repeat Expense</span>
                  <p className="text-xs text-slate-500">Auto-recurring (rent, bills, subscriptions)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  id="expense-recurring-toggle"
                  type="checkbox" 
                  checked={isRecurring} 
                  onChange={(e) => setIsRecurring(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {isRecurring && (
              <div className="mt-3 pt-3 border-t border-black/[0.05] flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Frequency</span>
                <div className="flex gap-1.5">
                  {['daily', 'weekly', 'monthly'].map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setRecurringFrequency(freq)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                        recurringFrequency === freq
                          ? 'bg-indigo-600 text-white shadow-apple-xs'
                          : 'bg-white text-slate-600 border border-black/[0.08] hover:bg-slate-50'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

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
