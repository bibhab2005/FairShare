import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { fetchGroups, createGroup, deleteGroup } from '../features/groups/api/groupService';
import { fetchBalances } from '../features/groups/api/balanceService';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { GroupCardSkeleton } from '../core/components/SkeletonLoaders';
import Navbar from '../core/components/Navbar';
import GroupCard from '../features/groups/components/GroupCard';
import SettlementHistoryModal from '../features/expenses/components/SettlementHistoryModal';
import { 
  Users, Plus, LogOut, ArrowRight, Wallet, TrendingUp, AlertCircle, 
  Settings, User, HelpCircle, Receipt, IndianRupee, Menu, X, Folders, Loader2, Search,
  Archive, ChevronDown, ChevronUp
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [balancesMap, setBalancesMap] = useState({});
  const [hasExpensesMap, setHasExpensesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [showSettlementsModal, setShowSettlementsModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const loadGroups = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetchGroups();
      const loadedGroups = res.data.groups;
      setGroups(loadedGroups);

      const balancesPromises = loadedGroups.map(async (g) => {
        try {
          const bRes = await fetchBalances(g._id);
          const hasExpenses = bRes.data.balances && bRes.data.balances.length > 0;
          return { groupId: g._id, simplifiedDebts: bRes.data.simplifiedDebts || [], hasExpenses };
        } catch (e) {
          return { groupId: g._id, simplifiedDebts: [], hasExpenses: false };
        }
      });
      const balancesResults = await Promise.all(balancesPromises);
      
      const newBalancesMap = {};
      const newHasExpensesMap = {};
      balancesResults.forEach(r => {
        let netBalance = 0;
        r.simplifiedDebts.forEach(debt => {
          if (debt.from === user?._id) netBalance -= debt.amountPaise;
          if (debt.to === user?._id) netBalance += debt.amountPaise;
        });
        newBalancesMap[r.groupId] = netBalance;
        newHasExpensesMap[r.groupId] = r.hasExpenses;
      });
      setBalancesMap(newBalancesMap);
      setHasExpensesMap(newHasExpensesMap);
      
    } catch (err) {
      if (!isSilent && err?.response?.status !== 401) {
        toast.error('Failed to load groups. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups(false);

    const handleRevalidate = () => {
      if (document.visibilityState === 'visible') {
        loadGroups(true);
      }
    };

    window.addEventListener('focus', handleRevalidate);
    document.addEventListener('visibilitychange', handleRevalidate);

    // Poll every 12s while the dashboard tab is active/visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadGroups(true);
      }
    }, 12000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleRevalidate);
      document.removeEventListener('visibilitychange', handleRevalidate);
    };
  }, [user?._id]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      return toast.error('Group name is required.');
    }

    setCreating(true);
    try {
      await createGroup({ name: newGroupName.trim(), description: newGroupDesc.trim() });
      setShowModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
      toast.success('Group created successfully!');
      await loadGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group.');
    } finally {
      setCreating(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-16 relative z-0 isolate">
          <div className="flex flex-col md:flex-row items-start justify-between mb-16 gap-6">
            <div>
              <div className="h-12 w-48 sm:w-64 bg-slate-200/50 rounded-lg animate-pulse mb-4"></div>
              <div className="h-6 w-64 sm:w-96 bg-slate-200/50 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-12 w-32 bg-slate-200/50 rounded-full animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GroupCardSkeleton />
            <GroupCardSkeleton />
            <GroupCardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  const totalYouOwe = Object.values(balancesMap).reduce((acc, bal) => bal < 0 ? acc + Math.abs(bal) : acc, 0) / 100;
  const totalYouAreOwed = Object.values(balancesMap).reduce((acc, bal) => bal > 0 ? acc + bal : acc, 0) / 100;
  const totalBalance = totalYouAreOwed - totalYouOwe;

  return (
    <div className="font-sans relative">
        <Navbar />
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 relative z-0 isolate">
          <div className="relative mb-12 sm:mb-16">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                  Hello, {user?.name?.split(' ')[0]} 👋
                </h1>
                {user?.username && (
                  <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-700 text-sm font-semibold rounded-full border border-emerald-500/20">
                    @{user.username}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-base sm:text-lg max-w-xl">
                Here's where you stand with your shared expenses.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
              <button
                id="create-group-btn"
                onClick={() => setShowModal(true)}
                className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold px-5 sm:px-6 py-3.5 rounded-full shadow-apple-xs hover:shadow-apple active:scale-95 transition-all text-sm sm:text-base select-none"
              >
                <Plus size={18} className="shrink-0" />
                <span className="whitespace-nowrap">New Group</span>
              </button>
              <button
                onClick={() => setShowSettlementsModal(true)}
                className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 apple-glass hover:bg-white text-slate-700 font-semibold px-5 py-3.5 rounded-full border border-black/[0.08] shadow-apple-xs active:scale-95 transition-all text-sm sm:text-base select-none"
              >
                <Receipt size={18} className="text-emerald-600 shrink-0" />
                <span className="hidden sm:inline">Settlement History</span>
                <span className="sm:hidden">History</span>
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          {groups.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              <div className="apple-card-surface p-6 sm:p-7 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-slate-500 font-semibold text-sm">Total Balance</span>
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shadow-apple-xs">
                    <IndianRupee size={20} className="text-slate-600" />
                  </div>
                </div>
                <div>
                  <div className={`text-3xl sm:text-4xl font-bold tracking-tight ${totalBalance > 0 ? 'text-emerald-600' : totalBalance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {totalBalance > 0 ? '+' : ''}{totalBalance < 0 ? '-' : ''}₹{Math.abs(totalBalance).toFixed(2)}
                  </div>
                  <span className="text-xs sm:text-sm text-slate-400 mt-1.5 block font-medium">Across all groups</span>
                </div>
              </div>

              <div className="apple-card-surface p-6 sm:p-7 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-slate-500 font-semibold text-sm">You Owe</span>
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-apple-xs">
                    <AlertCircle size={20} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                    ₹{totalYouOwe.toFixed(2)}
                  </div>
                  <span className="text-xs sm:text-sm text-rose-600 mt-1.5 block font-semibold">To be paid</span>
                </div>
              </div>

              <div className="apple-card-surface p-6 sm:p-7 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-slate-500 font-semibold text-sm">You are Owed</span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-apple-xs">
                    <ArrowRight size={20} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                    ₹{totalYouAreOwed.toFixed(2)}
                  </div>
                  <span className="text-xs sm:text-sm text-emerald-600 mt-1.5 block font-semibold">To be collected</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-16 md:p-24 flex flex-col items-center gap-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-100 shadow-sm">
              <Folders size={32} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-medium text-slate-900 tracking-tight">No groups yet</h2>
              <p className="text-slate-500 mt-2">
                Create a group to start splitting expenses.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <button
                id="create-first-group-btn"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium px-8 py-4 rounded-full hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus size={18} />
                Create your first group
              </button>
              <button
                onClick={() => setShowSettlementsModal(true)}
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-6 py-4 rounded-full transition-all duration-200"
              >
                <Receipt size={18} className="text-emerald-600" />
                Settlement History
              </button>
            </div>
          </div>
        ) : (
          <div>
            {(() => {
              const activeGroups = groups.filter((g) => !g.isArchived);
              const archivedGroups = groups.filter((g) => g.isArchived);

              return (
                <div className="space-y-12">
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-xs font-semibold text-neutral-400 tracking-widest uppercase">
                        ACTIVE GROUPS ({activeGroups.length})
                      </span>
                      <span className="text-sm text-neutral-400 font-medium">
                        {activeGroups.length} {activeGroups.length === 1 ? 'group' : 'groups'}
                      </span>
                    </div>

                    {activeGroups.length === 0 ? (
                      <div className="p-8 text-center bg-black/[0.02] rounded-3xl border border-black/[0.04]">
                        <p className="text-sm text-slate-500 font-medium">No active groups. All groups are archived or create a new one!</p>
                      </div>
                    ) : (
                      <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.1 }}
                      >
                        {activeGroups.map((group, idx) => {
                          const netBalance = balancesMap[group._id] || 0;
                          const netBalanceRupees = netBalance / 100;
                          
                          return (
                            <Link key={group._id} to={`/groups/${group._id}`}>
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                              >
                                <GroupCard 
                                  groupName={group.name}
                                  members={group.members.length}
                                  date={new Date(group.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                  status={
                                    !hasExpensesMap[group._id] ? "No expenses" :
                                    netBalanceRupees > 0 ? `Gets back ₹${netBalanceRupees}` : 
                                    netBalanceRupees < 0 ? `Owes ₹${Math.abs(netBalanceRupees)}` : 
                                    "Settled up"
                                  }
                                  statusType={
                                    !hasExpensesMap[group._id] ? "settled" :
                                    netBalanceRupees > 0 ? 'owed' : 
                                    netBalanceRupees < 0 ? 'owe' : 
                                    'settled'
                                  }
                                  imageUrl={group.imageUrl}
                                />
                              </motion.div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </div>

                  {archivedGroups.length > 0 && (
                    <div className="pt-6 border-t border-black/[0.06]">
                      <button
                        onClick={() => setShowArchived(!showArchived)}
                        className="flex items-center justify-between w-full p-4 rounded-2xl apple-glass-card border border-black/[0.06] hover:bg-black/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                            <Archive size={18} />
                          </div>
                          <div className="text-left">
                            <span className="font-bold text-slate-800 text-sm block">Archived Trips</span>
                            <span className="text-xs text-slate-400">
                              {archivedGroups.length} {archivedGroups.length === 1 ? 'trip' : 'trips'} frozen & settled
                            </span>
                          </div>
                        </div>
                        <div className="p-2 text-slate-400">
                          {showArchived ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {showArchived && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                          >
                            {archivedGroups.map((group) => {
                              return (
                                <Link key={group._id} to={`/groups/${group._id}`} className="opacity-80 hover:opacity-100 transition-opacity">
                                  <GroupCard 
                                    groupName={group.name}
                                    members={group.members.length}
                                    date={new Date(group.createdAt).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                    status="Archived · Read-Only"
                                    statusType="settled"
                                    imageUrl={group.imageUrl}
                                  />
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md" 
              onClick={() => setShowModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-md apple-glass-card border border-white/80 shadow-apple-lg rounded-[2.25rem] p-7 sm:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create a Group</h2>
                  <p className="text-slate-500 text-sm mt-0.5 font-medium">Start tracking split expenses together</p>
                </div>
                <button
                  id="close-modal-btn"
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-black/[0.05] active:scale-90 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form id="create-group-form" onSubmit={handleCreateGroup} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Group Name</label>
                  <input
                    id="group-name-input"
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Trip to Goa, Flatmates..."
                    className="w-full px-4 py-3.5 rounded-2xl apple-input text-slate-900 placeholder-neutral-400 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Description <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="group-desc-input"
                    type="text"
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="What's this group for?"
                    className="w-full px-4 py-3.5 rounded-2xl apple-input text-slate-900 placeholder-neutral-400 font-medium"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    id="confirm-create-group-btn"
                    disabled={creating}
                    className="w-full inline-flex items-center justify-center py-3.5 rounded-full font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-apple-xs hover:shadow-apple active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {creating ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      'Create Group'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SettlementHistoryModal
        isOpen={showSettlementsModal}
        onClose={() => setShowSettlementsModal(false)}
      />
    </div>
  );
};

export default Dashboard;
