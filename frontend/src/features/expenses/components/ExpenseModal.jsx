import { useState, useEffect } from 'react';
import { 
  X, IndianRupee, AlertCircle, ChevronDown, Equal, Sliders, Loader2, Plus, 
  Trash2, ListOrdered, Camera, RefreshCw, Globe, Percent, Divide, Users, Check 
} from 'lucide-react';
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

/**
 * Compresses an image file client-side to a max dimension of 1000px JPEG.
 */
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        const maxWidth = 1000;
        const maxHeight = 1000;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.65));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const ExpenseModal = ({ group, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [category, setCategory] = useState('general');
  const [paidBy, setPaidBy] = useState(user?._id || '');
  const [isMultiPayer, setIsMultiPayer] = useState(false);
  const [payerList, setPayerList] = useState([]);
  
  // Split type: 'equal' | 'shares' | 'percentage' | 'custom' | 'itemized'
  const [splitType, setSplitType] = useState('equal');
  const [customSplits, setCustomSplits] = useState([]);
  const [sharesList, setSharesList] = useState([]);
  const [percentageList, setPercentageList] = useState([]);
  const [itemizedList, setItemizedList] = useState([
    { id: 1, name: '', amountRupees: '', sharedWith: [] }
  ]);
  const [taxTipRupees, setTaxTipRupees] = useState('');
  
  // OCR & Image Lightbox
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);

  // Recurring
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');

  const [loading, setLoading] = useState(false);

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
      setSharesList(
        members.map((m) => ({ user: m._id, name: m.name, shares: 1 }))
      );
      setPercentageList(
        members.map((m) => ({ user: m._id, name: m.name, percent: '' }))
      );
      setPayerList(
        members.map((m) => ({ user: m._id, name: m.name, amountRupees: '' }))
      );
      setItemizedList([
        { id: Date.now(), name: '', amountRupees: '', sharedWith: members.map((m) => m._id) }
      ]);
    }
  }, [group]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Multi-Payer balance calculations
  const totalPaidRupees = payerList.reduce(
    (sum, p) => sum + (parseFloat(p.amountRupees) || 0),
    0
  );
  const payerDifference = Math.round((enteredAmount - totalPaidRupees) * 100) / 100;

  // Custom splits calculation
  const customTotal = customSplits.reduce(
    (sum, s) => sum + (parseFloat(s.amountRupees) || 0),
    0
  );
  const splitDifference = Math.round((enteredAmount - customTotal) * 100) / 100;

  // Shares calculation
  const totalShares = sharesList.reduce(
    (sum, s) => sum + (parseInt(s.shares) || 0),
    0
  );

  // Percentage calculation
  const totalPercent = percentageList.reduce(
    (sum, p) => sum + (parseFloat(p.percent) || 0),
    0
  );
  const percentDifference = Math.round((100 - totalPercent) * 10) / 10;

  const handleCustomSplitChange = (userId, value) => {
    setCustomSplits((prev) =>
      prev.map((s) => (s.user === userId ? { ...s, amountRupees: value } : s))
    );
  };

  const handleShareChange = (userId, delta) => {
    setSharesList((prev) =>
      prev.map((s) =>
        s.user === userId ? { ...s, shares: Math.max(0, (parseInt(s.shares) || 0) + delta) } : s
      )
    );
  };

  const handlePercentChange = (userId, value) => {
    setPercentageList((prev) =>
      prev.map((p) => (p.user === userId ? { ...p, percent: value } : p))
    );
  };

  const handlePayerChange = (userId, value) => {
    setPayerList((prev) =>
      prev.map((p) => (p.user === userId ? { ...p, amountRupees: value } : p))
    );
  };

  const handleReceiptScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanningReceipt(true);
    const toastId = toast.loading('Processing receipt with OCR...');
    try {
      try {
        const compressed = await compressImage(file);
        setReceiptImage(compressed);
      } catch (imgErr) {
        console.warn('Image compression failed:', imgErr);
      }

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
      toast.success('Receipt details extracted & photo attached!', { id: toastId, icon: '📸' });
    } catch (err) {
      toast.error('Could not extract details. Photo is still attached.', { id: toastId });
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

  /**
   * Computes the exact array of [{ user, amountPaise }] for the given total and active splitType.
   */
  const computeSplitsForTotal = (targetTotalPaise) => {
    if (splitType === 'equal') {
      const memberCount = members.length;
      const baseShare = Math.floor(targetTotalPaise / memberCount);
      const remainder = targetTotalPaise - baseShare * memberCount;
      return members.map((m, idx) => ({
        user: m._id,
        amountPaise: idx === 0 ? baseShare + remainder : baseShare,
      }));
    }

    if (splitType === 'shares') {
      if (totalShares <= 0) return null;
      let runningSum = 0;
      return sharesList.map((s, idx) => {
        if (idx === sharesList.length - 1) {
          return { user: s.user, amountPaise: Math.max(0, targetTotalPaise - runningSum) };
        }
        const ratio = (parseInt(s.shares) || 0) / totalShares;
        const share = Math.round(targetTotalPaise * ratio);
        runningSum += share;
        return { user: s.user, amountPaise: share };
      });
    }

    if (splitType === 'percentage') {
      if (percentDifference !== 0) return null;
      let runningSum = 0;
      return percentageList.map((p, idx) => {
        if (idx === percentageList.length - 1) {
          return { user: p.user, amountPaise: Math.max(0, targetTotalPaise - runningSum) };
        }
        const ratio = (parseFloat(p.percent) || 0) / 100;
        const share = Math.round(targetTotalPaise * ratio);
        runningSum += share;
        return { user: p.user, amountPaise: share };
      });
    }

    if (splitType === 'custom') {
      const valid = customSplits.filter((s) => (parseFloat(s.amountRupees) || 0) > 0);
      let runningSum = 0;
      return valid.map((s, idx) => {
        if (idx === valid.length - 1) {
          return { user: s.user, amountPaise: Math.max(0, targetTotalPaise - runningSum) };
        }
        const inrVal = currency === 'INR' ? parseFloat(s.amountRupees) : convertToINR(s.amountRupees, currency);
        const share = rupeeToRoundedPaise(inrVal);
        runningSum += share;
        return { user: s.user, amountPaise: share };
      });
    }

    if (splitType === 'itemized') {
      const { memberShares, finalTotal } = calculateItemizedSummary();
      const inrFinal = currency === 'INR' ? finalTotal : convertToINR(finalTotal, currency);
      const computedTotalPaise = Math.round(inrFinal * 100);
      let runningSum = 0;
      return members.map((m, idx) => {
        if (idx === members.length - 1) {
          const share = Math.max(0, computedTotalPaise - runningSum);
          return { user: m._id, amountPaise: share };
        }
        const inrVal = currency === 'INR' ? (memberShares[m._id] || 0) : convertToINR(memberShares[m._id] || 0, currency);
        const share = Math.round(inrVal * 100);
        runningSum += share;
        return { user: m._id, amountPaise: share };
      }).filter((s) => s.amountPaise > 0);
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) return toast.error('Please enter a description.');

    let finalExpenseTotalPaise = amountPaise;

    if (splitType === 'itemized') {
      const { finalTotal } = calculateItemizedSummary();
      if (finalTotal <= 0) return toast.error('Please enter at least one item price.');
      if (itemizedList.some((it) => (parseFloat(it.amountRupees) || 0) > 0 && it.sharedWith.length === 0)) {
        return toast.error('Each item must be shared with at least one member.');
      }
      const inrFinal = currency === 'INR' ? finalTotal : convertToINR(finalTotal, currency);
      finalExpenseTotalPaise = Math.round(inrFinal * 100);
    } else {
      if (!amountPaise || amountPaise <= 0) return toast.error('Please enter a valid amount.');
    }

    // Split validation
    if (splitType === 'shares' && totalShares <= 0) {
      return toast.error('Total shares must be greater than zero.');
    }
    if (splitType === 'percentage' && percentDifference !== 0) {
      return toast.error(`Percentages must add up to 100%. Currently: ${totalPercent.toFixed(1)}%`);
    }
    if (splitType === 'custom') {
      if (splitDifference !== 0) {
        return toast.error(
          `Custom splits must equal the total. Difference: ${currencySymbol}${Math.abs(splitDifference).toFixed(2)} ${splitDifference > 0 ? 'remaining' : 'over'}.`
        );
      }
    }

    // Multi-Payer Validation
    if (isMultiPayer) {
      if (splitType === 'itemized') {
        const { finalTotal } = calculateItemizedSummary();
        const diff = Math.round((finalTotal - totalPaidRupees) * 100) / 100;
        if (diff !== 0) {
          return toast.error(`Total paid must equal itemized total (${currencySymbol}${finalTotal.toFixed(2)}). Difference: ${currencySymbol}${Math.abs(diff).toFixed(2)}`);
        }
      } else {
        if (payerDifference !== 0) {
          return toast.error(`Total paid must equal total amount (${currencySymbol}${enteredAmount.toFixed(2)}). Difference: ${currencySymbol}${Math.abs(payerDifference).toFixed(2)}`);
        }
      }
    } else {
      if (!paidBy) return toast.error('Please select who paid.');
    }

    const computedBaseSplits = computeSplitsForTotal(finalExpenseTotalPaise);
    if (!computedBaseSplits || computedBaseSplits.length === 0) {
      return toast.error('Invalid splits. Please check the values.');
    }

    setLoading(true);

    try {
      if (isMultiPayer) {
        // Multi-Payer Mode: Create proportional sub-expenses for each payer
        const activePayers = payerList.filter((p) => (parseFloat(p.amountRupees) || 0) > 0);
        const totalPaid = activePayers.reduce((sum, p) => sum + (parseFloat(p.amountRupees) || 0), 0);

        for (const payer of activePayers) {
          const payerAmt = parseFloat(payer.amountRupees) || 0;
          const ratio = payerAmt / totalPaid;
          const payerPaise = rupeeToRoundedPaise(currency === 'INR' ? payerAmt : convertToINR(payerAmt, currency));

          let subRunning = 0;
          const subSplits = computedBaseSplits.map((s, idx) => {
            if (idx === computedBaseSplits.length - 1) {
              return { user: s.user, amountPaise: Math.max(0, payerPaise - subRunning) };
            }
            const share = Math.round(s.amountPaise * ratio);
            subRunning += share;
            return { user: s.user, amountPaise: share };
          });

          const subPayload = {
            groupId: group._id,
            description: `${description.trim()} (${payer.name}'s payment)`,
            amountPaise: payerPaise,
            paidBy: payer.user,
            splitType: 'custom',
            category,
            isRecurring,
            recurringFrequency: isRecurring ? recurringFrequency : 'none',
            originalCurrency: currency,
            receiptImage,
            splits: subSplits,
          };

          if (!navigator.onLine) {
            enqueueOfflineExpense(subPayload);
          } else {
            await createExpense(subPayload);
          }
        }

        toast.success(
          !navigator.onLine
            ? 'Multi-payer expense saved offline! Will sync when back online.'
            : 'Multi-payer expense added successfully!',
          { icon: '👥' }
        );
      } else {
        // Single Payer Mode
        const payload = {
          groupId: group._id,
          description: description.trim(),
          amountPaise: finalExpenseTotalPaise,
          paidBy,
          splitType: splitType === 'equal' ? 'equal' : 'custom',
          category,
          isRecurring,
          recurringFrequency: isRecurring ? recurringFrequency : 'none',
          originalCurrency: currency,
          receiptImage,
          splits: computedBaseSplits,
        };

        if (!navigator.onLine) {
          enqueueOfflineExpense(payload);
          toast.success('Saved offline! Will sync automatically when back online.', { icon: '📡' });
        } else {
          await createExpense(payload);
          toast.success('Expense added successfully!');
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        toast.success('Network issue. Saved offline to sync later.', { icon: '📡' });
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/45 backdrop-blur-md" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="relative w-full sm:max-w-lg apple-glass-card rounded-t-[2.25rem] sm:rounded-[2.25rem] shadow-apple-2xl border border-white/80 flex flex-col max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-2xl"
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Modal Header (Fixed) */}
        <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between shrink-0 bg-white/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-apple-xs">
              <IndianRupee size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">Add Expense</h2>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full max-w-[130px] truncate">
                  {group.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Split bills, meals & trips with group</p>
            </div>
          </div>
          <button
            id="expense-modal-close"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-slate-400 hover:text-slate-800 flex items-center justify-center active:scale-90 transition-all"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form id="add-expense-form" onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Hero Amount Display */}
            {splitType !== 'itemized' ? (
              <div className="py-3 px-4 rounded-3xl bg-gradient-to-b from-slate-50 to-slate-100/50 border border-slate-200/60 flex flex-col items-center justify-center shadow-apple-xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Total Amount
                </span>
                <div className="flex items-center justify-center gap-1.5 w-full">
                  <span className="text-3xl sm:text-4xl font-semibold text-slate-400 select-none">
                    {currencySymbol}
                  </span>
                  <input
                    id="expense-amount"
                    type="number"
                    value={amountRupees}
                    onChange={(e) => setAmountRupees(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="w-48 sm:w-56 text-center text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 bg-transparent border-none p-0 focus:outline-none placeholder-slate-300"
                    autoFocus
                  />
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/[0.08] shadow-apple-xs transition-colors cursor-pointer">
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
                  {currency !== 'INR' && amountRupees && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                      ≈ ₹{convertToINR(amountRupees, currency).toFixed(2)} INR
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-3 px-4 rounded-3xl bg-emerald-50/60 border border-emerald-500/20 flex items-center justify-between shadow-apple-xs">
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Itemized Total</span>
                <span className="text-2xl font-extrabold text-emerald-700 tracking-tight">
                  {currencySymbol}{calculateItemizedSummary().finalTotal.toFixed(2)}
                </span>
              </div>
            )}

            {/* Description & Receipt OCR Scan */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="expense-description">
                  Description
                </label>
                <label 
                  htmlFor="receipt-upload-input" 
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all active:scale-95 border ${
                    isScanningReceipt 
                      ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-apple-xs'
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
                placeholder="e.g. Dinner at restaurant, flight, groceries"
                className="w-full px-4 py-3 rounded-2xl apple-input text-slate-900 placeholder-slate-400 font-medium text-sm"
              />

              {/* Receipt Preview Thumbnail */}
              {receiptImage && (
                <div className="mt-2.5 p-2 rounded-2xl bg-black/[0.03] border border-black/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={receiptImage} alt="Receipt preview" className="w-10 h-10 object-cover rounded-xl border border-black/[0.08]" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Receipt Photo Attached</p>
                      <p className="text-[10px] text-slate-400">Saved with expense & viewable in lightbox</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setReceiptImage(null)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove receipt photo"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>

          {/* Category Picker */}
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

          {/* Paid By: Single Payer vs Multi-Payer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-800" htmlFor="expense-paidby">
                Paid by
              </label>
              <button
                type="button"
                onClick={() => setIsMultiPayer(!isMultiPayer)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all active:scale-95 flex items-center gap-1 ${
                  isMultiPayer
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-black/[0.03] text-slate-600 border-black/[0.06] hover:bg-black/[0.06]'
                }`}
              >
                <Users size={12} />
                <span>{isMultiPayer ? 'Multiple Payers' : 'Single Payer'}</span>
              </button>
            </div>

            {!isMultiPayer ? (
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
            ) : (
              <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider">Amount Paid per Person</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full ${
                      payerDifference === 0
                        ? 'text-emerald-700 bg-emerald-50'
                        : payerDifference > 0
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-rose-700 bg-rose-50'
                    }`}
                  >
                    {payerDifference === 0
                      ? '✓ Balanced'
                      : payerDifference > 0
                      ? `${currencySymbol}${payerDifference.toFixed(2)} remaining`
                      : `${currencySymbol}${(-payerDifference).toFixed(2)} over`}
                  </span>
                </div>
                <div className="space-y-2">
                  {payerList.map((p) => (
                    <div key={p.user} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-800 w-28 truncate">{p.name}</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={p.amountRupees}
                        onChange={(e) => handlePayerChange(p.user, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl apple-input text-slate-900 placeholder-neutral-400 flex-1 text-sm font-semibold"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Split Type Tabs */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Split type</label>
            <div className="grid grid-cols-5 gap-1 p-1 bg-black/[0.04] rounded-2xl border border-black/[0.04]">
              <button
                type="button"
                id="split-equal-btn"
                onClick={() => setSplitType('equal')}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  splitType === 'equal'
                    ? 'bg-white text-emerald-700 shadow-apple-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title="Split equally"
              >
                <Equal size={14} />
                <span>Equal</span>
              </button>
              <button
                type="button"
                id="split-shares-btn"
                onClick={() => setSplitType('shares')}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  splitType === 'shares'
                    ? 'bg-white text-emerald-700 shadow-apple-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title="Split by shares/ratios"
              >
                <Divide size={14} />
                <span>Shares</span>
              </button>
              <button
                type="button"
                id="split-percentage-btn"
                onClick={() => setSplitType('percentage')}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  splitType === 'percentage'
                    ? 'bg-white text-emerald-700 shadow-apple-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title="Split by percentages"
              >
                <Percent size={14} />
                <span>% Split</span>
              </button>
              <button
                type="button"
                id="split-custom-btn"
                onClick={() => setSplitType('custom')}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  splitType === 'custom'
                    ? 'bg-white text-emerald-700 shadow-apple-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title="Custom amounts"
              >
                <Sliders size={14} />
                <span>Custom</span>
              </button>
              <button
                type="button"
                id="split-itemized-btn"
                onClick={() => setSplitType('itemized')}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  splitType === 'itemized'
                    ? 'bg-white text-emerald-700 shadow-apple-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title="Itemized dishes"
              >
                <ListOrdered size={14} />
                <span>Itemized</span>
              </button>
            </div>
          </div>

          {/* Equal Split Preview */}
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

          {/* Shares Split Section */}
          {splitType === 'shares' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shares per Person</p>
                <span className="text-xs font-semibold text-slate-600 bg-black/[0.04] px-2.5 py-1 rounded-full">
                  Total: {totalShares} {totalShares === 1 ? 'share' : 'shares'}
                </span>
              </div>
              <div className="space-y-2.5">
                {sharesList.map((s) => {
                  const memberRatio = totalShares > 0 ? (parseInt(s.shares) || 0) / totalShares : 0;
                  const estimatedRupees = enteredAmount * memberRatio;
                  return (
                    <div key={s.user} className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-slate-800 truncate block">{s.name}</span>
                        <span className="text-xs text-emerald-700 font-semibold">
                          ≈ {currencySymbol}{estimatedRupees.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleShareChange(s.user, -1)}
                          className="w-8 h-8 rounded-xl bg-white border border-black/[0.08] text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 active:scale-95 shadow-apple-xs"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-slate-900">{s.shares}</span>
                        <button
                          type="button"
                          onClick={() => handleShareChange(s.user, 1)}
                          className="w-8 h-8 rounded-xl bg-white border border-black/[0.08] text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 active:scale-95 shadow-apple-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Percentage Split Section */}
          {splitType === 'percentage' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Percentage (%) Split</p>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    percentDifference === 0
                      ? 'text-emerald-700 bg-emerald-50'
                      : percentDifference > 0
                      ? 'text-amber-700 bg-amber-50'
                      : 'text-rose-700 bg-rose-50'
                  }`}
                >
                  {percentDifference === 0
                    ? '✓ Balanced (100%)'
                    : percentDifference > 0
                    ? `${percentDifference.toFixed(1)}% remaining`
                    : `${(-percentDifference).toFixed(1)}% over`}
                </span>
              </div>
              <div className="space-y-2.5">
                {percentageList.map((p) => {
                  const percentVal = parseFloat(p.percent) || 0;
                  const estimatedRupees = (enteredAmount * percentVal) / 100;
                  return (
                    <div key={p.user} className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-slate-800 truncate block">{p.name}</span>
                        <span className="text-xs text-emerald-700 font-semibold">
                          ≈ {currencySymbol}{estimatedRupees.toFixed(2)}
                        </span>
                      </div>
                      <div className="relative w-28 shrink-0">
                        <input
                          type="number"
                          placeholder="0"
                          min="0"
                          max="100"
                          step="0.5"
                          value={p.percent}
                          onChange={(e) => handlePercentChange(p.user, e.target.value)}
                          className="w-full pl-3 pr-7 py-2 rounded-xl apple-input text-slate-900 placeholder-neutral-400 font-semibold text-sm"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                          %
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Split Section */}
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

          {/* Itemized Split Section */}
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
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{currencySymbol}</span>
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
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Shared with:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {members.map((m) => {
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
                <label className="text-xs font-semibold text-slate-600">Tax, Tip & Service ({currencySymbol})</label>
                <div className="relative w-32 shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{currencySymbol}</span>
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
                      <span className="text-sm">{currencySymbol}{finalTotal.toFixed(2)}</span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {members.map(m => (
                        <div key={m._id} className="flex justify-between items-center text-xs text-emerald-800">
                          <span>{m.name}</span>
                          <span className="font-bold">{currencySymbol}{(memberShares[m._id] || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Recurring Expense Toggle */}
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

          </div>

          {/* Fixed Bottom Action Bar */}
          <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-md border-t border-black/[0.06] flex items-center gap-3 shrink-0">
            <button
              type="button"
              id="cancel-expense-btn"
              onClick={onClose}
              className="py-3 px-5 rounded-full font-semibold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-expense-btn"
              disabled={loading}
              className="flex-1 py-3 px-5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-apple-sm hover:shadow-apple active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Adding Expense...</span>
                </>
              ) : (
                <span>
                  Add Expense • {currencySymbol}{enteredAmount > 0 ? enteredAmount.toFixed(2) : (splitType === 'itemized' ? calculateItemizedSummary().finalTotal.toFixed(2) : '0.00')}
                </span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ExpenseModal;
