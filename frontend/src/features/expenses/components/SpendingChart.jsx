import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatPaise } from '../../../core/utils/formatCurrency';

const COLORS = ['#10b981', '#14b8a6', '#0ea5e9', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316'];

const SpendingChart = ({ expenses }) => {
  if (!expenses || expenses.length === 0) return null;

  const spendingMap = {};
  
  expenses.forEach((expense) => {
    if (expense.isSettlement) return;
    
    if (expense.splits && Array.isArray(expense.splits)) {
      expense.splits.forEach((split) => {
        const userId = split.user?._id || split.user?.id || split.user?.name || 'unknown';
        const consumerName = split.user?.name || 'Unknown';
        
        if (!spendingMap[userId]) {
          spendingMap[userId] = { name: consumerName, value: 0 };
        }
        spendingMap[userId].value += split.amountPaise;
      });
    }
  });

  const data = Object.values(spendingMap).sort((a, b) => b.value - a.value); // Sort descending

  if (data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="apple-glass-card border border-white/80 p-3 rounded-2xl shadow-apple-md">
          <p className="font-semibold text-slate-900 text-xs tracking-tight mb-0.5">{data.name}</p>
          <p className="text-emerald-600 font-bold text-sm tracking-tight">{formatPaise(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="apple-glass-card border border-white/80 rounded-[2.25rem] p-6 sm:p-8 shadow-apple-sm flex flex-col md:flex-row items-center gap-6 sm:gap-8 transition-shadow">
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
              minAngle={15}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-85 transition-opacity outline-none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
          <span className="text-base sm:text-xl font-bold text-slate-900 tracking-tight text-center leading-tight break-all">{formatPaise(total)}</span>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-6">Spending Breakdown</h3>
        <div className="space-y-3.5">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between py-1 border-b border-black/[0.03] last:border-0">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full ring-2 ring-white shadow-apple-xs" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                />
                <span className="font-medium text-slate-700 tracking-tight">{entry.name}</span>
              </div>
              <span className="font-semibold text-slate-900 tracking-tight">{formatPaise(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpendingChart;
