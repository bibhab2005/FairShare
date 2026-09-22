import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatPaise } from '../../../core/utils/formatCurrency';

const COLORS = ['#10b981', '#14b8a6', '#0ea5e9', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316'];

const SpendingChart = ({ expenses }) => {
  if (!expenses || expenses.length === 0) return null;

  // Aggregate spending by user
  const spendingMap = {};
  
  expenses.forEach((expense) => {
    if (expense.isSettlement) return;
    
    // Total cost
    const totalAmount = expense.amountPaise;
    
    // Who paid it? Add to their "paid" total if we want to show who paid, 
    // OR show how much each person consumed. Let's show who paid what.
    if (expense.splits && Array.isArray(expense.splits)) {
      expense.splits.forEach((split) => {
        const consumerName = split.user?.name || 'Unknown';
        if (!spendingMap[consumerName]) {
          spendingMap[consumerName] = 0;
        }
        spendingMap[consumerName] += split.amountPaise;
      });
    }
  });

  const data = Object.keys(spendingMap).map((name) => ({
    name,
    value: spendingMap[name],
  })).sort((a, b) => b.value - a.value); // Sort descending

  if (data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/60 backdrop-blur-lg border border-white/40 p-3 rounded-xl shadow-lg">
          <p className="font-medium text-slate-900 mb-1">{data.name}</p>
          <p className="text-emerald-600 font-semibold">{formatPaise(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/60 backdrop-blur-lg border border-white/40 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 sm:gap-8">
      <div className="w-full md:w-1/2 h-52 sm:h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="78%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total</span>
          <span className="text-2xl font-semibold text-slate-900 tracking-tight">{formatPaise(total)}</span>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <h3 className="text-xl font-medium tracking-tight text-slate-900 mb-6">Spending Breakdown</h3>
        <div className="space-y-4">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                />
                <span className="font-medium text-neutral-700">{entry.name}</span>
              </div>
              <span className="font-semibold text-slate-900">{formatPaise(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpendingChart;
