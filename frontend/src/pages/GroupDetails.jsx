import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchGroupById, addMemberToGroup } from '../features/groups/api/groupService';
import { fetchExpenses, deleteExpense } from '../features/expenses/api/expenseService';
import { fetchBalances } from '../features/groups/api/balanceService';
import { useAuth } from '../features/auth/context/AuthContext';
import Navbar from '../core/components/Navbar';
import ExpenseModal from '../features/expenses/components/ExpenseModal';
import BalanceSummary from '../features/groups/components/BalanceSummary';
import { formatPaise } from '../core/utils/formatCurrency';
import {
  Plus, Trash2, ArrowLeft, Users, UserPlus, AlertCircle,
  Loader2, Receipt, CheckCircle2, X, ChevronDown, ChevronUp,
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

  const handleDelete = async (expenseId) => {
    setDeletingId(expenseId);
    try {
      await deleteExpense(expenseId);
      setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
      toast.success('Expense deleted');
      await fetchBalances(id).then((res) => {
        setBalances(res.data.balances);
        setSimplifiedDebts(res.data.simplifiedDebts);
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete expense.');
    } finally {
      setDeletingId(null);
    }
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
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-0 isolate">
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
                <h1 className="text-4xl md:text-5xl font-medium tracking-tighter text-slate-900">{group.name}</h1>
                {group.description && (
                  <p className="text-slate-600 text-lg mt-2">{group.description}</p>
                )}
                <div className="flex items-center gap-6 mt-6">
                  <span className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Users size={16} className="text-slate-400" />
                    {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Receipt size={16} className="text-slate-400" />
                    {actualExpensesCount} expenses
                  </span>
                  <span className="text-sm text-slate-500 font-medium">
                    Total:{' '}
                    <span className="text-slate-900">{formatPaise(totalSpent)}</span>
                  </span>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
              {isCreator && (
                <button
                  id="add-member-toggle-btn"
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors duration-200 shadow-sm"
                >
                  <UserPlus size={18} />
                  Add Member
                </button>
              )}
              <button
                id="add-expense-btn"
                onClick={() => setShowExpenseModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus size={18} />
                Add Expense
              </button>
            </div>
          </div>
        </div>



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

            <div className="flex flex-wrap gap-3">
              {group.members.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 text-sm font-medium text-slate-700 shadow-sm"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-700">
                    {m.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                  {m.name}
                  {m._id === user?._id && (
                    <span className="text-neutral-400 font-normal">(you)</span>
                  )}
                </div>
              ))}
            </div>
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

                  return (
                      <motion.div
                      key={expense._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      id={`expense-row-${expense._id}`}
                      className="flex items-center justify-between p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-5 min-w-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                          expense.isSettlement
                            ? 'bg-emerald-50 border-emerald-100'
                            : 'bg-indigo-50 border-indigo-100'
                        }`}>
                          {expense.isSettlement ? (
                            <CheckCircle2 size={20} className="text-emerald-600" />
                          ) : (
                            <Receipt size={20} className="text-indigo-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-lg font-medium text-slate-900 truncate tracking-tight">{expense.description}</p>
                          <p className="text-neutral-400 text-sm mt-1">
                            Paid by{' '}
                            <span className="font-medium text-neutral-700">
                              {expense.paidBy?._id === user?._id ? 'you' : expense.paidBy?.name}
                            </span>{' '}
                            <span className="mx-1.5 opacity-50">·</span> {date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 shrink-0 ml-4">
                        <div className="text-right">
                          <p className="text-lg font-medium text-slate-900 tracking-tight">{formatPaise(expense.amountPaise)}</p>
                          {myShare && !expense.isSettlement && (
                            <p className="text-sm text-neutral-400 mt-1">
                              You:{' '}
                              <span className="font-medium text-neutral-700">{formatPaise(myShare.amountPaise)}</span>
                            </p>
                          )}
                        </div>
                        {expense.createdBy?._id === user?._id && (
                            <button
                            id={`delete-expense-${expense._id}`}
                            onClick={() => handleDelete(expense._id)}
                            disabled={deletingId === expense._id}
                            className="p-3 rounded-full text-neutral-400 hover:text-red-600 hover:bg-slate-100 shadow-sm transition-all duration-200"
                          >
                            {deletingId === expense._id ? (
                              <Loader2 size={18} className="animate-spin text-slate-400" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        )}
                      </div>
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
      </div>
    </div>
  );
};

export default GroupDetails;
