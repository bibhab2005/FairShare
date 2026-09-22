import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchGroupById, addMemberToGroup, deleteGroup, updateGroup, removeMemberFromGroup } from '../features/groups/api/groupService';
import { fetchExpenses, deleteExpense } from '../features/expenses/api/expenseService';
import { fetchBalances } from '../features/groups/api/balanceService';
import { useAuth } from '../features/auth/context/AuthContext';
import Navbar from '../core/components/Navbar';
import ExpenseModal from '../features/expenses/components/ExpenseModal';
import BalanceSummary from '../features/groups/components/BalanceSummary';
import ConfirmModal from '../core/components/ConfirmModal';
import { formatPaise } from '../core/utils/formatCurrency';
import {
  Plus, Trash2, ArrowLeft, Users, UserPlus, AlertCircle,
  Loader2, IndianRupee, CheckCircle2, X, ChevronDown, ChevronUp, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ExpenseRowSkeleton, BalanceCardSkeleton } from '../core/components/SkeletonLoaders';
import SpendingChart from '../features/expenses/components/SpendingChart';
import AnimatedEmptyState from '../core/components/AnimatedEmptyState';
import emptyStateAnim from '../../public/assets/empty-box.json';



const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [simplifiedDebts, setSimplifiedDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState('');

  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [updatingGroup, setUpdatingGroup] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [showBalances, setShowBalances] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [groupRes, expenseRes, balanceRes] = await Promise.all([
        fetchGroupById(id),
        fetchExpenses(id),
        fetchBalances(id),
      ]);
      setGroup(groupRes.data.group);
      setExpenses(expenseRes.data.expenses);
      setBalances(balanceRes.data.balances);
      setSimplifiedDebts(balanceRes.data.simplifiedDebts);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        navigate('/');
      } else {
        toast.error('Failed to load group data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return toast.error('Email is required.');
    setAddingMember(true);
    try {
      await addMemberToGroup(id, memberEmail.trim());
      toast.success(`${memberEmail} added successfully!`);
      setMemberEmail('');
      setShowAddMember(false);
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setAddingMember(false);
    }
  };

  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, type: null, targetId: null, targetName: null });
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const executeConfirmAction = async () => {
    setIsConfirmLoading(true);
    try {
      if (confirmConfig.type === 'expense') {
        await deleteExpense(confirmConfig.targetId);
        setExpenses((prev) => prev.filter((e) => e._id !== confirmConfig.targetId));
        toast.success('Expense deleted');
        const res = await fetchBalances(id);
        setBalances(res.data.balances);
        setSimplifiedDebts(res.data.simplifiedDebts);
      } else if (confirmConfig.type === 'group') {
        await deleteGroup(id);
        toast.success('Group deleted.');
        navigate('/dashboard');
        return; // skip state reset if navigating away
      } else if (confirmConfig.type === 'member') {
        await removeMemberFromGroup(id, confirmConfig.targetId);
        toast.success(`${confirmConfig.targetName} removed from the group.`);
        await loadAll();
      }
      setConfirmConfig({ isOpen: false, type: null, targetId: null, targetName: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const handleDelete = (expenseId) => {
    setConfirmConfig({ isOpen: true, type: 'expense', targetId: expenseId, targetName: null });
  };

  const handleDeleteGroup = () => {
    setConfirmConfig({ isOpen: true, type: 'group', targetId: id, targetName: group?.name });
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return toast.error('Group name is required.');
    setUpdatingGroup(true);
    try {
      await updateGroup(id, { name: editName.trim(), description: editDesc.trim() });
      toast.success('Group updated successfully!');
      setShowEditGroup(false);
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update group.');
    } finally {
      setUpdatingGroup(false);
    }
  };

  const [expandedExpenseId, setExpandedExpenseId] = useState(null);

  const handleRemoveMember = (memberId, memberName) => {
    setConfirmConfig({ isOpen: true, type: 'member', targetId: memberId, targetName: memberName });
  };

  const isCreator = group?.createdBy?._id === user?._id;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-0 isolate">
          <div className="flex flex-col md:flex-row items-start justify-between mb-12 gap-6">
            <div className="h-12 w-64 bg-slate-200 rounded-lg animate-pulse mb-4"></div>
            <div className="flex gap-3">
              <div className="h-12 w-32 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="h-12 w-32 bg-slate-200 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-3">
              <ExpenseRowSkeleton />
              <ExpenseRowSkeleton />
              <ExpenseRowSkeleton />
            </div>
            <div>
              <BalanceCardSkeleton />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!group) return null;

  const totalSpent = expenses
    .filter((e) => !e.isSettlement)
    .reduce((sum, e) => sum + e.amountPaise, 0);

  const actualExpensesCount = expenses.filter(e => !e.isSettlement).length;

  return (
    <div className="font-sans relative">
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 relative z-0 isolate">
          <div className="mb-12">
            <Link
              to="/"
              id="back-to-dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 -ml-4 rounded-full text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-200 mb-6"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tighter text-slate-900">{group.name}</h1>
                  <button
                    onClick={() => {
                      setEditName(group.name);
                      setEditDesc(group.description || '');
                      setShowEditGroup(true);
                    }}
                    className="p-2 mt-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                    title="Edit Group"
                  >
                    <Edit2 size={20} />
                  </button>
                </div>
                {group.description && (
                  <p className="text-slate-600 text-lg mt-2">{group.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-6">
                  <span className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Users size={16} className="text-slate-400" />
                    {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <IndianRupee size={16} className="text-slate-400" />
                    {actualExpensesCount} expenses
                  </span>
                  <span className="text-sm text-slate-500 font-medium">
                    Total:{' '}
                    <span className="text-slate-900">{formatPaise(totalSpent)}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {group.members.map(member => (
                    <button
                      key={member._id}
                      onClick={() => handleRemoveMember(member._id, member.name)}
                      disabled={member._id === user?._id}
                      title={member._id === user?._id ? "You cannot remove yourself" : `Click to remove ${member.name}`}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm ${
                        member._id === user?._id 
                          ? 'bg-slate-100 text-slate-600 cursor-default'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-700'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      {member._id === user?._id ? 'You' : member.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 shrink-0">
                <button
                  id="add-member-toggle-btn"
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors duration-200 shadow-sm"
                >
                  <UserPlus size={18} />
                  Add Member
                </button>
                <button
                  id="add-expense-btn"
                  onClick={() => setShowExpenseModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Plus size={18} />
                  Add Expense
                </button>
                <button
                  onClick={handleDeleteGroup}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-full font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors duration-200 shadow-sm ml-auto sm:ml-0"
                  title="Delete Group"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
          </div>
        </div>



        {showEditGroup && (
          <div className="bg-white border border-neutral-200 shadow-sm rounded-[2.5rem] p-8 md:p-10 mb-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-medium text-slate-900 tracking-tight">Edit Group</h3>
              <button
                onClick={() => setShowEditGroup(false)}
                className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateGroup} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Group name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 w-full border border-neutral-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm bg-slate-50/50"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="flex-1 w-full border border-neutral-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm bg-slate-50/50 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={updatingGroup}
                  className="px-8 py-4 rounded-full font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm inline-flex items-center gap-2"
                >
                  {updatingGroup ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {showAddMember && (
          <div className="bg-white border border-neutral-200 shadow-sm rounded-[2.5rem] p-8 md:p-10 mb-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-medium text-slate-900 tracking-tight">Add a member</h3>
              <button
                id="close-add-member-btn"
                onClick={() => {
                  setShowAddMember(false);
                  setMemberError('');
                  setMemberSuccess('');
                }}
                className="p-2 rounded-full text-neutral-400 hover:text-slate-900 hover:bg-neutral-200 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>



            <form id="add-member-form" onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-4 mb-8">
              <input
                id="member-email-input"
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="member@example.com"
                className="flex-1 px-6 py-3.5 rounded-full bg-white border border-neutral-200 text-slate-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 shadow-sm"
                required
              />
              <button
                type="submit"
                id="confirm-add-member-btn"
                disabled={addingMember}
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {addingMember ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  'Add Member'
                )}
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-medium tracking-tight text-slate-900">Activity</h2>
              <span className="text-sm font-medium text-neutral-400">{actualExpensesCount} total</span>
            </div>

            {expenses.length > 0 && (
              <div className="mb-8">
                <SpendingChart expenses={expenses} />
              </div>
            )}

            {expenses.length === 0 ? (
              <AnimatedEmptyState 
                animationData={emptyStateAnim}
                title="No expenses added yet"
                description="Add the first expense to start tracking."
                actionButton={
                  <button
                    id="add-first-expense-btn"
                    onClick={() => setShowExpenseModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Plus size={18} />
                    Add first expense
                  </button>
                }
              />
            ) : (
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
              >
                {expenses.map((expense, idx) => {
                  const date = new Date(expense.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  });
                  const myShare = expense.splits.find(
                    (s) => s.user?._id === user?._id || s.user === user?._id
                  );

                  const isExpanded = expandedExpenseId === expense._id;

                  return (
                      <motion.div
                      key={expense._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      id={`expense-row-${expense._id}`}
                      className="overflow-hidden p-4 sm:p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200"
                    >
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedExpenseId(isExpanded ? null : expense._id)}
                      >
                        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                            expense.isSettlement
                              ? 'bg-emerald-50 border-emerald-100'
                              : 'bg-indigo-50 border-indigo-100'
                          }`}>
                            {expense.isSettlement ? (
                              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                            ) : (
                              <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-base sm:text-lg font-medium text-slate-900 truncate tracking-tight">{expense.description}</p>
                            <p className="text-neutral-400 text-xs sm:text-sm mt-0.5 sm:mt-1 truncate">
                              Paid by{' '}
                              <span className="font-medium text-neutral-700">
                                {expense.paidBy?._id === user?._id ? 'you' : expense.paidBy?.name}
                              </span>{' '}
                              <span className="mx-1 opacity-50">·</span> {date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-6 shrink-0 ml-2 sm:ml-4">
                          <div className="text-right shrink-0">
                            <p className="text-base sm:text-lg font-medium text-slate-900 tracking-tight">{formatPaise(expense.amountPaise)}</p>
                            {myShare && !expense.isSettlement && (
                              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 sm:mt-1">
                                You:{' '}
                                <span className="font-medium text-neutral-700">{formatPaise(myShare.amountPaise)}</span>
                              </p>
                            )}
                          </div>
                          <button
                            id={`delete-expense-${expense._id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(expense._id);
                            }}
                            className="p-1.5 sm:p-3 rounded-full text-neutral-400 hover:text-red-600 hover:bg-slate-100 shadow-sm transition-all duration-200"
                          >
                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                          <div className="p-0.5 sm:p-1 rounded-full text-neutral-400">
                            {isExpanded ? <ChevronUp size={18} className="sm:w-5 sm:h-5" /> : <ChevronDown size={18} className="sm:w-5 sm:h-5" />}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-neutral-100"
                          >
                            <p className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wide">
                              {expense.isSettlement ? 'Settlement Details' : 'Split Details'}
                            </p>
                            <div className="grid gap-2">
                              {expense.splits.map((split) => (
                                <div key={split.user?._id || split.user} className="flex justify-between items-center text-sm bg-slate-50 px-4 py-2.5 rounded-xl">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-medium">
                                      {split.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <span className="font-medium text-slate-700">
                                      {expense.isSettlement ? 'Received by ' : ''}
                                      {split.user?._id === user?._id ? 'You' : (split.user?.name || 'Unknown')}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-slate-900">{formatPaise(split.amountPaise)}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>

          <div>
            <button
              id="toggle-balances-btn"
              onClick={() => setShowBalances(!showBalances)}
              className="flex items-center justify-between w-full mb-8 group"
            >
              <h2 className="text-2xl font-medium tracking-tight text-slate-900 group-hover:opacity-70 transition-opacity">Balances</h2>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                {showBalances ? (
                  <ChevronUp size={18} className="text-slate-900" />
                ) : (
                  <ChevronDown size={18} className="text-slate-900" />
                )}
              </div>
            </button>
            {showBalances && (
              <BalanceSummary
                balances={balances}
                simplifiedDebts={simplifiedDebts}
                groupId={id}
                onSettled={loadAll}
              />
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showExpenseModal && (
          <ExpenseModal
            group={group}
            onClose={() => setShowExpenseModal(false)}
            onSuccess={loadAll}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ isOpen: false, type: null, targetId: null, targetName: null })}
        onConfirm={executeConfirmAction}
        isLoading={isConfirmLoading}
        title={
          confirmConfig.type === 'expense' ? 'Delete Expense' :
          confirmConfig.type === 'group' ? 'Delete Group' :
          confirmConfig.type === 'member' ? 'Remove Member' : ''
        }
        message={
          confirmConfig.type === 'expense' ? 'Are you sure you want to delete this expense? This action cannot be undone.' :
          confirmConfig.type === 'group' ? `Are you sure you want to delete "${confirmConfig.targetName}"? This will also delete all its expenses and cannot be undone.` :
          confirmConfig.type === 'member' ? `Are you sure you want to remove ${confirmConfig.targetName} from the group?` : ''
        }
        confirmText={
          confirmConfig.type === 'expense' ? 'Delete' :
          confirmConfig.type === 'group' ? 'Delete Group' :
          confirmConfig.type === 'member' ? 'Remove' : 'Confirm'
        }
      />
      </div>
    </div>
  );
};

export default GroupDetails;
