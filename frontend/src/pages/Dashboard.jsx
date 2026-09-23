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
  Settings, User, HelpCircle, Receipt, IndianRupee, Menu, X, Folders, Loader2, Search
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
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const loadGroups = async (isMounted) => {
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
      if (isMounted) {
        toast.error('Failed to load groups. Please try again later.');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadGroups(isMounted);
    return () => {
      isMounted = false;
    };
  }, []);

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
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-16 relative z-0 isolate">
          <div className="flex flex-col md:flex-row items-start justify-between mb-16 gap-6">
            <div>
              <div className="h-12 w-48 sm:w-64 bg-neutral-100 rounded-lg animate-pulse mb-4"></div>
              <div className="h-6 w-64 sm:w-96 bg-neutral-100 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-12 w-32 bg-neutral-100 rounded-full animate-pulse"></div>
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
          <div className="relative mb-16">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tighter text-slate-900">
                  Hello, {user?.name?.split(' ')[0]} 👋
                </h1>
                {user?.username && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full border border-emerald-200">
                    @{user.username}
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-lg max-w-xl">
                Here's where you stand with your shared expenses.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
              <button
                id="create-group-btn"
                onClick={() => setShowModal(true)}
                className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium px-4 sm:px-6 py-3 rounded-full hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all duration-300 text-sm sm:text-base"
              >
                <Plus size={18} className="shrink-0" />
                <span className="whitespace-nowrap">New Group</span>
              </button>
              <button
                onClick={() => setShowSettlementsModal(true)}
                className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 bg-white/80 hover:bg-white text-slate-700 font-medium px-4 sm:px-5 py-3 rounded-full border border-slate-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
              >
                <Receipt size={18} className="text-emerald-500 shrink-0" />
                <span className="hidden sm:inline">Settlement History</span>
                <span className="sm:hidden">History</span>
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          {groups.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="bg-white/60 backdrop-blur-lg rounded-[2rem] p-6 border border-white/40 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-slate-600 font-medium">Total Balance</span>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <IndianRupee size={20} className="text-slate-500" />
                  </div>
                </div>
                <div>
                  <div className={`text-3xl font-semibold tracking-tight ${totalBalance > 0 ? 'text-emerald-500' : totalBalance < 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                    {totalBalance > 0 ? '+' : ''}{totalBalance < 0 ? '-' : ''}₹{Math.abs(totalBalance).toFixed(2)}
                  </div>
                  <span className="text-sm text-slate-500 mt-1 block">Across all groups</span>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-lg rounded-[2rem] p-6 border border-white/40 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-slate-600 font-medium">You Owe</span>
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                    <AlertCircle size={20} className="text-rose-500" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-semibold tracking-tight text-slate-900">
                    ₹{totalYouOwe.toFixed(2)}
                  </div>
                  <span className="text-sm text-rose-500 mt-1 block font-medium">To be paid</span>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-lg rounded-[2rem] p-6 border border-white/40 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-slate-600 font-medium">You are Owed</span>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                    <ArrowRight size={20} className="text-emerald-500" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-semibold tracking-tight text-slate-900">
                    ₹{totalYouAreOwed.toFixed(2)}
                  </div>
                  <span className="text-sm text-emerald-500 mt-1 block font-medium">To be collected</span>
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
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-semibold text-neutral-400 tracking-widest uppercase">YOUR GROUPS</span>
              <span className="text-sm text-neutral-400 font-medium">
                {groups.length} {groups.length === 1 ? 'group' : 'groups'}
              </span>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {groups.map((group, idx) => {
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
              className="absolute inset-0 bg-white/80 backdrop-blur-sm" 
              onClick={() => setShowModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white border border-neutral-200 shadow-2xl rounded-[2.5rem] p-8"
            >
              <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-medium text-slate-900 tracking-tight">Create a Group</h2>
              <button
                id="close-modal-btn"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form id="create-group-form" onSubmit={handleCreateGroup} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Group Name</label>
                <input
                  id="group-name-input"
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Trip to Goa, Flatmates..."
                  className="w-full px-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white border border-neutral-200 focus:border-emerald-300 transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Description <span className="text-neutral-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="group-desc-input"
                  type="text"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="What's this group for?"
                  className="w-full px-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white border border-neutral-200 focus:border-emerald-300 transition-all duration-200"
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  id="confirm-create-group-btn"
                  disabled={creating}
                  className="w-full inline-flex items-center justify-center py-3.5 rounded-full font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
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
