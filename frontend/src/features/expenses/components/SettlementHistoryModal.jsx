import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Receipt, 
  CheckCircle2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  ShieldCheck, 
  Clock, 
  Search,
  Loader2,
  Inbox
} from 'lucide-react';
import { fetchMySettlements } from '../api/settlementService';
import { formatPaise } from '../../../core/utils/formatCurrency';
import { useAuth } from '../../auth/context/AuthContext';

const SettlementHistoryModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'paid' | 'all'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSettlements();
    }
  }, [isOpen]);

  const loadSettlements = async () => {
    setLoading(true);
    try {
      const res = await fetchMySettlements();
      setSettlements(res.data.settlements || []);
    } catch (err) {
      console.error('Failed to load settlements', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentUserId = user?._id || user?.id;

  // Filter settlements
  const receivedSettlements = settlements.filter(s => {
    const isReceiver = s.splits.some(split => (split.user?._id || split.user) === currentUserId);
    const payerId = s.paidBy?._id || s.paidBy;
    return isReceiver && payerId !== currentUserId;
  });

  const paidSettlements = settlements.filter(s => {
    const payerId = s.paidBy?._id || s.paidBy;
    return payerId === currentUserId;
  });

  const displayedSettlements = (
    activeTab === 'received' 
      ? receivedSettlements 
      : activeTab === 'paid' 
      ? paidSettlements 
      : settlements
  ).filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const payerName = s.paidBy?.name?.toLowerCase() || '';
    const receiverName = s.splits?.[0]?.user?.name?.toLowerCase() || '';
    const groupName = (s.groupName || s.group?.name || '').toLowerCase();
    return payerName.includes(q) || receiverName.includes(q) || groupName.includes(q);
  });

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-[95vw] md:w-[672px] bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden flex flex-col max-h-[85vh] z-10"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Receipt size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Settlement History
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Permanent 1-to-1 payment records, even if a group card was deleted
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Filters & Search */}
        <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center bg-slate-200/60 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('received')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'received'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft size={15} className={activeTab === 'received' ? 'text-emerald-500' : ''} />
              Received
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === 'received' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-300/50 text-slate-600'
              }`}>
                {receivedSettlements.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('paid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'paid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight size={15} className={activeTab === 'paid' ? 'text-slate-700' : ''} />
              Paid
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === 'paid' ? 'bg-slate-200 text-slate-700' : 'bg-slate-300/50 text-slate-600'
              }`}>
                {paidSettlements.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === 'all' ? 'bg-slate-200 text-slate-700' : 'bg-slate-300/50 text-slate-600'
              }`}>
                {settlements.length}
              </span>
            </button>
          </div>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search person or group..."
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Loading settlement records...</p>
            </div>
          ) : displayedSettlements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 border border-emerald-100">
                <Inbox size={28} />
              </div>
              <h3 className="text-base font-semibold text-slate-800">No settlements found</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {searchQuery 
                  ? 'No settlement matches your search query.' 
                  : activeTab === 'received'
                  ? 'When friends settle up with you, your private 1-to-1 payment records will appear here.'
                  : 'No payment records found under this filter.'}
              </p>
            </div>
          ) : (
            displayedSettlements.map((settlement, idx) => {
              const isReceiver = settlement.splits.some(split => (split.user?._id || split.user) === currentUserId);
              const payer = settlement.paidBy;
              const receiver = settlement.splits?.[0]?.user;
              const dateStr = new Date(settlement.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              const groupLabel = settlement.groupName || settlement.group?.name || 'Archived Group';

              return (
                <motion.div
                  key={settlement._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white border border-slate-100 hover:border-emerald-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      {isReceiver ? (
                        payer?.avatar ? (
                          <img
                            src={payer.avatar}
                            alt={payer.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-emerald-100 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-sm">
                            {payer?.name?.charAt(0).toUpperCase() || 'P'}
                          </div>
                        )
                      ) : (
                        receiver?.avatar ? (
                          <img
                            src={receiver.avatar}
                            alt={receiver.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shadow-sm">
                            {receiver?.name?.charAt(0).toUpperCase() || 'R'}
                          </div>
                        )
                      )}

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isReceiver ? (
                            <>
                              <span className="font-semibold text-slate-900 text-sm">{payer?.name || 'Someone'}</span>
                              <span className="text-xs text-slate-500">paid you</span>
                            </>
                          ) : (
                            <>
                              <span className="text-xs text-slate-500">You paid</span>
                              <span className="font-semibold text-slate-900 text-sm">{receiver?.name || 'Someone'}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {dateStr}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                            <Users size={11} />
                            {groupLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`text-base sm:text-lg font-bold ${
                        isReceiver ? 'text-emerald-600' : 'text-slate-800'
                      }`}>
                        {isReceiver ? '+' : '-'}{formatPaise(settlement.amountPaise)}
                      </span>
                      <div className="flex items-center gap-1 mt-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Settled</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer with Privacy Notice */}
        <div className="p-4 px-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 text-emerald-700">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span className="font-medium text-[11px] sm:text-xs">
              Private 1-to-1 records. Only the receiver and payer can see these settlements.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-800 text-xs font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default SettlementHistoryModal;
